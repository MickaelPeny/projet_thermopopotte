import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Version from './version.js'

export default class Step extends BaseModel {
  public static table = 'step'
  @column({ isPrimary: true, columnName: 'id_step' })
  declare id: number

  @column({ columnName: 'step_order' })
  declare stepOrder: number

  @column()
  declare description: string

  @column()
  declare temperature: number | null

  @column()
  declare speed: number | null

  @column()
  declare id_version: number

  @belongsTo(() => Version, { foreignKey: 'id_version' })
  declare version: BelongsTo<typeof Version>
}
