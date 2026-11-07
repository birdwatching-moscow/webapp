import { AUTH_ERRORS } from '@/lib/auth-errors'

export function mapOtpVerifyError(error?: string): string {
  if (error === 'expired_code') return AUTH_ERRORS.expiredCode
  if (error === 'too_many_attempts') return AUTH_ERRORS.tooManyAttempts
  return AUTH_ERRORS.invalidCode
}
