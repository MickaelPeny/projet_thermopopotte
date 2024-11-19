import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const user = await ctx.auth.use('api').authenticate()

      if (!user || user.role !== 'admin') {
        return ctx.response.forbidden({
          message: 'Accès réservé aux administrateurs',
        })
      }

      return next()
    } catch (error) {
      return ctx.response.forbidden({
        message: 'Accès refusé',
      })
    }
  }
}
