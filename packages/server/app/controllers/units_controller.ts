import type { HttpContext } from '@adonisjs/core/http'
import Unit from '#models/unit'

export default class UnitsController {
  public async index({ response }: HttpContext) {
    try {
      const units = await Unit.all()
      return response.json(units)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Erreur lors de la récupération des unités', error })
    }
  }
}
