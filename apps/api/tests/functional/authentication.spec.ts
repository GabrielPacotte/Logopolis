import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'

function tokenFromLastEmail(fakeMailer: ReturnType<typeof mail.fake>) {
  const message = fakeMailer.messages.sent().at(-1)!
  const match = String(message.nodeMailerMessage.text).match(/[?&]token=([^\s]+)/)
  if (!match) throw new Error('Expected an identity token in test email')
  const token = match[1]
  if (!token) throw new Error('Expected a non-empty identity token in test email')
  return decodeURIComponent(token)
}

test.group('email and password authentication', (group) => {
  let fakeMailer: ReturnType<typeof mail.fake>

  group.each.setup(async () => {
    await db.from('identity_tokens').delete()
    await db.from('identity_users').delete()
    await db.from('identity_rate_limits').delete()
    fakeMailer = mail.fake()
  })

  group.each.teardown(() => mail.restore())

  test('registers an unverified account without persisting a clear-text password', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post('/auth/register')
      .withCsrfToken()
      .json({ email: 'reader@example.test', password: 'a-safe-password' })

    response.assertStatus(202)
    const user = await db.from('identity_users').where('email', 'reader@example.test').first()
    assert.exists(user)
    assert.notEqual(user.password_hash, 'a-safe-password')
    const token = await db.from('identity_tokens').where('user_id', user.id).first()
    assert.exists(token)
    assert.notExists(token.secret_hash.match(/a-safe-password/))
    fakeMailer.messages.assertSentCount(1)
  })

  test('refuses a protected route without a session', async ({ client }) => {
    const response = await client.get('/auth/me')
    response.assertStatus(401)
  })

  test('verifies a token once and rejects its replay', async ({ client, assert }) => {
    const registration = await client
      .post('/auth/register')
      .withCsrfToken()
      .json({ email: 'verified@example.test', password: 'a-safe-password' })
    registration.assertStatus(202)

    const token = tokenFromLastEmail(fakeMailer)
    const verification = await client.get('/auth/verify-email').qs({ token })
    verification.assertStatus(204)
    const replay = await client.get('/auth/verify-email').qs({ token })
    replay.assertStatus(422)
    const user = await db.from('identity_users').where('email', 'verified@example.test').first()
    assert.exists(user.email_verified_at)
  })

  test('keeps password recovery responses neutral and rejects an invalid token', async ({
    client,
  }) => {
    const known = await client
      .post('/auth/password-reset')
      .withCsrfToken()
      .json({ email: 'unknown@example.test' })
    const unknown = await client
      .post('/auth/password-reset')
      .withCsrfToken()
      .json({ email: 'also-unknown@example.test' })

    known.assertStatus(202)
    unknown.assertStatus(202)
    known.assertBody(unknown.body())
    const invalidReset = await client
      .post('/auth/password-reset/confirm')
      .withCsrfToken()
      .json({ token: 'invalid-token-that-is-long-enough', password: 'a-new-safe-password' })
    invalidReset.assertStatus(422)
  })
})
