import { beforeCreate, BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export type IdentityTokenPurpose = 'verify_email' | 'password_reset'

export default class IdentityToken extends BaseModel {
  static table = 'identity_tokens'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare purpose: IdentityTokenPurpose

  @column({ serializeAs: null })
  declare secretHash: string

  @column.dateTime({ serializeAs: null })
  declare expiresAt: DateTime

  @column.dateTime({ serializeAs: null })
  declare consumedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @beforeCreate()
  static assignId(token: IdentityToken) {
    token.id = randomUUID()
  }
}
