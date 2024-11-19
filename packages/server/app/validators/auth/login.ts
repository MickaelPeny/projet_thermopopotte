import vine from '@vinejs/vine'

/**
 * Validator pour la connexion
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().normalizeEmail(),

    password: vine
      .string()
      .minLength(8)
      // Règles de sécurité pour le mot de passe
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  })
)
