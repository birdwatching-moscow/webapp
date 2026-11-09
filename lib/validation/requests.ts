import { z } from 'zod'
import { MAX_EMAIL } from '@/lib/constants'

const MAX_REQUEST_NAME    = 100
const MAX_REQUEST_MESSAGE = 2000

const baseName    = z.string().min(1).max(MAX_REQUEST_NAME)
const baseEmail   = z.string().email().max(MAX_EMAIL)
const baseMessage = z.string().min(1).max(MAX_REQUEST_MESSAGE)

const honeypot = { _hp: z.string().optional() }

const expeditionRequestSchema = z
  .object({
    type:         z.literal('EXPEDITION'),
    expeditionId: z.string().uuid().optional(),
    name:         baseName,
    email:        baseEmail,
    message:      z.string().max(MAX_REQUEST_MESSAGE).optional().transform(v => (v === '' ? undefined : v)),
    ...honeypot,
  })
  .strict()

const privateWalkRequestSchema = z
  .object({
    type:    z.literal('PRIVATE_WALK'),
    name:    baseName,
    email:   baseEmail,
    message: baseMessage,
    ...honeypot,
  })
  .strict()

const certificateRequestSchema = z
  .object({
    type:    z.literal('CERTIFICATE'),
    name:    baseName,
    email:   baseEmail,
    message: baseMessage,
    ...honeypot,
  })
  .strict()

const questionRequestSchema = z
  .object({
    type:    z.literal('QUESTION'),
    name:    baseName,
    email:   baseEmail,
    message: baseMessage,
    ...honeypot,
  })
  .strict()

const privateEventRequestSchema = z
  .object({
    type:    z.literal('PRIVATE_EVENT'),
    name:    baseName,
    email:   baseEmail,
    message: baseMessage,
    ...honeypot,
  })
  .strict()

export const requestBodySchema = z.discriminatedUnion('type', [
  expeditionRequestSchema,
  privateWalkRequestSchema,
  certificateRequestSchema,
  questionRequestSchema,
  privateEventRequestSchema,
])
