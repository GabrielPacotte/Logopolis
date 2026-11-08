import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'
import type { IdentityStore, IdentityUser } from '../application/ports.js'

type UserRow = {
  id: string
  email: string
  email_verified_at: Date | null
  auth_version: number
  password_hash?: string
}

function identityUser(row: UserRow): IdentityUser {
  return {
    id: row.id,
    email: row.email,
    emailVerifiedAt: row.email_verified_at,
    authVersion: row.auth_version,
  }
}

/** PostgreSQL adapter for the identity persistence port. */
export const postgresIdentityStore: IdentityStore = {
  /** {an email exists or not} => {returns its non-secret identity projection or null} */
  async findByEmail(email) {
    const row = (await db.from('identity_users').where('email', email).first()) as
      UserRow | undefined
    return row ? identityUser(row) : null
  },

  /** {a normalized email and a framework-hashed password are supplied} => {creates one account or returns null on a duplicate email} */
  async createUser(email, passwordHash, now) {
    // `ON CONFLICT DO NOTHING` is deliberately preferred to catching a unique
    // violation: PostgreSQL's error detail includes the conflicting e-mail and
    // would otherwise reach the database logger during concurrent registration.
    const rows = await db
      .table('identity_users')
      .insert({
        id: randomUUID(),
        email,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      })
      .onConflict('email')
      .ignore()
      .returning(['id', 'email', 'email_verified_at', 'auth_version'])
    const row = rows[0] as UserRow | undefined
    return row ? identityUser(row) : null
  },

  /** {email and plain password are supplied} => {returns the identity only if the stored hash verifies, otherwise null after comparable password-work} */
  async authenticate(email, password) {
    const row = (await db.from('identity_users').where('email', email).first()) as
      UserRow | undefined
    if (!row?.password_hash) {
      // Keep an unknown address on the expensive password-hashing path as well.
      // The result is discarded and neither password nor address is logged.
      await hash.make(password)
      return null
    }
    if (!(await hash.verify(row.password_hash, password))) return null
    return identityUser(row)
  },

  /** {a token digest and expiry are supplied} => {replaces outstanding same-purpose tokens for the account in one transaction} */
  async issueToken({ userId, purpose, secretHash, expiresAt, now }) {
    await db.transaction(async (trx) => {
      await trx.rawQuery('SELECT pg_advisory_xact_lock(hashtext(?))', [`${userId}:${purpose}`])
      await trx
        .from('identity_tokens')
        .where({ user_id: userId, purpose })
        .whereNull('consumed_at')
        .update({ consumed_at: now })
      await trx.table('identity_tokens').insert({
        id: randomUUID(),
        user_id: userId,
        purpose,
        secret_hash: secretHash,
        expires_at: expiresAt,
        created_at: now,
      })
    })
  },

  /** {a verification digest and current time are supplied} => {atomically consumes one active token and marks only its owner verified} */
  async consumeVerificationToken(secretHash, now) {
    return db.transaction(async (trx) => {
      const consumed = await trx
        .from('identity_tokens')
        .where({ secret_hash: secretHash, purpose: 'verify_email' })
        .whereNull('consumed_at')
        .where('expires_at', '>', now)
        .update({ consumed_at: now }, ['user_id'])
      const token = consumed[0] as { user_id: string } | undefined
      if (!token) return null
      const users = await trx
        .from('identity_users')
        .where('id', token.user_id)
        .update({ email_verified_at: now, updated_at: now }, [
          'id',
          'email',
          'email_verified_at',
          'auth_version',
        ])
      const user = users[0] as UserRow | undefined
      return user ? identityUser(user) : null
    })
  },

  /** {a reset digest, a framework hash and current time are supplied} => {atomically consumes one token, changes its owner's password and removes every stored session} */
  async resetPasswordFromToken({ secretHash, passwordHash, now }) {
    return db.transaction(async (trx) => {
      const consumed = await trx
        .from('identity_tokens')
        .where({ secret_hash: secretHash, purpose: 'password_reset' })
        .whereNull('consumed_at')
        .where('expires_at', '>', now)
        .update({ consumed_at: now }, ['user_id'])
      const token = consumed[0] as { user_id: string } | undefined
      if (!token) return false
      await trx
        .from('identity_users')
        .where('id', token.user_id)
        .update({
          password_hash: passwordHash,
          auth_version: trx.raw('auth_version + 1'),
          updated_at: now,
        })
      await trx.from('identity_sessions').where('user_id', token.user_id).delete()
      return true
    })
  },
}
