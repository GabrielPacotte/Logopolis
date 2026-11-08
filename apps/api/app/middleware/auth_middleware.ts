import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

type VersionedIdentity = { authVersion: number }

/**
 * {request targets a route requiring an authenticated identity} => {continues only when the session's auth version equals the user's current server-side version, otherwise returns 401}
 *
 * Refus: missing, expired or invalid sessions receive a neutral 401 response.
 * Effects: clears a session whose credentials were superseded, for example after a password reset.
 * Invariants: authorization is decided server-side from the current session and account version.
 */
export default class AuthMiddleware {
  async handle({ auth, response, session }: HttpContext, next: NextFn) {
    try {
      await auth.authenticateUsing(['web'])
      // The generic user type of HttpContext auth is intentionally erased here;
      // `authenticateUsing(['web'])` has established the configured User model.
      const user = auth.user as unknown as VersionedIdentity | undefined
      if (!user || session.get('identity.authVersion') !== user.authVersion) {
        session.clear()
        return response.unauthorized({ message: 'Authentication required.' })
      }
      return next()
    } catch {
      return response.unauthorized({ message: 'Authentication required.' })
    }
  }
}
