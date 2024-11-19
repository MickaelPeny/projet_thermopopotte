import vine from '@vinejs/vine'

export const commentValidator = vine.compile(
  vine.object({
    comment_text: vine.string().trim().minLength(2).maxLength(1000),
    rating: vine.number().min(0).max(5),
    id_version: vine.number(),
  })
)
