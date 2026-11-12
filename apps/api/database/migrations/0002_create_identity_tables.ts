import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected usersTable = 'identity_users'
  protected tokensTable = 'identity_tokens'
  protected rateLimitsTable = 'identity_rate_limits'
  protected sessionsTable = 'identity_sessions'

  override async up() {
    this.schema.createTable(this.usersTable, (table) => {
      table.uuid('id').primary()
      table.string('email', 320).notNullable().unique()
      table.string('password_hash').notNullable()
      table.timestamp('email_verified_at', { useTz: true }).nullable()
      table.integer('auth_version').notNullable().defaultTo(1)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable(this.tokensTable, (table) => {
      table.uuid('id').primary()
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable(this.usersTable)
        .onDelete('CASCADE')
      table.string('purpose', 32).notNullable()
      table.string('secret_hash', 128).notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable().index()
      table.timestamp('consumed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.index(['user_id', 'purpose'])
    })

    this.schema.createTable(this.rateLimitsTable, (table) => {
      table.string('key', 128).notNullable()
      table.string('action', 32).notNullable()
      table.integer('attempts').notNullable()
      table.timestamp('window_started', { useTz: true }).notNullable()
      table.primary(['key', 'action'])
    })

    this.schema.createTable(this.sessionsTable, (table) => {
      table.string('id').primary()
      table.text('data').notNullable()
      table.string('user_id').nullable().index()
      table.timestamp('expires_at', { useTz: true }).notNullable().index()
    })
  }

  override async down() {
    this.schema.dropTable(this.sessionsTable)
    this.schema.dropTable(this.rateLimitsTable)
    this.schema.dropTable(this.tokensTable)
    this.schema.dropTable(this.usersTable)
  }
}
