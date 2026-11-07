import type { HttpContext } from '@adonisjs/core/http'
import type { SessionGuard, SessionLucidUserProvider } from '@adonisjs/auth/session'
import vine from '@vinejs/vine'
import {
  InvalidPasswordError,
  InvalidTokenError,
  RateLimitExceededError,
} from '../modules/identity/domain/authentication_errors.js'
import * as authentication from '../modules/identity/application/authentication_service.js'
import type User from '#models/user'

type WebSessionGuard = SessionGuard<false, SessionLucidUserProvider<typeof User>>

/**
 * {the Adonis HTTP auth service is configured with the `web` session guard} => {returns the concrete session guard used for login and logout}
 *
 * Invariants: the cast is local to the framework boundary; application authorization remains server-side.
 */
function webSessionGuard(auth: HttpContext['auth']): WebSessionGuard {
  return auth.use('web' as never) as unknown as WebSessionGuard
}

const credentialsValidator = vine.compile(
  vine.object({ email: vine.string().trim().email({}), password: vine.string() })
)
const emailValidator = vine.compile(vine.object({ email: vine.string().trim().email({}) }))
const tokenValidator = vine.compile(vine.object({ token: vine.string().trim().minLength(20) }))
const resetValidator = vine.compile(
  vine.object({ token: vine.string().trim().minLength(20), password: vine.string() })
)

function userResponse(user: User) {
  return { id: user.id, email: user.email, emailVerified: Boolean(user.emailVerifiedAt) }
}

function handleIdentityError(error: unknown, response: HttpContext['response']) {
  if (error instanceof InvalidPasswordError)
    return response.unprocessableEntity({ message: error.message })
  if (error instanceof RateLimitExceededError)
    return response.tooManyRequests({ message: 'Too many attempts. Please try again later.' })
  if (error instanceof InvalidTokenError)
    return response.unprocessableEntity({ message: 'This link is invalid or has expired.' })
  throw error
}

export default class AuthController {
  /** {valid registration data is supplied} => {returns a neutral accepted response after attempting registration} */
  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(credentialsValidator)
      await authentication.register(payload.email, payload.password)
      return response.accepted({
        message: 'If this address can receive messages, a verification email has been prepared.',
      })
    } catch (error) {
      return handleIdentityError(error, response)
    }
  }

  /** {a verification token is supplied} => {verifies exactly one account or safely rejects the link} */
  async verifyEmail({ request, response }: HttpContext) {
    try {
      const { token } = await request.validateUsing(tokenValidator, { data: request.qs() })
      await authentication.verifyEmail(token)
      return response.noContent()
    } catch (error) {
      return handleIdentityError(error, response)
    }
  }

  /** {an email is supplied} => {returns a neutral accepted response and may send a replacement verification message} */
  async resendVerification({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailValidator)
      await authentication.resendVerification(email)
      return response.accepted({
        message: 'If this address can receive messages, a verification email has been prepared.',
      })
    } catch (error) {
      return handleIdentityError(error, response)
    }
  }

  /** {credentials are supplied} => {creates a server session only for valid credentials, otherwise returns a neutral refusal} */
  async login({ request, response, auth, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(credentialsValidator)
      const user = await authentication.authenticate(payload.email, payload.password)
      if (!user) return response.unauthorized({ message: 'Invalid email or password.' })
      await webSessionGuard(auth).login(user)
      session.put('identity.authVersion', user.authVersion)
      await session.tag(user.id)
      return response.ok({ user: userResponse(user) })
    } catch (error) {
      return handleIdentityError(error, response)
    }
  }

  /** {a valid authenticated session exists} => {invalidates it and returns no private content} */
  async logout({ response, auth, session }: HttpContext) {
    await session.untag(webSessionGuard(auth).user!.id)
    await webSessionGuard(auth).logout()
    return response.noContent()
  }

  /** {an email is supplied} => {returns a neutral accepted response regardless of account existence} */
  async requestPasswordReset({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailValidator)
      await authentication.requestPasswordReset(email)
      return response.accepted({
        message: 'If this address can receive messages, a recovery email has been prepared.',
      })
    } catch (error) {
      return handleIdentityError(error, response)
    }
  }

  /** {a reset token and compliant password are supplied} => {updates credentials once and invalidates all prior sessions} */
  async resetPassword({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(resetValidator)
      await authentication.resetPassword(payload.token, payload.password)
      return response.noContent()
    } catch (error) {
      return handleIdentityError(error, response)
    }
  }

  /** {a valid session is present} => {returns only the authenticated user's safe identity state} */
  async me({ auth, response }: HttpContext) {
    return response.ok({ user: userResponse(auth.user!) })
  }
}
