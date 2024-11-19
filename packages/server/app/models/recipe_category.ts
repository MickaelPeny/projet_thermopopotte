import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Recipe from './recipe.js'

export default class RecipeCategory extends BaseModel {
  public static table = 'recipe_category'

  @column({ isPrimary: true, columnName: 'id_recipe_category' })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Recipe, {
    pivotTable: 'belongs_to_recipe_category',
    localKey: 'id',
    pivotForeignKey: 'id_recipe_category',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_recipe',
  })
  declare recipes: ManyToMany<typeof Recipe>
}
