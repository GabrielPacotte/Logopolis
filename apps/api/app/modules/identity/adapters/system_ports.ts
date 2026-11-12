import { createHash, randomBytes } from 'node:crypto'
import hash from '@adonisjs/core/services/hash'
import type { Clock, PasswordHasher, TokenService } from '../application/ports.js'

export const systemClock: Clock = {
  /** {none} => {returns the current UTC instant without mutating identity state}. */
  now: () => new Date(),
  /** {date is a valid instant and minutes is finite} => {returns a new instant offset by whole milliseconds; does not mutate date}. */
  addMinutes: (date, minutes) => new Date(date.getTime() + minutes * 60_000),
}

export const secureTokenService: TokenService = {
  /** {none} => {returns an unpredictable, URL-safe 256-bit secret; no secret is persisted or logged}. */
  create: () => randomBytes(32).toString('base64url'),
  /** {secret is a raw token held only transiently} => {returns its deterministic SHA-256 digest; the raw value is neither persisted nor logged}. */
  hash: (secret) => createHash('sha256').update(secret).digest('hex'),
}

export const adonisPasswordHasher: PasswordHasher = {
  /** {password satisfies the caller's policy} => {returns a salted framework password digest; plaintext is not persisted or logged}. */
  hash: (password) => hash.make(password),
}
