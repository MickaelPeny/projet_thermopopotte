import { BaseModel, column, manyToMany, hasMany } from '@adonisjs/lucid/orm'
import RecipeCategory from './recipe_category.js'
import type { ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import Version from './version.js'

export default class Recipe extends BaseModel {
  public static table = 'recipe'
  @column({ isPrimary: true, columnName: 'id_recipe' })
  declare id: number

  @column()
  declare name: string

  @column()
  declare image_url: string

  @manyToMany(() => RecipeCategory, {
    pivotTable: 'belongs_to_recipe_category',
    localKey: 'id',
    pivotForeignKey: 'id_recipe',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_recipe_category',
  })
  declare categories: ManyToMany<typeof RecipeCategory>

  @hasMany(() => Version, { foreignKey: 'id_recipe' })
  declare versions: HasMany<typeof Version>
}
