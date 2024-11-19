import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Recipe from '#models/recipe'
import Ingredient from '#models/ingredient'
import Utensil from '#models/utensil'
import Version from '#models/version'
import RecipeDetail from '#models/recipe_detail'
import Step from '#models/step'
import { ImageService } from '#services/image_service'
import { inject } from '@adonisjs/core'

@inject()
export default class RecipesController {
  protected readonly imageService: ImageService

  constructor(imageService: ImageService) {
    this.imageService = imageService
  }

  // Récupérer toutes les recettes avec uniquement leurs catégories
  public async index({ response }: HttpContext) {
    const recipes = await Recipe.query().preload('categories')
    return response.json(recipes)
  }

  // Méthode pour récupérer toutes les recettes avec tous leurs détails
  public async getAllRecipes({ response }: HttpContext) {
    try {
      const recipes = await Recipe.query()
        .preload('categories')
        .preload('versions', (versionQuery) => {
          versionQuery.preload('ingredients').preload('steps').preload('utensils').preload('tips')
        })

      return response.json(recipes)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Erreur lors de la récupération des recettes', error })
    }
  }

  // Récupérer une recette complète par ID avec tous les détails
  public async show({ params, response }: HttpContext) {
    try {
      const recipe = await Recipe.findOrFail(params.id)
      await recipe.load((loader) => {
        loader.preload('categories').preload('versions', (versionQuery) => {
          versionQuery
            .preload('ingredients')
            .preload('recipeDetails', (recipeQuery) => {
              recipeQuery.preload('unit')
            })
            .preload('steps')
            .preload('utensils')
            .preload('tips')
        })
      })
      return response.json(recipe)
    } catch (error) {
      return response.status(404).json({ message: 'Recette non trouvée' })
    }
  }

  public async getUserRecipes({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      // Récupérer toutes les recettes où l'utilisateur a créé au moins une version
      const recipes = await Recipe.query()
        .whereHas('versions', (query) => {
          query.where('id_user', user.id)
        })
        .preload('categories')
        .preload('versions', (versionQuery) => {
          versionQuery
            .where('id_user', user.id)
            .preload('ingredients')
            .preload('steps')
            .preload('utensils')
            .preload('tips')
            .preload('recipeDetails')
        })

      return response.json(recipes)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Erreur lors de la récupération des recettes', error })
    }
  }

