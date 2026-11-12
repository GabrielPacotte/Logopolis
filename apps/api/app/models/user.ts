import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { beforeCreate, BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class User extends withAuthFinder(() => hash.use(), {
  uids: ['email'],
  passwordColumnName: 'passwordHash',
})(BaseModel) {
  static table = 'identity_users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare passwordHash: string

  @column.dateTime({ serializeAs: null })
  declare emailVerifiedAt: DateTime | null

  @column({ serializeAs: null })
  declare authVersion: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignId(user: User) {
    user.id = randomUUID()
  }
}
