import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    username: vine
      .string()
      .trim()
      .alphaNumeric({
        allowSpaces: false,
        allowUnderscores: true,
        allowDashes: true,
      })
      .minLength(2)
      .maxLength(30),

    email: vine
      .string()
      .email()
      .trim()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),

    password: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  })
)
