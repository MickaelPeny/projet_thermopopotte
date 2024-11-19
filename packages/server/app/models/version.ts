import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Recipe from './recipe.js'
import User from './user.js'
import Step from './step.js'
import Utensil from './utensil.js'
import RecipeDetail from './recipe_detail.js'
import Tip from './tip.js'
import Comment from './comment.js'
import Ingredient from './ingredient.js'

export default class Version extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_version' })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column({ columnName: 'prep_time' })
  declare prepTime: number

  @column({ columnName: 'cook_time' })
  declare cookTime: number

  @column({ columnName: 'total_time' })
  declare totalTime: number

  @column({ columnName: 'servings' })
  declare serving: number

  @column({ columnName: 'version_number' })
  declare versionNumber: number

  @column.dateTime({ autoCreate: true, columnName: 'creation_date' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'modification_date' })
  declare updatedAt: DateTime

  @column()
  declare id_recipe: number

  @column()
  declare id_user: number

  @belongsTo(() => Recipe, { foreignKey: 'id_recipe' })
  declare recipe: BelongsTo<typeof Recipe>

  @belongsTo(() => User, { foreignKey: 'id_user' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Step, { foreignKey: 'id_version' })
  declare steps: HasMany<typeof Step>

  @manyToMany(() => Ingredient, {
    pivotTable: 'recipe_detail',
    localKey: 'id',
    pivotForeignKey: 'id_version',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_ingredient',
  })
  declare ingredients: ManyToMany<typeof Ingredient>

  @manyToMany(() => Utensil, {
    pivotTable: 'uses_utensil',
    localKey: 'id',
    pivotForeignKey: 'id_version',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_utensil',
  })
  declare utensils: ManyToMany<typeof Utensil>

  @hasMany(() => RecipeDetail, { foreignKey: 'id_version' })
  declare recipeDetails: HasMany<typeof RecipeDetail>

  @hasMany(() => Tip, { foreignKey: 'id_version' })
  declare tips: HasMany<typeof Tip>

  @hasMany(() => Comment, { foreignKey: 'id_version' })
  declare comments: HasMany<typeof Comment>
}
