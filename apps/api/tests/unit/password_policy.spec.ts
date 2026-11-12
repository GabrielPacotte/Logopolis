import { test } from '@japa/runner'
import { InvalidPasswordError } from '../../app/modules/identity/domain/authentication_errors.js'
import { assertPasswordPolicy } from '../../app/modules/identity/domain/password_policy.js'

test.group('password policy', () => {
  test('accepts a password between 12 and 128 characters', ({ assert }) => {
    assert.doesNotThrow(() => assertPasswordPolicy('twelve-chars'))
    assert.doesNotThrow(() => assertPasswordPolicy('a'.repeat(128)))
  })

  test('rejects passwords outside the documented boundary', ({ assert }) => {
    assert.throws(() => assertPasswordPolicy('short'), InvalidPasswordError)
    assert.throws(() => assertPasswordPolicy('a'.repeat(129)), InvalidPasswordError)
  })
})
