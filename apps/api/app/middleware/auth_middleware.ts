import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * {request targets a route requiring an authenticated identity} => {continues with an authenticated user or returns 401 without disclosing account state}
 *
 * Refus: missing, expired or invalid sessions receive a neutral 401 response.
 * Invariants: authorization is decided server-side from the current session.
 */
export default class AuthMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    try {
      await auth.authenticateUsing(['web'])
      return next()
    } catch {
      return response.unauthorized({ message: 'Authentication required.' })
    }
  }
}
