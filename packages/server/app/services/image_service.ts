import type { MultipartFile } from '@adonisjs/core/bodyparser'
import sharp from 'sharp'
import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'

export class ImageService {
  async processRecipeImage(uploadedFile: MultipartFile) {
    try {
      const fileName = `${randomUUID()}.webp`
      const filePath = app.makePath('uploads/recipes', fileName)

      // Traiter et sauvegarder directement l'image
      await sharp(uploadedFile.tmpPath)
        .webp({ quality: 80 })
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(filePath)

      return {
        fileName,
        state: 'moved',
      }
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error)
      throw error
    }
  }
}
