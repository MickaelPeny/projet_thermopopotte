import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Version from './version.js'

export default class Comment extends BaseModel {
  public static table = 'comment'
  @column({ isPrimary: true, columnName: 'id_comment' })
  declare id: number

  @column({ columnName: 'comment_text' })
  declare commentText: string

  @column.dateTime({ autoCreate: true, columnName: 'creation_date' })
  declare createdAt: DateTime

  @column()
  declare rating: number

  @column()
  declare id_user: number

  @column()
  declare id_version: number

  @belongsTo(() => User, { foreignKey: 'id_user' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Version, { foreignKey: 'id_version' })
  declare version: BelongsTo<typeof Version>
}
