import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import { Secret } from '@adonisjs/core/helpers'
import { loginValidator } from '#validators/auth/login'
import { registerValidator } from '#validators/auth/register'

export default class SessionController {
  // Vérifier si l'utilisateur est connecté et récupérer son token
  private async verifyTokenAndGetUser(request: HttpContext['request']) {
    const authHeader = request.header('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Token manquant')
    }

    const tokenValue = new Secret(authHeader.substring(7))
    const token = await User.accessTokens.verify(tokenValue)

    if (!token) {
      throw new Error('Token invalide')
    }

    const user = await User.find(token.tokenableId)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    return { user, token }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginValidator)
      const user = await User.verifyCredentials(payload.email, payload.password)
      const token = await User.accessTokens.create(user)

      logger.info({ userId: user.id }, 'Connexion réussie')

      return response.json({
        token: token,
        username: user.username,
        email: user.email,
        role: user.role,
        id: user.id,
      })
    } catch (error) {
      logger.error({ err: error }, 'Erreur de connexion')
      return response.unauthorized({ message: 'Identifiants incorrects' })
    }
  }

  public async show({ request, response }: HttpContext) {
    try {
      const { user } = await this.verifyTokenAndGetUser(request)

      logger.info({ userId: user.id }, 'Profil utilisateur consulté')

      return response.json({
        user: {
          username: user.username,
          email: user.email,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Erreur de vérification du token')
      return response.unauthorized({ message: error.message || 'Token invalide' })
    }
  }

  public async register({ request, response }: HttpContext) {
    try {
      // Validation des données
      const payload = await request.validateUsing(registerValidator)

      const { ...userData } = payload

      // Création de l'utilisateur
      const user = await User.create(userData)

      // Création du token
      const token = await User.accessTokens.create(user)

      logger.info({ userId: user.id }, 'Inscription réussie')

      return response.json({
        token,
        id: user.id,
        username: user.username,
        email: user.email,
      })
    } catch (error) {
      // Log de l'erreur
      logger.error({ err: error }, "Erreur lors de l'inscription")

      // Si c'est une erreur de validation
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.unprocessableEntity(error.messages)
      }

      // Si c'est une erreur de contrainte unique (email déjà utilisé)
      if (error.code === 'E_UNIQUE_VIOLATION') {
        return response.conflict({
          message: 'Cette adresse email est déjà utilisée',
        })
      }

      // Autres erreurs
      return response.badRequest({
        message: "Une erreur est survenue lors de l'inscription",
      })
    }
  }

  public async destroy({ request, response }: HttpContext) {
    try {
      const { user, token } = await this.verifyTokenAndGetUser(request)

      await User.accessTokens.delete(user, token.identifier)

      logger.info({ userId: user.id }, 'Déconnexion réussie')

      return response.json({
        message: 'Déconnexion réussie',
      })
    } catch (error) {
      logger.error({ err: error }, 'Erreur lors de la déconnexion')
      return response.unauthorized({ message: error.message || 'Erreur lors de la déconnexion' })
    }
  }

  //----- Check Admin -----//
  public async checkAdminStatus({ response }: HttpContext) {
    // Si on arrive à cette méthode, c'est que le middleware admin a validé
    // Pas besoin de revérifier le rôle puisque le middleware l'a déjà fait
    return response.json({
      isAdmin: true,
      message: 'Accès administrateur confirmé',
    })
  }
}
