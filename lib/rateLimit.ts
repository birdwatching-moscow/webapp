import { LOGIN_CODE_RESEND_WINDOW_MS } from '@/lib/constants'
import { createLogger } from '@/lib/logger'

const ONE_MINUTE_MS = 60_000
const MS_PER_SECOND = 1000

const log = createLogger('rate-limit')

/**
 * Per-route budgets. Each scope has its own counter, so the steps of one flow
 * (check email → send code → verify code) never eat each other's budget.
 * Brute force on codes is additionally capped per code by LOGIN_CODE_MAX_ATTEMPTS,
 * and sending codes per email by checkEmailCodeRateLimit.
 */
export const RATE_LIMITS = {
  /** POST /api/auth/check-email */
  checkEmail:         { maxRequests: 10, windowMs: ONE_MINUTE_MS },
  /** POST /api/auth/request-login-code, /api/auth/register — both send an email */
  sendCode:           { maxRequests: 5,  windowMs: ONE_MINUTE_MS },
  /** POST /api/auth/verify-login-code, /api/auth/verify-registration-code */
  verifyCode:         { maxRequests: 10, windowMs: ONE_MINUTE_MS },
  /** POST /api/auth/set-initial-password */
  setInitialPassword: { maxRequests: 5,  windowMs: ONE_MINUTE_MS },
  /** POST /api/checkout — keyed by user id */
  checkout:           { maxRequests: 10, windowMs: ONE_MINUTE_MS },
} as const

export type RateLimitScope = keyof typeof RATE_LIMITS

/**
 * Codes emailed to one address. 3 per window lets people go back and request
 * again or resend once or twice, while still stopping mail-bombing an inbox.
 */
export const EMAIL_CODE_LIMIT = { maxRequests: 3, windowMs: LOGIN_CODE_RESEND_WINDOW_MS } as const

const CONTACT_FORM_LIMIT = { maxRequests: 3, windowMs: 10 * ONE_MINUTE_MS } as const

type Entry = { count: number; expiresAt: number }
type Result = { allowed: boolean; retryAfterSeconds: number }

const scopedStore = new Map<string, Entry>()
const emailStore = new Map<string, Entry>()
const contactFormStore = new Map<string, Entry>()

export function _resetStoreForTesting(): void {
  scopedStore.clear()
  emailStore.clear()
  contactFormStore.clear()
}

/**
 * Fixed-window counter. `scope` is only a label for the log — the key (IP or
 * email) is never logged.
 */
function check(
  store: Map<string, Entry>,
  scope: string,
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number },
): Result {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.expiresAt - now) / MS_PER_SECOND)
    log.warn('rate limited', { scope, retryAfterSeconds })
    return { allowed: false, retryAfterSeconds }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

/** `key` is the client IP (or user id for checkout); `scope` picks the route's budget. */
export function checkRateLimit(key: string, scope: RateLimitScope): Result {
  return check(scopedStore, scope, `${scope}:${key}`, RATE_LIMITS[scope])
}

export function checkEmailCodeRateLimit(email: string): Result {
  return check(emailStore, 'emailCode', email, EMAIL_CODE_LIMIT)
}

export function checkContactFormRateLimit(ip: string): Result {
  return check(contactFormStore, 'contactForm', ip, CONTACT_FORM_LIMIT)
}
