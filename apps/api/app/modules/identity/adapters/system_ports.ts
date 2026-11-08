import { createHash, randomBytes } from 'node:crypto'
import hash from '@adonisjs/core/services/hash'
import type { Clock, PasswordHasher, TokenService } from '../application/ports.js'

export const systemClock: Clock = {
  now: () => new Date(),
  addMinutes: (date, minutes) => new Date(date.getTime() + minutes * 60_000),
}

export const secureTokenService: TokenService = {
  create: () => randomBytes(32).toString('base64url'),
  hash: (secret) => createHash('sha256').update(secret).digest('hex'),
}

export const adonisPasswordHasher: PasswordHasher = {
  hash: (password) => hash.make(password),
}
