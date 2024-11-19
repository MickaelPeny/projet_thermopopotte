import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import logger from '@adonisjs/core/services/logger'
import { commentValidator } from '#validators/comments/create'
import { updateCommentValidator } from '#validators/comments/update'

export default class CommentsController {
  // Récupérer tous les commentaires d'une version
  public async index({ params, response }: HttpContext) {
    try {
      const comments = await Comment.query()
        .where('id_version', params.versionId)
        .preload('user')
        .orderBy('creation_date', 'desc')

      return response.json(comments)
    } catch (error) {
      logger.error({ err: error }, 'Erreur lors de la récupération des commentaires')
      return response.internalServerError({
        message: 'Erreur lors de la récupération des commentaires',
      })
    }
  }

  // Créer un nouveau commentaire

  public async store({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const payload = await request.validateUsing(commentValidator)

      const comment = await Comment.create({
        ...payload,
        id_user: user.id,
      })

      await comment.refresh()
      await comment.preload('user')

      return response.json(comment)
    } catch (error) {
      logger.error({ err: error }, 'Erreur lors de la création du commentaire')
      return response.badRequest({
        message: 'Erreur lors de la création du commentaire',
      })
    }
  }

  // Mettre à jour un commentaire

  public async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const comment = await Comment.findOrFail(params.id)

      // Vérifie si l'utilisateur est l'auteur ou l'admin
      if (comment.id_user !== user.id && user.role !== 'admin') {
        return response.forbidden({
          message: "Vous n'êtes pas autorisé à modifier ce commentaire",
        })
      }

      const payload = await request.validateUsing(updateCommentValidator)
      await comment.merge(payload).save()
      await comment.preload('user')

      return response.json(comment)
    } catch (error) {
      logger.error({ err: error }, 'Erreur lors de la mise à jour du commentaire')
      return response.badRequest({
        message: 'Erreur lors de la mise à jour du commentaire',
      })
    }
  }

  // Supprimer un commentaire
  public async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const comment = await Comment.findOrFail(params.id)

      // Vérifie si l'utilisateur est l'auteur ou admin
      if (comment.id_user !== user.id && user.role !== 'admin') {
        return response.forbidden({
          message: "Vous n'êtes pas autorisé à supprimer ce commentaire",
        })
      }

      await comment.delete()
      return response.json({
        message: 'Commentaire supprimé avec succès',
      })
    } catch (error) {
      logger.error({ err: error }, 'Erreur lors de la suppression du commentaire')
      return response.badRequest({
        message: 'Erreur lors de la suppression du commentaire',
      })
    }
  }
}
