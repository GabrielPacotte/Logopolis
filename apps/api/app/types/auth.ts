import type authConfig from '#config/auth'
import type { InferAuthenticators } from '@adonisjs/auth/types'

declare module '@adonisjs/auth/types' {
  interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
