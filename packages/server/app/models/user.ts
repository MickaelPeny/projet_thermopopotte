import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Version from './version.js'
import Comment from './comment.js'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  public static table = 'users'

  @column({ isPrimary: true, columnName: 'id' })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'admin' | 'user'

  // Méthode helper pour vérifier si l'utilisateur est admin
  public isAdmin(): boolean {
    return this.role === 'admin'
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Version, { foreignKey: 'id_user' })
  declare versions: HasMany<typeof Version>

  @hasMany(() => Comment, { foreignKey: 'id_user' })
  declare comments: HasMany<typeof Comment>

  // Ajoute le provider de jetons d'accès
  static accessTokens = DbAccessTokensProvider.forModel(User)
}
