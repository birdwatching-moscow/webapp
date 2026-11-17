import { AUTH_ERRORS } from '@/lib/auth-errors'
import { HTTP_STATUS_TOO_MANY_REQUESTS } from '@/lib/constants'
import {
  defaultTooManyAttemptsMessage,
  retryAfterSeconds,
  tooManyAttemptsMessage,
} from '@/lib/auth/rateLimitMessage'

export function mapOtpVerifyError(error?: string): string {
  if (error === 'expired_code') return AUTH_ERRORS.expiredCode
  // Attempts for this code are used up; a new one can be sent after the resend window.
  if (error === 'too_many_attempts') return defaultTooManyAttemptsMessage()
  return AUTH_ERRORS.invalidCode
}

/** Error text for a failed verify-*-code response; a 429 shows the server's wait time. */
export function otpVerifyErrorMessage(
  res: { status?: number; headers?: Pick<Headers, 'get'> },
  body: { error?: string; retryAfterSeconds?: unknown } | null | undefined,
): string {
  if (res.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
    return tooManyAttemptsMessage(retryAfterSeconds(res, body))
  }
  return mapOtpVerifyError(body?.error)
}
