import { test } from '@japa/runner'
import {
  createAuthenticationService,
  type AuthenticationDependencies,
} from '../../app/modules/identity/application/authentication_service.js'
import { InvalidTokenError } from '../../app/modules/identity/domain/authentication_errors.js'
import type {
  IdentityMailer,
  IdentityRateLimiter,
  IdentityStore,
  IdentityUser,
} from '../../app/modules/identity/application/ports.js'

const user: IdentityUser = {
  id: 'user-1',
  email: 'reader@example.test',
  emailVerifiedAt: null,
  authVersion: 1,
}

function dependencies(overrides: Partial<AuthenticationDependencies> = {}) {
  const sent: Array<{ recipient: string; token: string; purpose: string }> = []
  const store: IdentityStore = {
    findByEmail: async () => null,
    createUser: async () => user,
    authenticate: async () => null,
    issueToken: async () => undefined,
    consumeVerificationToken: async () => null,
    resetPasswordFromToken: async () => false,
  }
  const mailer: IdentityMailer = {
    sendVerification: async (recipient, token) => {
      sent.push({ recipient, token, purpose: 'verify' })
    },
    sendPasswordReset: async (recipient, token) => {
      sent.push({ recipient, token, purpose: 'reset' })
    },
  }
  const rateLimiter: IdentityRateLimiter = { assertWithinLimit: async () => undefined }
  const base: AuthenticationDependencies = {
    clock: {
      now: () => new Date('2026-01-01T00:00:00.000Z'),
      addMinutes: (date, minutes) => new Date(date.getTime() + minutes * 60_000),
    },
    hasher: { hash: async (password) => `hash:${password}` },
    mailer,
    rateLimiter,
    store,
    tokens: { create: () => 'raw-test-token', hash: (secret) => `digest:${secret}` },
    ...overrides,
  }
  return { dependencies: base, sent }
}

test.group('authentication application service', () => {
  test('normalizes an address, hashes the password and sends a verification token through ports', async ({
    assert,
  }) => {
    let created: { email: string; passwordHash: string } | undefined
    const fixture = dependencies({
      store: {
        ...dependencies().dependencies.store,
        createUser: async (email, passwordHash) => {
          created = { email, passwordHash }
          return user
        },
      },
    })
    const service = createAuthenticationService(fixture.dependencies)

    await service.register(' Reader@Example.Test ', 'a-safe-password')

    assert.deepEqual(created, {
      email: 'reader@example.test',
      passwordHash: 'hash:a-safe-password',
    })
    assert.deepEqual(fixture.sent, [
      { recipient: 'reader@example.test', token: 'raw-test-token', purpose: 'verify' },
    ])
  })

  test('keeps a duplicate registration silent and does not issue another token', async ({
    assert,
  }) => {
    const hashed: string[] = []
    const fixture = dependencies({
      store: { ...dependencies().dependencies.store, createUser: async () => null },
      hasher: {
        hash: async (value) => {
          hashed.push(value)
          return `hash:${value}`
        },
      },
    })
    const service = createAuthenticationService(fixture.dependencies)

    await service.register('reader@example.test', 'a-safe-password')

    assert.isEmpty(fixture.sent)
    assert.lengthOf(hashed, 2)
    assert.equal(hashed[1], 'raw-test-token')
  })

  test('performs neutral hash work for absent resend and recovery requests', async ({ assert }) => {
    const hashed: string[] = []
    const fixture = dependencies({
      hasher: {
        hash: async (value) => {
          hashed.push(value)
          return `hash:${value}`
        },
      },
    })
    const service = createAuthenticationService(fixture.dependencies)

    await service.resendVerification('unknown@example.test')
    await service.requestPasswordReset('unknown@example.test')

    assert.deepEqual(hashed, ['raw-test-token', 'raw-test-token'])
    assert.isEmpty(fixture.sent)
  })

  test('rejects a reset token that the transactional persistence port did not consume', async ({
    assert,
  }) => {
    const fixture = dependencies()
    const service = createAuthenticationService(fixture.dependencies)

    await assert.rejects(
      () => service.resetPassword('raw-test-token', 'a-safe-password'),
      InvalidTokenError
    )
  })
})
