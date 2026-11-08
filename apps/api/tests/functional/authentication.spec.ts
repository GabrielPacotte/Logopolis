import { createHash } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import type { ApiClient } from '@japa/api-client'
import { test } from '@japa/runner'
import {
  clearTestOutbox,
  getTestOutbox,
  type IdentityMail,
} from '../../app/modules/identity/adapters/identity_mailer.js'

const testPassphrase = 'a-safe-password'
const replacementPassphrase = 'a-new-safe-password'

function tokenFromLastEmail(message: IdentityMail): string {
  const match = message.text.match(/[?&]token=([^\s]+)/)
  if (!match?.[1]) throw new Error('Expected a non-empty identity token in test email')
  return decodeURIComponent(match[1])
}

async function register(client: ApiClient, email: string): Promise<void> {
  const response = await client
    .post('/auth/register')
    .withCsrfToken()
    .json({ email, password: testPassphrase })
  response.assertStatus(202)
}

test.group('email and password authentication', (group) => {
  group.each.setup(async () => {
    await db.from('identity_sessions').delete()
    await db.from('identity_tokens').delete()
    await db.from('identity_users').delete()
    await db.from('identity_rate_limits').delete()
    clearTestOutbox()
  })

  test('registers an unverified account without persisting a clear-text password', async ({
    client,
    assert,
  }) => {
    await register(client, 'reader@example.test')
    const user = await db.from('identity_users').where('email', 'reader@example.test').first()
    assert.exists(user)
    assert.notEqual(user.password_hash, testPassphrase)
    const token = await db.from('identity_tokens').where('user_id', user.id).first()
    assert.exists(token)
    assert.notExists(token.secret_hash.match(/safe-password/))
    assert.lengthOf(getTestOutbox(), 1)
  })

  test('rejects state-changing requests without CSRF protection', async ({ client }) => {
    const response = await client
      .post('/auth/register')
      .json({ email: 'csrf@example.test', password: testPassphrase })
    response.assertStatus(403)
    const user = await db.from('identity_users').where('email', 'csrf@example.test').first()
    if (user) throw new Error('A request rejected by CSRF must not create an account')
  })

  test('verifies once, rejects replay, expiry and concurrent use', async ({ client, assert }) => {
    await register(client, 'verified@example.test')
    const first = tokenFromLastEmail(getTestOutbox().at(-1)!)
    const [one, two] = await Promise.all([
      client.get('/auth/verify-email').qs({ token: first }),
      client.get('/auth/verify-email').qs({ token: first }),
    ])
    assert.sameMembers([one.status(), two.status()], [204, 422])
    const replay = await client.get('/auth/verify-email').qs({ token: first })
    replay.assertStatus(422)

    await register(client, 'expired@example.test')
    const expired = tokenFromLastEmail(getTestOutbox().at(-1)!)
    await db
      .from('identity_tokens')
      .where('secret_hash', createHash('sha256').update(expired).digest('hex'))
      .update({ expires_at: new Date(Date.now() - 60_000) })
    const expiredResponse = await client.get('/auth/verify-email').qs({ token: expired })
    expiredResponse.assertStatus(422)
  })

  test('replaces a verification token on resend and keeps the old token invalid', async ({
    client,
    assert,
  }) => {
    await register(client, 'resend@example.test')
    const original = tokenFromLastEmail(getTestOutbox().at(-1)!)
    const resend = await client
      .post('/auth/verification-email')
      .withCsrfToken()
      .json({ email: 'resend@example.test' })
    resend.assertStatus(202)
    const replacement = tokenFromLastEmail(getTestOutbox().at(-1)!)
    const oldAttempt = await client.get('/auth/verify-email').qs({ token: original })
    oldAttempt.assertStatus(422)
    const currentAttempt = await client.get('/auth/verify-email').qs({ token: replacement })
    currentAttempt.assertStatus(204)

    await register(client, 'concurrent-resend@example.test')
    const concurrentResponses = await Promise.all(
      Array.from({ length: 2 }, () =>
        client
          .post('/auth/verification-email')
          .withCsrfToken()
          .json({ email: 'concurrent-resend@example.test' })
      )
    )
    concurrentResponses.forEach((response) => response.assertStatus(202))
    const concurrentUser = await db
      .from('identity_users')
      .where('email', 'concurrent-resend@example.test')
      .first()
    const activeTokens = await db
      .from('identity_tokens')
      .where({ user_id: concurrentUser.id, purpose: 'verify_email' })
      .whereNull('consumed_at')
    assert.lengthOf(activeTokens, 1)
  })

  test('creates a server session on valid login and rejects invalid credentials neutrally', async ({
    client,
  }) => {
    await register(client, 'login@example.test')
    const invalidEmail = await client
      .post('/auth/login')
      .withCsrfToken()
      .json({ email: 'missing@example.test', password: testPassphrase })
    const invalidPassword = await client
      .post('/auth/login')
      .withCsrfToken()
      .json({ email: 'login@example.test', password: replacementPassphrase })
    invalidEmail.assertStatus(401)
    invalidPassword.assertStatus(401)
    invalidEmail.assertBody(invalidPassword.body())

    const login = await client
      .post('/auth/login')
      .withCsrfToken()
      .json({ email: 'login@example.test', password: testPassphrase })
    login.assertStatus(200)
    login.assertSession('identity.authVersion', 1)
    const protectedRoute = await client.get('/auth/me').withSession(login.session())
    protectedRoute.assertStatus(200)
    const logout = await client.post('/auth/logout').withCsrfToken().withSession(login.session())
    logout.assertStatus(204)
    const afterLogout = await client.get('/auth/me').withSession(logout.session())
    afterLogout.assertStatus(401)
  })

  test('keeps recovery responses neutral for an existing and an unknown address', async ({
    client,
    assert,
  }) => {
    await register(client, 'known@example.test')
    clearTestOutbox()
    const known = await client
      .post('/auth/password-reset')
      .withCsrfToken()
      .json({ email: 'known@example.test' })
    const unknown = await client
      .post('/auth/password-reset')
      .withCsrfToken()
      .json({ email: 'unknown@example.test' })
    known.assertStatus(202)
    unknown.assertStatus(202)
    known.assertBody(unknown.body())
    assert.lengthOf(getTestOutbox(), 1)
  })

  test('resets a password once, invalidates sessions, rejects replay and allows the replacement password', async ({
    client,
    assert,
  }) => {
    await register(client, 'reset@example.test')
    const user = await db.from('identity_users').where('email', 'reset@example.test').first()
    await db.table('identity_sessions').insert({
      id: 'session-to-invalidate',
      user_id: user.id,
      data: '{}',
      expires_at: new Date(Date.now() + 60_000),
    })
    clearTestOutbox()
    const requested = await client
      .post('/auth/password-reset')
      .withCsrfToken()
      .json({ email: 'reset@example.test' })
    requested.assertStatus(202)
    const token = tokenFromLastEmail(getTestOutbox().at(-1)!)
    const reset = await client
      .post('/auth/password-reset/confirm')
      .withCsrfToken()
      .json({ token, password: replacementPassphrase })
    reset.assertStatus(204)
    assert.notExists(await db.from('identity_sessions').where('user_id', user.id).first())
    const replay = await client
      .post('/auth/password-reset/confirm')
      .withCsrfToken()
      .json({ token, password: testPassphrase })
    replay.assertStatus(422)
    const oldLogin = await client
      .post('/auth/login')
      .withCsrfToken()
      .json({ email: 'reset@example.test', password: testPassphrase })
    oldLogin.assertStatus(401)
    const newLogin = await client
      .post('/auth/login')
      .withCsrfToken()
      .json({ email: 'reset@example.test', password: replacementPassphrase })
    newLogin.assertStatus(200)
  })

  test('enforces PostgreSQL quotas atomically for registration and confirmation', async ({
    client,
    assert,
  }) => {
    const attempts = await Promise.all(
      Array.from({ length: 6 }, () =>
        client
          .post('/auth/register')
          .withCsrfToken()
          .json({ email: 'quota@example.test', password: testPassphrase })
      )
    )
    assert.lengthOf(
      attempts.filter((response) => response.status() === 202),
      5
    )
    assert.lengthOf(
      attempts.filter((response) => response.status() === 429),
      1
    )

    const confirmations = await Promise.all(
      Array.from({ length: 6 }, () =>
        client
          .post('/auth/password-reset/confirm')
          .withCsrfToken()
          .json({ token: 'invalid-token-that-is-long-enough', password: testPassphrase })
      )
    )
    assert.lengthOf(
      confirmations.filter((response) => response.status() === 422),
      5
    )
    assert.lengthOf(
      confirmations.filter((response) => response.status() === 429),
      1
    )
  })
})
