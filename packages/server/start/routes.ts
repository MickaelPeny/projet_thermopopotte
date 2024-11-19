/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Controllers
const UsersController = () => import('#controllers/users_controller')
const RecipeController = () => import('#controllers/recipes_controller')
const SessionController = () => import('#controllers/session_controller')
const CommentsController = () => import('#controllers/comments_controller')
const RecipeCategoriesController = () => import('#controllers/recipe_categories_controller')
const IngredientCategoriesController = () => import('#controllers/ingredient_categories_controller')
const UtensilsController = () => import('#controllers/utensils_controller')
const UnitsController = () => import('#controllers/units_controller')

// Routes publiques
router.get('/all-recipes', [RecipeController, 'getAllRecipes'])
router.get('/recipes', [RecipeController, 'index'])
router.get('/recipes/:id', [RecipeController, 'show'])
router.get('/csrf-cookie', async ({ response }) => {
  response.send('CSRF cookie initialized')
})

// Route d'upload
const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

router.get('/uploads/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('uploads', normalizedPath)
  return response.download(absolutePath)
})

// Routes d'authentification (publiques)
router.post('login', [SessionController, 'store'])
router.post('register', [SessionController, 'register'])

// Routes protégées
router
  .group(() => {
    // Routes de gestion de session
    router.get('me', [SessionController, 'show'])
    router.post('logout', [SessionController, 'destroy'])

    // Routes CRUD utilisateurs
    router.get('users', [UsersController, 'index'])
    router.get('users/:id', [UsersController, 'show'])
    router.put('users/:id', [UsersController, 'update'])
    // Route réservée aux admins
    router
      .group(() => {
        router.delete('users/:id', [UsersController, 'destroy'])
      })
      .use(middleware.admin())

    // Routes CRUD recettes
    router
      .group(() => {
        router.post('/recipes', [RecipeController, 'create'])
        router.put('/recipes/:id', [RecipeController, 'update'])
        router.get('/recipes/user', [RecipeController, 'getUserRecipes'])
      })
      .prefix('/api')
      .use(middleware.auth())

    // Routes réservées aux admins
    router
      .group(() => {
        router.get('/recipes', [RecipeController, 'getAdminRecipes'])
        router.delete('/recipes/:id', [RecipeController, 'destroy'])
        router.get('/check-admin', [SessionController, 'checkAdminStatus'])
      })
      .prefix('/api')
      .use(middleware.admin())
    router
      .group(() => {
        // Routes des commentaires
        router.get('/versions/:versionId/comments', [CommentsController, 'index'])
        router.post('/comments', [CommentsController, 'store'])
        router.put('/comments/:id', [CommentsController, 'update'])
        router.delete('/comments/:id', [CommentsController, 'destroy'])
      })
      .prefix('/api')
      .use(middleware.auth())

    // Routes CRUD pour les catégories de recettes
    router
      .group(() => {
        router.get('/recipe-categories', [RecipeCategoriesController, 'index'])
        router.get('/recipe-categories/:id', [RecipeCategoriesController, 'show'])
        router.post('/recipe-categories', [RecipeCategoriesController, 'store'])
        router.put('/recipe-categories/:id', [RecipeCategoriesController, 'update'])
        router.delete('/recipe-categories/:id', [RecipeCategoriesController, 'destroy'])
      })
      .prefix('/api')
      .use(middleware.auth())
    // Routes CRUD pour les unités
    router
      .group(() => {
        router.get('/units', [UnitsController, 'index'])
      })
      .prefix('/api')
      .use(middleware.auth())

    // Routes CRUD pour les catégories d'ingrédients
    router
      .group(() => {
        router.get('/ingredient-categories', [IngredientCategoriesController, 'index'])
        router.get('/ingredient-categories/:id', [IngredientCategoriesController, 'show'])
        router.post('/ingredient-categories', [IngredientCategoriesController, 'store'])
        router.put('/ingredient-categories/:id', [IngredientCategoriesController, 'update'])
        router.delete('/ingredient-categories/:id', [IngredientCategoriesController, 'destroy'])
      })
      .prefix('/api')
      .use(middleware.auth())

    // Routes CRUD pour les ustensiles
    router
      .group(() => {
        router.get('/utensils', [UtensilsController, 'index'])
        router.get('/utensils/:id', [UtensilsController, 'show'])
        router.post('/utensils', [UtensilsController, 'store'])
        router.put('/utensils/:id', [UtensilsController, 'update'])
        router.delete('/utensils/:id', [UtensilsController, 'destroy'])
      })
      .prefix('/api')
      .use(middleware.auth())
  })

  .use(middleware.auth())
