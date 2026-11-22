import { z } from 'zod'

const lineItemSchema = z.object({
  ticketTypeId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
})

export const checkoutBodySchema = z
  .object({
    walkId: z.string().uuid(),
    hasBinoculars: z.boolean().optional().default(false),
    quantity: z.number().int().min(1).max(10).optional(),
    lineItems: z.array(lineItemSchema).min(1).max(5).optional(),
  })
  .refine(
    (d) => d.quantity !== undefined || (d.lineItems && d.lineItems.length > 0),
    { message: 'Provide quantity or lineItems' }
  )
