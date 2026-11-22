import { z } from 'zod'
import { MAX_EMAIL } from '@/lib/constants'

export const emailField = z
  .string()
  .email()
  .max(MAX_EMAIL)
  .transform((v) => v.trim().toLowerCase())
