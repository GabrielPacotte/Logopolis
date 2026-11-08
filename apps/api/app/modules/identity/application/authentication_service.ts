import { InvalidTokenError } from '../domain/authentication_errors.js'
import { assertPasswordPolicy } from '../domain/password_policy.js'
import type {
  Clock,
  IdentityMailer,
  IdentityRateLimiter,
  IdentitySession,
  IdentityStore,
  IdentityUser,
  PasswordHasher,
  TokenPurpose,
  TokenService,
} from './ports.js'

const TOKEN_TTL_MINUTES = 60

export type AuthenticationDependencies = {
  clock: Clock
  hasher: PasswordHasher
  mailer: IdentityMailer
  rateLimiter: IdentityRateLimiter
  store: IdentityStore
  tokens: TokenService
}

export type AuthenticationService = {
  register(email: string, password: string): Promise<void>
  verifyEmail(token: string): Promise<void>
  resendVerification(email: string): Promise<void>
  login(email: string, password: string, session: IdentitySession): Promise<IdentityUser | null>
  logout(session: IdentitySession): Promise<void>
  requestPasswordReset(email: string): Promise<void>
  resetPassword(token: string, password: string): Promise<void>
}

/**
 * {email is a user-supplied address} => {returns its trimmed, lower-case comparison form}
 *
 * Effects: none.
 * Invariants: normalization is applied consistently before identity lookup and rate limiting.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * {configured ports implement their stated transactional guarantees} => {returns use cases that never import infrastructure or framework services}
 *
 * Effects: delegated exclusively through ports.
 * Invariants: application code does not receive a database connection, mail client, system clock or crypto implementation.
 */
export function createAuthenticationService({
  clock,
  hasher,
  mailer,
  rateLimiter,
  store,
  tokens,
}: AuthenticationDependencies): AuthenticationService {
  /**
   * {an existing user and supported purpose are supplied} => {invalidates pending tokens of that purpose and returns one newly issued raw token}
   *
   * Effects: persists only the token digest.
   * Invariants: the raw token is neither stored nor logged by this use case.
   */
  async function issueToken(user: IdentityUser, purpose: TokenPurpose): Promise<string> {
    const secret = tokens.create()
    const now = clock.now()
    await store.issueToken({
      userId: user.id,
      purpose,
      secretHash: tokens.hash(secret),
      expiresAt: clock.addMinutes(now, TOKEN_TTL_MINUTES),
      now,
    })
    return secret
  }

  /**
   * {an unauthenticated address has no eligible account} => {performs the same password-hash class of work used by an eligible identity flow without issuing a usable token}
   *
   * Effects: consumes bounded CPU only; no account, token, session or mail state is changed.
   * Invariants: the generated value is never persisted, returned or logged.
   */
  async function performNeutralIdentityWork(): Promise<void> {
    await hasher.hash(tokens.create())
  }

  return {
    /**
     * {email is syntactically valid and password is submitted by an anonymous visitor} => {creates at most one unverified account and prepares a verification email}
     *
     * Refus: password-policy and rate-limit errors propagate; duplicate registrations remain neutral.
     * Invariants: password hashing and persistence happen only behind ports.
     */
    async register(email, password) {
      assertPasswordPolicy(password)
      const normalized = normalizeEmail(email)
      await rateLimiter.assertWithinLimit({
        subject: normalized,
        action: 'register',
        now: clock.now(),
      })
      const user = await store.createUser(normalized, await hasher.hash(password), clock.now())
      if (!user) {
        await performNeutralIdentityWork()
        return
      }
      await mailer.sendVerification(user.email, await issueToken(user, 'verify_email'))
    },

    /**
     * {raw verification token is supplied} => {marks exactly one account verified or rejects without changing account state}
     *
     * Refus: expired, unknown and replayed tokens throw InvalidTokenError.
     * Invariants: atomic token consumption is delegated to the persistence port.
     */
    async verifyEmail(token) {
      const secretHash = tokens.hash(token)
      await rateLimiter.assertWithinLimit({
        subject: secretHash,
        action: 'verify_email',
        now: clock.now(),
      })
      const user = await store.consumeVerificationToken(secretHash, clock.now())
      if (!user) throw new InvalidTokenError()
    },

    /**
     * {email is syntactically valid} => {may send a replacement verification token without exposing whether the account exists}
     *
     * Effects: an existing unverified account's pending verification token is replaced.
     * Invariants: callers must expose the same public outcome for every address.
     */
    async resendVerification(email) {
      const normalized = normalizeEmail(email)
      await rateLimiter.assertWithinLimit({
        subject: normalized,
        action: 'verification_resend',
        now: clock.now(),
      })
      const user = await store.findByEmail(normalized)
      if (!user || user.emailVerifiedAt) {
        await performNeutralIdentityWork()
        return
      }
      await mailer.sendVerification(user.email, await issueToken(user, 'verify_email'))
    },

    /**
     * {email and password are submitted with a request-scoped session port} => {establishes a session only for valid credentials and otherwise returns null}
     *
     * Refus: unknown address and incorrect password have the same null outcome.
     * Invariants: authentication state is established only by the request-scoped session adapter.
     */
    async login(email, password, session) {
      const normalized = normalizeEmail(email)
      await rateLimiter.assertWithinLimit({
        subject: normalized,
        action: 'login',
        now: clock.now(),
      })
      const user = await store.authenticate(normalized, password)
      if (!user) return null
      await session.establish(user.id, user.authVersion)
      return user
    },

    /**
     * {a request-scoped authenticated session port is supplied} => {invalidates its current session}
     *
     * Effects: delegates only session termination.
     * Invariants: no identity or token state is changed.
     */
    async logout(session) {
      await session.terminate()
    },

    /**
     * {email is syntactically valid} => {may send one short-lived reset token while preserving a neutral public outcome}
     *
     * Effects: an existing account's pending reset token is replaced.
     * Invariants: no raw token is persisted or returned to an HTTP caller.
     */
    async requestPasswordReset(email) {
      const normalized = normalizeEmail(email)
      await rateLimiter.assertWithinLimit({
        subject: normalized,
        action: 'password_reset',
        now: clock.now(),
      })
      const user = await store.findByEmail(normalized)
      if (!user) {
        await performNeutralIdentityWork()
        return
      }
      await mailer.sendPasswordReset(user.email, await issueToken(user, 'password_reset'))
    },

    /**
     * {a policy-compliant password and raw reset token are supplied} => {replaces credentials once, invalidates previous sessions and consumes the token atomically}
     *
     * Refus: invalid, expired and replayed tokens leave password and sessions unchanged.
     * Invariants: the persistence port commits token consumption, password replacement and session invalidation as one transaction.
     */
    async resetPassword(token, password) {
      assertPasswordPolicy(password)
      const secretHash = tokens.hash(token)
      await rateLimiter.assertWithinLimit({
        subject: secretHash,
        action: 'password_reset_confirm',
        now: clock.now(),
      })
      const reset = await store.resetPasswordFromToken({
        secretHash,
        passwordHash: await hasher.hash(password),
        now: clock.now(),
      })
      if (!reset) throw new InvalidTokenError()
    },
  }
}
