const IP_WINDOW_MS = 60_000
const IP_MAX_REQUESTS = 2

const EMAIL_WINDOW_MS = 60_000
const EMAIL_MAX_REQUESTS = 1

const CONTACT_FORM_WINDOW_MS = 10 * 60_000  // 10 minutes
const CONTACT_FORM_MAX_REQUESTS = 3

const ipStore = new Map<string, { count: number; expiresAt: number }>()
const emailStore = new Map<string, { count: number; expiresAt: number }>()
const contactFormStore = new Map<string, { count: number; expiresAt: number }>()

export function _resetStoreForTesting(): void {
  ipStore.clear()
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

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  return check(ipStore, ip, IP_MAX_REQUESTS, IP_WINDOW_MS)
}

export function checkEmailCodeRateLimit(email: string): { allowed: boolean; retryAfterSeconds: number } {
  return check(emailStore, email, EMAIL_MAX_REQUESTS, EMAIL_WINDOW_MS)
}

export function checkContactFormRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  return check(contactFormStore, ip, CONTACT_FORM_MAX_REQUESTS, CONTACT_FORM_WINDOW_MS)
}
