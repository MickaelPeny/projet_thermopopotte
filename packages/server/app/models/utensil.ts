import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Version from './version.js'

export default class Utensil extends BaseModel {
  public static table = 'utensil'
  @column({ isPrimary: true, columnName: 'id_utensil' })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Version, {
    pivotTable: 'uses_utensil',
    localKey: 'id',
    pivotForeignKey: 'id_utensil',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_version',
  })
  declare versions: ManyToMany<typeof Version>
}
