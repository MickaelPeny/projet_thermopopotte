import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  public async index({ response }: HttpContext) {
    const users = await User.all()
    return response.json(users)
  }

  public async show({ response, params }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      return response.json(user)
    } catch (error) {
      return response.status(404).json({ message: 'Utilisateur introuvable' })
    }
  }

  public async create({ request, response }: HttpContext) {
    const data = request.only(['username', 'email', 'password'])
    const user = await User.create(data)
    return response.status(201).json(user)
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      const data = request.only(['username', 'email'])
      user.merge(data)
      await user.save()
      return response.json(user)
    } catch (error) {
      return response.status(404).json({ message: 'Utilisateur introuvable' })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      await user.delete()
      return response.json({ message: 'Utilisateur supprimé avec succès' })
    } catch (error) {
      return response.status(404).json({ message: 'Utilisateur introuvable' })
    }
  }
}
