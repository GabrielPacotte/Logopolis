import db from '@adonisjs/lucid/services/db'
import { RateLimitExceededError } from '../domain/authentication_errors.js'
import type { IdentityRateLimiter } from '../application/ports.js'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15

/**
 * PostgreSQL adapter using one conditional UPSERT. The conflict update locks the
 * counter row, so concurrent requests cannot both pass the fifth-attempt limit.
 */
export const postgresIdentityRateLimiter: IdentityRateLimiter = {
  /**
   * {a normalized, non-secret subject and supported action are supplied} => {increments at most one active window or throws after five attempts}
   *
   * Effects: atomically inserts or updates one PostgreSQL counter.
   * Invariants: a rejected request leaves its counter at the limit and no raw authentication token is stored.
   */
  async assertWithinLimit({ subject, action, now }) {
    const key = `${action}:${subject}`
    const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60_000)
    const result = await db.rawQuery(
      `INSERT INTO identity_rate_limits (key, action, attempts, window_started)
       VALUES (?, ?, 1, ?)
       ON CONFLICT (key, action) DO UPDATE
       SET attempts = CASE WHEN identity_rate_limits.window_started <= ? THEN 1 ELSE identity_rate_limits.attempts + 1 END,
           window_started = CASE WHEN identity_rate_limits.window_started <= ? THEN ? ELSE identity_rate_limits.window_started END
       WHERE identity_rate_limits.window_started <= ? OR identity_rate_limits.attempts < ?
       RETURNING attempts`,
      [key, action, now, windowStart, windowStart, now, windowStart, MAX_ATTEMPTS]
    )
    if (result.rows.length !== 1) throw new RateLimitExceededError()
  },
}
