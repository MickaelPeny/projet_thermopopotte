import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Ingredient from './ingredient.js'

export default class IngredientCategory extends BaseModel {
  public static table = 'ingredient_category'
  @column({ isPrimary: true, columnName: 'id_ingredient_category' })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Ingredient, {
    pivotTable: 'belongs_to_ingredient_category',
    localKey: 'id',
    pivotForeignKey: 'id_ingredient_category',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_ingredient',
  })
  declare ingredients: ManyToMany<typeof Ingredient>
}
