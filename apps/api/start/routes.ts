/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import { middleware } from '#start/kernel'
const AuthController = () => import('#controllers/auth_controller')

router.get('/health/live', () => ({ status: 'live' }))

router.get('/health/ready', async ({ response }) => {
  try {
    await db.rawQuery('SELECT 1')
    return { status: 'ready' }
  } catch {
    return response.serviceUnavailable({ status: 'not_ready' })
  }
})

router.post('/auth/register', [AuthController, 'register']).use(middleware.shield())
router.get('/auth/verify-email', [AuthController, 'verifyEmail'])
router.get('/auth/csrf', [AuthController, 'csrf']).use(middleware.shield())
router
  .post('/auth/verification-email', [AuthController, 'resendVerification'])
  .use(middleware.shield())
router.post('/auth/login', [AuthController, 'login']).use(middleware.shield())
router
  .post('/auth/logout', [AuthController, 'logout'])
  .use([middleware.auth(), middleware.shield()])
router
  .post('/auth/password-reset', [AuthController, 'requestPasswordReset'])
  .use(middleware.shield())
router
  .post('/auth/password-reset/confirm', [AuthController, 'resetPassword'])
  .use(middleware.shield())
router.get('/auth/me', [AuthController, 'me']).use(middleware.auth())
