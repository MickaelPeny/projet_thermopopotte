import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Version from './version.js'
import Ingredient from './ingredient.js'
import Unit from './unit.js'
import IngredientType from './ingredient_type.js'

export default class RecipeDetail extends BaseModel {
  public static table = 'recipe_detail'
  @column({ isPrimary: true, columnName: 'id_recipe_detail' })
  declare id: number

  @column()
  declare quantity: number

  @column()
  declare id_version: number

  @column()
  declare id_ingredient: number

  @column()
  declare id_unit: number

  @column()
  declare id_ingredient_type: number

  @belongsTo(() => Version, { foreignKey: 'id_version' })
  declare version: BelongsTo<typeof Version>

  @belongsTo(() => Ingredient, { foreignKey: 'id_ingredient' })
  declare ingredient: BelongsTo<typeof Ingredient>

  @belongsTo(() => Unit, { foreignKey: 'id_unit' })
  declare unit: BelongsTo<typeof Unit>

  @belongsTo(() => IngredientType, { foreignKey: 'id_ingredient_type' })
  declare ingredientType: BelongsTo<typeof IngredientType>
}
