import { LOGIN_CODE_RESEND_WINDOW_MS } from '@/lib/constants'

const ONE_MINUTE_MS = 60_000

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

const EMAIL_WINDOW_MS = LOGIN_CODE_RESEND_WINDOW_MS
const EMAIL_MAX_REQUESTS = 1

const CONTACT_FORM_WINDOW_MS = 10 * 60_000  // 10 minutes
const CONTACT_FORM_MAX_REQUESTS = 3

const scopedStore = new Map<string, { count: number; expiresAt: number }>()
const emailStore = new Map<string, { count: number; expiresAt: number }>()
const contactFormStore = new Map<string, { count: number; expiresAt: number }>()

export function _resetStoreForTesting(): void {
  scopedStore.clear()
  emailStore.clear()
  contactFormStore.clear()
}

function check(
  store: Map<string, { count: number; expiresAt: number }>,
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.expiresAt - now) / 1000) }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

/** `key` is the client IP (or user id for checkout); `scope` picks the route's budget. */
export function checkRateLimit(key: string, scope: RateLimitScope): { allowed: boolean; retryAfterSeconds: number } {
  const { maxRequests, windowMs } = RATE_LIMITS[scope]
  return check(scopedStore, `${scope}:${key}`, maxRequests, windowMs)
}

export function checkEmailCodeRateLimit(email: string): { allowed: boolean; retryAfterSeconds: number } {
  return check(emailStore, email, EMAIL_MAX_REQUESTS, EMAIL_WINDOW_MS)
}

export function checkContactFormRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  return check(contactFormStore, ip, CONTACT_FORM_MAX_REQUESTS, CONTACT_FORM_WINDOW_MS)
}
