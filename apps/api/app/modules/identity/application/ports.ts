export type IdentityUser = {
  id: string
  email: string
  emailVerifiedAt: Date | null
  authVersion: number
}

export type TokenPurpose = 'verify_email' | 'password_reset'

export type RateLimitAction =
  | 'register'
  | 'login'
  | 'verification_resend'
  | 'verify_email'
  | 'password_reset'
  | 'password_reset_confirm'

/** Ports are owned by the application; adapters implement them at the infrastructure boundary. */
export interface IdentityStore {
  findByEmail(email: string): Promise<IdentityUser | null>
  createUser(email: string, passwordHash: string, now: Date): Promise<IdentityUser | null>
  authenticate(email: string, password: string): Promise<IdentityUser | null>
  issueToken(input: {
    userId: string
    purpose: TokenPurpose
    secretHash: string
    expiresAt: Date
    now: Date
  }): Promise<void>
  consumeVerificationToken(secretHash: string, now: Date): Promise<IdentityUser | null>
  resetPasswordFromToken(input: {
    secretHash: string
    passwordHash: string
    now: Date
  }): Promise<boolean>
}

export interface PasswordHasher {
  hash(password: string): Promise<string>
}
export interface TokenService {
  create(): string
  hash(secret: string): string
}
export interface Clock {
  now(): Date
  addMinutes(date: Date, minutes: number): Date
}
export interface IdentityMailer {
  sendVerification(recipient: string, token: string): Promise<void>
  sendPasswordReset(recipient: string, token: string): Promise<void>
}
export interface IdentityRateLimiter {
  assertWithinLimit(input: { subject: string; action: RateLimitAction; now: Date }): Promise<void>
}
export interface IdentitySession {
  establish(userId: string, authVersion: number): Promise<void>
  terminate(): Promise<void>
}
