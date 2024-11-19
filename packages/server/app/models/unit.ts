import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Unit extends BaseModel {
  public static table = 'unit'
  @column({ isPrimary: true, columnName: 'id_unit' })
  declare id: number

  @column()
  declare name: string
}
