import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

export default defineConfig({
  enabled: true,
  origin: [env.get('WEB_ORIGIN')],
  credentials: true,
})
