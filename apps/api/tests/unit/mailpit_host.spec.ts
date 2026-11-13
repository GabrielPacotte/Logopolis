import { test } from '@japa/runner'
import { isLoopbackMailpitHost } from '../../app/modules/identity/adapters/identity_mailer.js'

test.group('Mailpit development transport', () => {
  test('accepts only local loopback SMTP hosts', ({ assert }) => {
    assert.isTrue(isLoopbackMailpitHost('127.0.0.1'))
    assert.isTrue(isLoopbackMailpitHost('localhost'))
    assert.isTrue(isLoopbackMailpitHost('::1'))
  })

  test('rejects remote SMTP hosts so development tokens stay on the local machine', ({
    assert,
  }) => {
    assert.isFalse(isLoopbackMailpitHost('mailpit.example.test'))
    assert.isFalse(isLoopbackMailpitHost('192.0.2.10'))
  })
})
