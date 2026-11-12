import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  enabled: true,
  cookieName: 'logopolis_session',
  clearWithBrowser: false,
  age: '2h',
  cookie: {
    path: '/',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },
  // Health-readiness tests intentionally run without PostgreSQL; production and normal integration use PostgreSQL.
  store: app.inTest && process.env.EXPECT_DATABASE_READY === 'false' ? 'memory' : 'database',
  stores: {
    database: stores.database({ tableName: 'identity_sessions', gcProbability: 2 }),
  },
})
