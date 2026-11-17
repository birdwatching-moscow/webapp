import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, RATE_LIMITS, _resetStoreForTesting, type RateLimitScope } from '@/lib/rateLimit'

const IP = '1.2.3.4'
const ONE_MINUTE_MS = 60_000

beforeEach(() => {
  _resetStoreForTesting()
  vi.useRealTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/** Spend the whole budget for `scope` and return the next (first blocked) result. */
function exhaust(scope: RateLimitScope, key = IP) {
  for (let i = 0; i < RATE_LIMITS[scope].maxRequests; i++) {
    expect(checkRateLimit(key, scope).allowed).toBe(true)
  }
  return checkRateLimit(key, scope)
}

describe('RATE_LIMITS — agreed per-route budgets (per minute)', () => {
  it.each([
    ['checkEmail', 10],
    ['sendCode', 5],
    ['verifyCode', 10],
    ['setInitialPassword', 5],
    ['checkout', 10],
  ] as const)('%s allows %i requests per minute', (scope, max) => {
    expect(RATE_LIMITS[scope]).toEqual({ maxRequests: max, windowMs: ONE_MINUTE_MS })
  })
})

describe('checkRateLimit — budget per scope', () => {
  it.each(Object.keys(RATE_LIMITS) as RateLimitScope[])(
    '%s: allows exactly its budget, then blocks with retryAfterSeconds',
    scope => {
      const blocked = exhaust(scope)
      expect(blocked.allowed).toBe(false)
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
      expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(RATE_LIMITS[scope].windowMs / 1000)
    }
  )
})

describe('checkRateLimit — scopes are independent (regression: shared 2/min bucket)', () => {
  it('a normal login (check email → send code → verify code) is never rate limited', () => {
    expect(checkRateLimit(IP, 'checkEmail').allowed).toBe(true)
    expect(checkRateLimit(IP, 'sendCode').allowed).toBe(true)
    expect(checkRateLimit(IP, 'verifyCode').allowed).toBe(true)
  })

  it('a few wrong codes plus a resend still fit in one minute', () => {
    checkRateLimit(IP, 'checkEmail')
    checkRateLimit(IP, 'sendCode')
    for (let i = 0; i < 3; i++) expect(checkRateLimit(IP, 'verifyCode').allowed).toBe(true)
    expect(checkRateLimit(IP, 'sendCode').allowed).toBe(true)
    expect(checkRateLimit(IP, 'verifyCode').allowed).toBe(true)
  })

  it('exhausting one scope does not affect another', () => {
    expect(exhaust('checkEmail').allowed).toBe(false)
    expect(checkRateLimit(IP, 'verifyCode').allowed).toBe(true)
    expect(checkRateLimit(IP, 'sendCode').allowed).toBe(true)
  })

  it('different keys have independent counters within a scope', () => {
    expect(exhaust('sendCode', 'a').allowed).toBe(false)
    expect(checkRateLimit('b', 'sendCode').allowed).toBe(true)
  })
})

describe('checkRateLimit — fixed window', () => {
  it('retryAfterSeconds decreases as time passes within the window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    exhaust('sendCode')

    vi.setSystemTime(10_000)
    const result = checkRateLimit(IP, 'sendCode')
    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(50)
  })

  it('a blocked client retrying repeatedly does not extend the window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    exhaust('sendCode')
    for (let i = 0; i < 10; i++) checkRateLimit(IP, 'sendCode')

    vi.setSystemTime(ONE_MINUTE_MS + 1)
    expect(checkRateLimit(IP, 'sendCode')).toEqual({ allowed: true, retryAfterSeconds: 0 })
  })

  it('the full budget is available again after the window expires', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    expect(exhaust('verifyCode').allowed).toBe(false)

    vi.setSystemTime(ONE_MINUTE_MS + 1)
    expect(exhaust('verifyCode').allowed).toBe(false)
  })
})
