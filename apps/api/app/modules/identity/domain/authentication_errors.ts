export class InvalidPasswordError extends Error {
  constructor() {
    super('The password does not meet the required policy')
    this.name = 'InvalidPasswordError'
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super('The supplied token is invalid, expired, or already consumed')
    this.name = 'InvalidTokenError'
  }
}

export class RateLimitExceededError extends Error {
  constructor() {
    super('Too many attempts. Try again later.')
    this.name = 'RateLimitExceededError'
  }
}
