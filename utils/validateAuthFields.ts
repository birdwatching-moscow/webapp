import { AUTH_ERRORS } from '@/lib/auth-errors'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns an error message for the email field, or null when it is valid. */
export const validateEmail = (value: string): string | null => {
  const email = value.trim()
  if (!email) return AUTH_ERRORS.emailRequired
  if (!EMAIL_PATTERN.test(email)) return AUTH_ERRORS.emailInvalid
  return null
}

/** Returns an error message for the name field, or null when it is valid. */
export const validateName = (value: string): string | null =>
  value.trim() ? null : AUTH_ERRORS.nameRequired
