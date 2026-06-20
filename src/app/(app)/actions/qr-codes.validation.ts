import { z } from 'zod'
import { isQRCodeColorValid } from '~/lib/qr-color'
import { emailValidation, stringValidation } from '~/lib/validations'

export const qrCodeTypeSchema = z.enum(['website', 'email', 'sms', 'phone'])
export const qrCodeColorModeSchema = z.enum(['finderPattern', 'full'])

export const qrCodeSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Slug must be at least 3 characters')
  .max(80, 'Slug must be 80 characters or less')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and hyphens only'
  )

const baseQRCodeSchema = z.object({
  organizationId: stringValidation,
  name: stringValidation,
  isDynamic: z.boolean().default(false),
  slug: qrCodeSlugSchema.optional().nullable(),
  logoUploadId: stringValidation.optional().nullable(),
  type: qrCodeTypeSchema,
  colorCode: z.string().trim().refine(isQRCodeColorValid, {
    message: 'Enter a valid hex color, like #000000.'
  }),
  colorMode: qrCodeColorModeSchema.default('finderPattern'),
  website: z.string().url('Enter a valid URL').optional().nullable(),
  phoneNumber: z.string().trim().min(1).max(40).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  email: emailValidation.optional().nullable(),
  subject: z.string().trim().max(255).optional().nullable()
})

export const createQRCodeSchema = baseQRCodeSchema.superRefine((value, ctx) => {
  addDestinationIssues(value, ctx)
})

export const updateQRCodeSchema = baseQRCodeSchema
  .extend({
    id: stringValidation
  })
  .superRefine((value, ctx) => {
    addDestinationIssues(value, ctx)
  })

export const getQRCodeSchema = z.object({
  organizationId: stringValidation,
  id: stringValidation
})

export const deleteQRCodeSchema = getQRCodeSchema

function addDestinationIssues(
  value: z.infer<typeof baseQRCodeSchema>,
  ctx: z.RefinementCtx
) {
  if (value.type === 'website' && !value.website) {
    ctx.addIssue({
      code: 'custom',
      path: ['website'],
      message: 'Website URL is required'
    })
  }

  if ((value.type === 'phone' || value.type === 'sms') && !value.phoneNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['phoneNumber'],
      message: 'Phone number is required'
    })
  }

  if (value.type === 'email' && !value.email) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'Email address is required'
    })
  }
}
