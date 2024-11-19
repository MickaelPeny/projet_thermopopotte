import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Version from './version.js'

export default class Tip extends BaseModel {
  public static table = 'tip'
  @column({ isPrimary: true, columnName: 'id_tip' })
  declare id: number

  @column({ columnName: 'tip_text' })
  declare tipText: string

  @column()
  declare id_version: number

  @belongsTo(() => Version, { foreignKey: 'id_version' })
  declare version: BelongsTo<typeof Version>
}
