import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class IngredientType extends BaseModel {
  public static table = 'ingredient_type'
  @column({ isPrimary: true, columnName: 'id_ingredient_type' })
  declare id: number

  @column()
  declare name: string
}
