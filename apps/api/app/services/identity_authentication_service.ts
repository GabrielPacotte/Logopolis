import { createAuthenticationService } from '../modules/identity/application/authentication_service.js'
import { identityMailer } from '../modules/identity/adapters/identity_mailer.js'
import { postgresIdentityRateLimiter } from '../modules/identity/adapters/postgres_identity_rate_limiter.js'
import { postgresIdentityStore } from '../modules/identity/adapters/postgres_identity_store.js'
import {
  adonisPasswordHasher,
  secureTokenService,
  systemClock,
} from '../modules/identity/adapters/system_ports.js'

/** Application composition root for identity. Controllers receive only this assembled service. */
const identityAuthenticationService = createAuthenticationService({
  clock: systemClock,
  hasher: adonisPasswordHasher,
  mailer: identityMailer,
  rateLimiter: postgresIdentityRateLimiter,
  store: postgresIdentityStore,
  tokens: secureTokenService,
})

export default identityAuthenticationService
