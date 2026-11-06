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

router.get('/health/live', () => ({ status: 'live' }))

router.get('/health/ready', async ({ response }) => {
  try {
    await db.rawQuery('SELECT 1')
    return { status: 'ready' }
  } catch {
    return response.serviceUnavailable({ status: 'not_ready' })
  }
})
