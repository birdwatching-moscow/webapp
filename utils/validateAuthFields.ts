import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { PASSWORD_MIN_LENGTH } from '@/lib/constants'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Printable ASCII only (latin letters, digits, symbols); spaces are not allowed
const NON_LATIN_PASSWORD_CHAR = /[^\x21-\x7E]/
const ASP = AUTH_LABELS.adminSetPassword

/** Live check while typing a new password: latin-only message, or '' when fine. */
export const latinOnlyError = (value: string): string =>
  NON_LATIN_PASSWORD_CHAR.test(value) ? ASP.latinOnly : ''

/**
 * Rules for setting an admin password — the first password (/login) and a
 * reset use the same ones. Checked in order; the first failure wins.
 */
export const validateNewPasswordPair = (
  password: string,
  confirm: string,
): { passwordError: string; confirmError: string } => {
  if (latinOnlyError(password)) return { passwordError: ASP.latinOnly, confirmError: '' }
  if (latinOnlyError(confirm)) return { passwordError: '', confirmError: ASP.latinOnly }
  if (password.length < PASSWORD_MIN_LENGTH) return { passwordError: ASP.tooShort, confirmError: '' }
  if (password !== confirm) return { passwordError: '', confirmError: ASP.mismatch }
  return { passwordError: '', confirmError: '' }
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
