import type { HttpContext } from '@adonisjs/core/http'
import Utensil from '#models/utensil'

export default class UtensilsController {
  // Lister tous les ustensiles
  public async index({ response }: HttpContext) {
    try {
      const utensils = await Utensil.all()
      return response.json(utensils)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Erreur lors de la récupération des ustensiles', error })
    }
  }

  // Récupérer un ustensile par son ID
  public async show({ params, response }: HttpContext) {
    try {
      const utensil = await Utensil.findOrFail(params.id)
      return response.json(utensil)
    } catch (error) {
      return response.status(404).json({ message: 'Ustensile non trouvé' })
    }
  }

  // Créer un nouvel ustensile
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name'])
      const utensil = await Utensil.create(data)
      return response.status(201).json(utensil)
    } catch (error) {
      return response
        .status(400)
        .json({ message: "Erreur lors de la création de l'ustensile", error })
    }
  }

  // Mettre à jour un ustensile
  public async update({ params, request, response }: HttpContext) {
    try {
      const utensil = await Utensil.findOrFail(params.id)
      const data = request.only(['name'])
      utensil.merge(data)
      await utensil.save()
      return response.json(utensil)
    } catch (error) {
      if (error.name === 'ModelNotFoundException') {
        return response.status(404).json({ message: 'Ustensile non trouvé' })
      }
      return response
        .status(400)
        .json({ message: "Erreur lors de la mise à jour de l'ustensile", error })
    }
  }

  // Supprimer un ustensile
  public async destroy({ params, response }: HttpContext) {
    try {
      const utensil = await Utensil.findOrFail(params.id)
      await utensil.delete()
      return response.json({ message: 'Ustensile supprimé avec succès' })
    } catch (error) {
      return response.status(404).json({ message: 'Ustensile non trouvé' })
    }
  }
}
