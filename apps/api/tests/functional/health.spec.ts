import { test } from '@japa/runner'

test.group('health checks', () => {
  test('reports process liveness without requiring a database query', async ({ client }) => {
    const response = await client.get('/health/live')

    response.assertStatus(200)
    response.assertBodyContains({ status: 'live' })
  })

  test('reports readiness without exposing database details', async ({ client }) => {
    const response = await client.get('/health/ready')

    if (process.env.EXPECT_DATABASE_READY === 'false') {
      response.assertStatus(503)
      response.assertBodyContains({ status: 'not_ready' })
      return
    }

    response.assertStatus(200)
    response.assertBodyContains({ status: 'ready' })
  })
})
