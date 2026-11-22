import { z } from 'zod'
import { MAX_NAME, PASSWORD_MIN_LENGTH } from '@/lib/constants'
import { emailField } from '@/lib/validation/fields'

// USER accounts are passwordless — registration collects no password
export const registerSchema = z.object({
  email: emailField,
  name: z.string().min(1).max(MAX_NAME),
})

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1),
})

export const requestLoginCodeSchema = z.object({
  email: emailField,
})

export const verifyLoginCodeSchema = z.object({
  email: emailField,
  code: z.string().min(1),
})

export const adminTwoFactorSchema = z.object({
  email: emailField,
  challengeToken: z.string().min(1),
  password: z.string().min(1),
})

export const setInitialPasswordSchema = z.object({
  email:          emailField,
  challengeToken: z.string().min(1),
  password:       z.string().min(PASSWORD_MIN_LENGTH),
})

export const verifyRegistrationCodeSchema = z.object({
  email: emailField,
  code: z.string().min(1),
  name: z.string().min(1).max(MAX_NAME),
})

export const requestResetSchema = z.object({
  email: emailField,
})

export const confirmResetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH),
})