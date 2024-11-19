import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import IngredientCategory from './ingredient_category.js'

export default class Ingredient extends BaseModel {
  public static table = 'ingredient'
  @column({ isPrimary: true, columnName: 'id_ingredient' })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => IngredientCategory, {
    pivotTable: 'belongs_to_ingredient_category',
    localKey: 'id',
    pivotForeignKey: 'id_ingredient',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_ingredient_category',
  })
  declare ingredientCategories: ManyToMany<typeof IngredientCategory>
}
