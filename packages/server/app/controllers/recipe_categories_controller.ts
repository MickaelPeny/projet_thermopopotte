import type { HttpContext } from '@adonisjs/core/http'
import RecipeCategory from '#models/recipe_category'

export default class RecipeCategoriesController {
  // Lister toutes les catégories de recettes
  public async index({ response }: HttpContext) {
    try {
      const categories = await RecipeCategory.all()
      return response.json(categories)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Erreur lors de la récupération des catégories de recettes', error })
    }
  }

  // Récupérer une catégorie de recette par ID
  public async show({ params, response }: HttpContext) {
    try {
      const category = await RecipeCategory.findOrFail(params.id)
      return response.json(category)
    } catch (error) {
      return response.status(404).json({ message: 'Catégorie de recette non trouvée' })
    }
  }

  // Créer une nouvelle catégorie de recette
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name'])
      const category = await RecipeCategory.create(data)
      return response.status(201).json(category)
    } catch (error) {
      return response
        .status(400)
        .json({ message: 'Erreur lors de la création de la catégorie de recette', error })
    }
  }

  // Mettre à jour une catégorie de recette par ID
  public async update({ params, request, response }: HttpContext) {
    try {
      const category = await RecipeCategory.findOrFail(params.id)
      const data = request.only(['name'])
      category.merge(data)
      await category.save()
      return response.json(category)
    } catch (error) {
      if (error.name === 'ModelNotFoundException') {
        return response.status(404).json({ message: 'Catégorie de recette non trouvée' })
      }
      return response
        .status(400)
        .json({ message: 'Erreur lors de la mise à jour de la catégorie de recette', error })
    }
  }

  // Supprimer une catégorie de recette par ID
  public async destroy({ params, response }: HttpContext) {
    try {
      const category = await RecipeCategory.findOrFail(params.id)
      await category.delete()
      return response.json({ message: 'Catégorie de recette supprimée avec succès' })
    } catch (error) {
      return response.status(404).json({ message: 'Catégorie de recette non trouvée' })
    }
  }
}
