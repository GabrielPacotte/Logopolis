import type { HttpContext } from '@adonisjs/core/http'
import type { SessionGuard, SessionLucidUserProvider } from '@adonisjs/auth/session'
import User from '#models/user'
import type { IdentitySession } from '../application/ports.js'

type WebSessionGuard = SessionGuard<false, SessionLucidUserProvider<typeof User>>

function webSessionGuard(auth: HttpContext['auth']): WebSessionGuard {
  return auth.use('web' as never) as unknown as WebSessionGuard
}

/** {an HTTP request has Adonis auth and session services} => {returns a request-scoped application session port} */
export function adonisIdentitySession({
  auth,
  session,
}: Pick<HttpContext, 'auth' | 'session'>): IdentitySession {
  return {
    /** {a persisted identity exists} => {logs it in and tags its server-side session} */
    async establish(userId, authVersion) {
      const user = await User.findOrFail(userId)
      await webSessionGuard(auth).login(user)
      session.put('identity.authVersion', authVersion)
      await session.tag(user.id)
    },
    /** {the request was authenticated by the web guard} => {removes the session tag and logs out the current identity} */
    async terminate() {
      const user = webSessionGuard(auth).user
      if (user) await session.untag(user.id)
      await webSessionGuard(auth).logout()
    },
  }
}