  // Ajouter une recette complète avec tous les détails
  public async create({ request, response, auth }: HttpContext) {
    const trx = await db.transaction()
    const user = auth.user!

    try {
      // Vérification de l'image
      const image = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'png', 'webp'],
      })

      // Traitement de l'image si elle existe
      let imagePath: string | undefined
      if (image && image.isValid) {
        const result = await this.imageService.processRecipeImage(image)
        if (result.state === 'moved') {
          imagePath = `recipes/${result.fileName}`
        }
      }

      // Récupération des données
      const rawData = request.input('recipeData')

      if (!rawData) {
        return response.status(400).json({
          message: 'Données de recette manquantes',
          received: request.all(),
        })
      }

      let parsedData
      try {
        parsedData = JSON.parse(rawData)
      } catch (error) {
        console.error('Erreur parsing JSON:', error)
        return response.status(400).json({
          message: 'Format de données invalide',
          error: error.message,
          rawData,
        })
      }

      const { name, versionData, ingredients, steps, utensils, categories, tips } = parsedData

      // Création de la recette avec l'image
      const recipe = await Recipe.create(
        {
          name,
          image_url: imagePath,
        },
        { client: trx }
      )

      // Création de la version
      const version = await Version.create(
        {
          ...versionData,
          id_recipe: recipe.id,
          id_user: user.id,
        },
        { client: trx }
      )

      // Création des ingrédients
      for (const ingredientData of ingredients) {
        let ingredient = await Ingredient.firstOrCreate(
          { name: ingredientData.name },
          {},
          { client: trx }
        )
        await RecipeDetail.create(
          {
            quantity: ingredientData.quantity,
            id_version: version.id,
            id_ingredient: ingredient.id,
            id_unit: ingredientData.unit_id,
            id_ingredient_type: ingredientData.ingredient_type_id,
          },
          { client: trx }
        )
      }

      // Création des étapes
      for (const stepData of steps) {
        await Step.create(
          {
            ...stepData,
            id_version: version.id,
          },
          { client: trx }
        )
      }

      // Gestion des ustensiles
      for (const utensilName of utensils) {
        let utensil = await Utensil.firstOrCreate({ name: utensilName }, {}, { client: trx })
        await version.related('utensils').attach([utensil.id], trx)
      }

      // Gestion des catégories
      if (categories && categories.length > 0) {
        await recipe.related('categories').attach(categories, trx)
      }

      // Gestion des conseils
      if (tips && tips.length > 0) {
        for (const tipData of tips) {
          await version.related('tips').create({ tipText: tipData }, { client: trx })
        }
      }

      await trx.commit()
      return response.status(201).json({
        message: 'Recette ajoutée avec succès',
        recipe: {
          ...recipe.toJSON(),
          image_url: imagePath,
        },
      })
    } catch (error) {
      await trx.rollback()
      console.error('Erreur lors de la création:', error)
      return response.status(400).json({
        message: 'Erreur lors de la création de la recette',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  // Mettre à jour une recette complète
  public async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      const recipe = await Recipe.findOrFail(params.id)

      // Vérification de l'image
      const image = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'png', 'webp'],
      })

      // Traitement de la nouvelle image si fournie
      let imagePath = recipe.image_url // Garde l'ancienne image par défaut
      if (image && image.isValid) {
        const result = await this.imageService.processRecipeImage(image)
        if (result.state === 'moved') {
          imagePath = `recipes/${result.fileName}`
        }
      }

      // Récupération et parsing des données JSON
      const rawData = request.input('recipeData')
      if (!rawData) {
        return response.status(400).json({ message: 'Données de recette manquantes' })
      }

      const { name, versionData, ingredients, steps, utensils, categories, tips } =
        JSON.parse(rawData)

      // Vérifier si l'utilisateur a une version de cette recette
      const userHasVersion = await Version.query()
        .where('id_recipe', recipe.id)
        .where('id_user', user.id)
        .first()

      if (!userHasVersion && user.role !== 'admin') {
        return response.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier cette recette",
        })
      }

      // Mise à jour de la recette
      recipe.name = name
      recipe.image_url = imagePath
      await recipe.save()

      // Récupérer le dernier numéro de version
      const lastVersion = await Version.query()
        .where('id_recipe', recipe.id)
        .orderBy('versionNumber', 'desc')
        .first()

      const newVersionNumber = (lastVersion?.versionNumber || 0) + 1

      const newVersion = await Version.create({
        ...versionData,
        versionNumber: newVersionNumber,
        id_recipe: recipe.id,
        id_user: user.id,
      })

      // Créer les nouveaux ingrédients
      for (const ingredientData of ingredients) {
        const ingredient = await Ingredient.firstOrCreate({ name: ingredientData.name })

        // Ensuite créer l'association dans recipe_detail avec les bonnes quantités
        await RecipeDetail.create({
          quantity: ingredientData.quantity,
          id_version: newVersion.id,
          id_ingredient: ingredient.id,
          id_unit: ingredientData.unit_id,
          id_ingredient_type: ingredientData.ingredient_type_id,
        })
      }

      // Créer les nouvelles étapes

      if (!Array.isArray(steps)) {
        throw new Error('Les étapes doivent être un tableau')
      }

      for (const [i, stepData] of steps.entries()) {
        await Step.create({
          stepOrder: i + 1,
          description: stepData.description,
          temperature: stepData.temperature || null,
          speed: stepData.speed || null,
          id_version: newVersion.id,
        })
      }

      // Gérer les ustensiles
      const utensilIds = await Promise.all(
        utensils.map(async (utensilName: any) => {
          const utensil = await Utensil.firstOrCreate({ name: utensilName })
          return utensil.id
        })
      )
      await newVersion.related('utensils').sync(utensilIds)

      // Gérer les catégories
      if (categories && categories.length > 0) {
        await recipe.related('categories').sync(categories)
      }

      // Gérer les conseils
      if (tips && tips.length > 0) {
        for (const tipData of tips) {
          await newVersion.related('tips').create({ tipText: tipData })
        }
      }

      await this.cleanUpOldVersions(recipe.id)

      return response.json({
        message: 'Nouvelle version de la recette ajoutée avec succès',
        newVersion,
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({ message: 'Recette non trouvée' })
      }
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour de la recette',
        error: error.message,
      })
    }
  }

  // Méthode pour supprimer les versions les plus anciennes pour garder uniquement la version principale et les deux dernières.
  private async cleanUpOldVersions(recipeId: number) {
    const versions = await Version.query()
      .where('id_recipe', recipeId)
      .orderBy('versionNumber', 'desc')

    if (versions.length > 3) {
      const versionsToDelete = versions.slice(3) // Conserve les 3 premières et sélectionne le reste

      for (const version of versionsToDelete) {
        await version.delete()
      }
    }
  }

  // Supprimer une recette complète
  public async destroy({ params, response }: HttpContext) {
    try {
      const recipe = await Recipe.findOrFail(params.id)

      // Supprime d'abord toutes les versions associées
      await Version.query().where('id_recipe', recipe.id).delete()

      // Puis supprime la recette
      await recipe.delete()

      return response.json({
        message: 'Recette supprimée avec succès',
        recipeId: recipe.id,
      })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          message: 'Recette non trouvée',
        })
      }
      return response.status(500).json({
        message: 'Erreur lors de la suppression de la recette',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  // ---- Partie Admin ----
  public async getAdminRecipes({ response }: HttpContext) {
    try {
      const recipes = await Recipe.query().preload('versions', (versionsQuery) => {
        versionsQuery
          .select('id', 'name', 'version_number', 'creation_date', 'id_user', 'id_recipe')
          .orderBy('version_number', 'desc')
          .preload('user', (userQuery) => {
            userQuery.select('id', 'username')
          })
      })

      const formattedRecipes = recipes.map((recipe) => {
        // On prend la première version (la plus récente) s'il y en a
        const latestVersion = recipe.versions?.[0]

        return {
          id: recipe.id,
          name: recipe.name,
          versionNumber: latestVersion?.versionNumber ?? null,
          createdAt: latestVersion?.createdAt ?? null,
          author: latestVersion?.user
            ? {
                id: latestVersion.user.id,
                username: latestVersion.user.username,
              }
            : null,
        }
      })

      return response.json(formattedRecipes)
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes:', error)
      return response.status(500).json({
        message: 'Erreur lors de la récupération des recettes',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }
}
