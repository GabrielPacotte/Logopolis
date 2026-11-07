import { InvalidPasswordError } from './authentication_errors.js'

/**
 * {password is a user-supplied string} => {returns only when password has at least 12 and at most 128 characters}
 *
 * Errors: throws InvalidPasswordError for a non-compliant password.
 * Invariants: the value is never transformed or persisted by this function.
 */
export function assertPasswordPolicy(password: string): void {
  if (password.length < 12 || password.length > 128) {
    throw new InvalidPasswordError()
  }
}
