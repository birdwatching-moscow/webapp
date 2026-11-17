import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { PASSWORD_MIN_LENGTH } from '@/lib/constants'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Printable ASCII only (latin letters, digits, symbols) — same rule as admin set-password
const NON_LATIN_PASSWORD_CHAR = /[^\x21-\x7E]/

/** Rules for a new admin password; returns an error message, or null when it is valid. */
export const validateNewPassword = (value: string): string | null => {
  if (NON_LATIN_PASSWORD_CHAR.test(value)) return AUTH_LABELS.adminSetPassword.latinOnly
  if (value.length < PASSWORD_MIN_LENGTH) return AUTH_LABELS.adminSetPassword.tooShort
  return null
}

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
