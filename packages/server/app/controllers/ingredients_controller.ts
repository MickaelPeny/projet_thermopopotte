import type { HttpContext } from '@adonisjs/core/http'
import Ingredient from '#models/ingredient'

export default class IngredientsController {
  // Lister tous les ingrédients
  public async index({ response }: HttpContext) {
    try {
      const ingredients = await Ingredient.all()
      return response.json(ingredients)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Erreur lors de la récupération des ingrédients', error })
    }
  }

  // Récupérer un ingrédient par son ID
  public async show({ params, response }: HttpContext) {
    try {
      const ingredient = await Ingredient.findOrFail(params.id)
      return response.json(ingredient)
    } catch (error) {
      return response.status(404).json({ message: 'Ingrédient non trouvé' })
    }
  }

  // Créer un nouvel ingrédient
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'category_id'])
      const ingredient = await Ingredient.create(data)
      return response.status(201).json(ingredient)
    } catch (error) {
      return response
        .status(400)
        .json({ message: "Erreur lors de la création de l'ingrédient", error })
    }
  }

  // Mettre à jour un ingrédient
  public async update({ params, request, response }: HttpContext) {
    try {
      const ingredient = await Ingredient.findOrFail(params.id)
      const data = request.only(['name', 'category_id'])
      ingredient.merge(data)
      await ingredient.save()
      return response.json(ingredient)
    } catch (error) {
      return response.status(404).json({ message: 'Ingrédient non trouvé' })
    }
  }

  // Supprimer un ingrédient
  public async destroy({ params, response }: HttpContext) {
    try {
      const ingredient = await Ingredient.findOrFail(params.id)
      await ingredient.delete()
      return response.json({ message: 'Ingrédient supprimé avec succès' })
    } catch (error) {
      return response.status(404).json({ message: 'Ingrédient non trouvé' })
    }
  }
}
