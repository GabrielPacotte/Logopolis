import { createHash, randomBytes, randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import User from '#models/user'
import IdentityToken from '#models/identity_token'
import {
  deliverIdentityMail,
  passwordResetEmail,
  verificationEmail,
} from '../adapters/identity_mailer.js'
import { InvalidTokenError, RateLimitExceededError } from '../domain/authentication_errors.js'
import { assertPasswordPolicy } from '../domain/password_policy.js'

type TokenPurpose = 'verify_email' | 'password_reset'
const TOKEN_TTL_MINUTES = 60
const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15

function normalizedEmail(email: string) {
  return email.trim().toLowerCase()
}

function hashSecret(secret: string) {
  return createHash('sha256').update(secret).digest('hex')
}

/**
 * {email identifies a public authentication action} => {throws RateLimitExceededError after five requests in fifteen minutes for that action and address}
 *
 * Effects: increments the minimal persisted rate-limit counter.
 * Invariants: no password, raw token or existence signal is persisted in this table.
 */
async function assertRateLimit(email: string, action: string) {
  const key = `${action}:${normalizedEmail(email)}`
  const now = DateTime.utc()
  const row = await db.from('identity_rate_limits').where({ key, action }).first()

  if (!row || DateTime.fromJSDate(row.window_started) <= now.minus({ minutes: WINDOW_MINUTES })) {
    await db.from('identity_rate_limits').where({ key, action }).delete()
    await db
      .table('identity_rate_limits')
      .insert({ key, action, attempts: 1, window_started: now.toJSDate() })
    return
  }
  if (row.attempts >= MAX_ATTEMPTS) throw new RateLimitExceededError()
  await db
    .from('identity_rate_limits')
    .where({ key, action })
    .update({ attempts: row.attempts + 1 })
}

/**
 * {a user and supported purpose exist} => {creates one unexpired, single-use hashed token and invalidates pending tokens of the same purpose}
 *
 * Effects: writes only a token digest; returns the sole raw token for immediate mail delivery.
 * Invariants: raw authentication secrets are never persisted or logged.
 */
async function issueToken(user: User, purpose: TokenPurpose): Promise<string> {
  const secret = randomBytes(32).toString('base64url')
  const trx = await db.transaction()
  try {
    await trx
      .from('identity_tokens')
      .where({ user_id: user.id, purpose })
      .whereNull('consumed_at')
      .update({ consumed_at: new Date() })
    await trx.table('identity_tokens').insert({
      id: randomUUID(),
      user_id: user.id,
      purpose,
      secret_hash: hashSecret(secret),
      expires_at: DateTime.utc().plus({ minutes: TOKEN_TTL_MINUTES }).toJSDate(),
      created_at: new Date(),
    })
    await trx.commit()
    return secret
  } catch (error) {
    await trx.rollback()
    throw error
  }
}

/**
 * {token is a raw secret previously issued for purpose} => {returns an active token or throws InvalidTokenError without modifying account state}
 *
 * Refus: expired, consumed, unknown, or mismatched-purpose tokens are rejected.
 * Invariants: comparison is performed on the persisted hash, never a raw stored token.
 */
async function activeToken(token: string, purpose: TokenPurpose) {
  const record = await IdentityToken.query()
    .where({ secretHash: hashSecret(token), purpose })
    .whereNull('consumedAt')
    .where('expiresAt', '>', DateTime.utc().toSQL()!)
    .first()
  if (!record) throw new InvalidTokenError()
  return record
}

/**
 * {email is syntactically valid and password is submitted by an anonymous visitor} => {creates at most one unverified account and prepares a verification email}
 *
 * Refus: an invalid password throws InvalidPasswordError; excessive attempts throw RateLimitExceededError.
 * Invariants: duplicate registrations neither create another account nor expose password/token data.
 */
export async function register(email: string, password: string): Promise<void> {
  assertPasswordPolicy(password)
  const normalized = normalizedEmail(email)
  await assertRateLimit(normalized, 'register')
  const existing = await User.findBy('email', normalized)
  if (existing) return
  const user = await User.create({ email: normalized, passwordHash: password })
  const token = await issueToken(user, 'verify_email')
  await deliverIdentityMail(verificationEmail(user.email, token))
}

/**
 * {raw token was presented by a visitor} => {marks its account verified exactly once and consumes the token}
 *
 * Effects: updates identity_users.email_verified_at and identity_tokens.consumed_at atomically.
 * Invariants: an invalid token cannot verify or mutate an account.
 */
export async function verifyEmail(token: string): Promise<void> {
  const record = await activeToken(token, 'verify_email')
  const trx = await db.transaction()
  try {
    const locked = await trx
      .from('identity_tokens')
      .where('id', record.id)
      .whereNull('consumed_at')
      .first()
    if (!locked) throw new InvalidTokenError()
    await trx
      .from('identity_users')
      .where('id', record.userId)
      .update({ email_verified_at: new Date(), updated_at: new Date() })
    await trx.from('identity_tokens').where('id', record.id).update({ consumed_at: new Date() })
    await trx.commit()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}

/**
 * {email is syntactically valid} => {prepares a replacement verification email only for an existing unverified account, while exposing a neutral result}
 *
 * Effects: may invalidate a preceding verification token and create a new one.
 * Invariants: callers must not infer whether an account exists from this method's public response.
 */
export async function resendVerification(email: string): Promise<void> {
  const normalized = normalizedEmail(email)
  await assertRateLimit(normalized, 'verification_resend')
  const user = await User.findBy('email', normalized)
  if (!user || user.emailVerifiedAt) return
  const token = await issueToken(user, 'verify_email')
  await deliverIdentityMail(verificationEmail(user.email, token))
}

/**
 * {email and password are submitted to log in} => {returns the matching user only when credentials are valid, otherwise null}
 *
 * Refus: invalid credentials and unknown email both return null.
 * Invariants: callers receive no distinction between an absent address and a wrong password.
 */
export async function authenticate(email: string, password: string): Promise<User | null> {
  const normalized = normalizedEmail(email)
  await assertRateLimit(normalized, 'login')
  try {
    return await User.verifyCredentials(normalized, password)
  } catch {
    return null
  }
}

/**
 * {email is syntactically valid} => {prepares one reset email for an existing account while keeping the public outcome neutral}
 *
 * Effects: may replace a pending reset token.
 * Invariants: no raw secret is stored or returned to HTTP callers.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = normalizedEmail(email)
  await assertRateLimit(normalized, 'password_reset')
  const user = await User.findBy('email', normalized)
  if (!user) return
  const token = await issueToken(user, 'password_reset')
  await deliverIdentityMail(passwordResetEmail(user.email, token))
}

/**
 * {a valid unconsumed reset token and a policy-compliant password are supplied} => {replaces the password, consumes the token, increments auth version and invalidates prior sessions}
 *
 * Refus: invalid/expired/replayed tokens and invalid passwords change neither password nor sessions.
 * Effects: deletes persisted sessions tagged to the account.
 * Invariants: reset tokens remain single-use and passwords are delegated to the framework hash hook.
 */
export async function resetPassword(token: string, password: string): Promise<void> {
  assertPasswordPolicy(password)
  const record = await activeToken(token, 'password_reset')
  const user = await User.findOrFail(record.userId)
  user.passwordHash = password
  const trx = await db.transaction()
  try {
    const locked = await trx
      .from('identity_tokens')
      .where('id', record.id)
      .whereNull('consumed_at')
      .first()
    if (!locked) throw new InvalidTokenError()
    user.useTransaction(trx)
    user.authVersion += 1
    await user.save()
    await trx.from('identity_tokens').where('id', record.id).update({ consumed_at: new Date() })
    await trx.from('identity_sessions').where('user_id', user.id).delete()
    await trx.commit()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}
