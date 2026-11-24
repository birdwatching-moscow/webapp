import { z } from 'zod'

export const CheckEmailResponseSchema = z.object({
  registered: z.boolean(),
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
})

export const RateLimitErrorSchema = z.object({
  error: z.string(),
  retryAfterSeconds: z.number().optional(),
})

export type CheckEmailResponse = z.infer<typeof CheckEmailResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
