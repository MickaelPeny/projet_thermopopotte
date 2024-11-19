import type { HttpContext } from '@adonisjs/core/http'
import IngredientCategory from '#models/ingredient_category'

export default class IngredientCategoriesController {
  // Lister toutes les catégories d'ingrédients
  public async index({ response }: HttpContext) {
    try {
      const categories = await IngredientCategory.all()
      return response.json(categories)
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Erreur lors de la récupération des catégories d'ingrédients", error })
    }
  }

  // Récupérer une catégorie d'ingrédient par ID
  public async show({ params, response }: HttpContext) {
    try {
      const category = await IngredientCategory.findOrFail(params.id)
      return response.json(category)
    } catch (error) {
      return response.status(404).json({ message: "Catégorie d'ingrédient non trouvée" })
    }
  }

  // Créer une nouvelle catégorie d'ingrédient
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name'])
      const category = await IngredientCategory.create(data)
      return response.status(201).json(category)
    } catch (error) {
      return response
        .status(400)
        .json({ message: "Erreur lors de la création de la catégorie d'ingrédient", error })
    }
  }

  // Mettre à jour une catégorie d'ingrédient par ID
  public async update({ params, request, response }: HttpContext) {
    try {
      const category = await IngredientCategory.findOrFail(params.id)
      const data = request.only(['name'])
      category.merge(data)
      await category.save()
      return response.json(category)
    } catch (error) {
      if (error.name === 'ModelNotFoundException') {
        return response.status(404).json({ message: "Catégorie d'ingrédient non trouvée" })
      }
      return response
        .status(400)
        .json({ message: "Erreur lors de la mise à jour de la catégorie d'ingrédient", error })
    }
  }

  // Supprimer une catégorie d'ingrédient par ID
  public async destroy({ params, response }: HttpContext) {
    try {
      const category = await IngredientCategory.findOrFail(params.id)
      await category.delete()
      return response.json({ message: "Catégorie d'ingrédient supprimée avec succès" })
    } catch (error) {
      return response.status(404).json({ message: "Catégorie d'ingrédient non trouvée" })
    }
  }
}
