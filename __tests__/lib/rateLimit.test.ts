import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const { logWarnMock } = vi.hoisted(() => ({ logWarnMock: vi.fn() }))
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: logWarnMock, error: vi.fn(), child: vi.fn() }),
}))

import {
  checkRateLimit,
  checkEmailCodeRateLimit,
  EMAIL_CODE_LIMIT,
  RATE_LIMITS,
  _resetStoreForTesting,
  type RateLimitScope,
} from '@/lib/rateLimit'
import { LOGIN_CODE_RESEND_WINDOW_MS } from '@/lib/constants'

const IP = '1.2.3.4'
const EMAIL = 'user@test.com'
const ONE_MINUTE_MS = 60_000

beforeEach(() => {
  _resetStoreForTesting()
  logWarnMock.mockClear()
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

describe('checkEmailCodeRateLimit — codes sent to one email', () => {
  it('allows 3 codes per resend window (was 1, which blocked "back → send again")', () => {
    expect(EMAIL_CODE_LIMIT).toEqual({ maxRequests: 3, windowMs: LOGIN_CODE_RESEND_WINDOW_MS })
  })

  it('going back and requesting the code again within a minute is allowed', () => {
    expect(checkEmailCodeRateLimit(EMAIL).allowed).toBe(true)
    expect(checkEmailCodeRateLimit(EMAIL).allowed).toBe(true)
  })

  it('blocks the 4th code within the window with a retry time', () => {
    for (let i = 0; i < EMAIL_CODE_LIMIT.maxRequests; i++) {
      expect(checkEmailCodeRateLimit(EMAIL).allowed).toBe(true)
    }
    const blocked = checkEmailCodeRateLimit(EMAIL)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('different emails have independent budgets', () => {
    for (let i = 0; i <= EMAIL_CODE_LIMIT.maxRequests; i++) checkEmailCodeRateLimit(EMAIL)
    expect(checkEmailCodeRateLimit('other@test.com').allowed).toBe(true)
  })
})

describe('rate limit rejections are logged (to see which limit fired)', () => {
  it('logs the scope when a route limit blocks', () => {
    exhaust('sendCode')
    expect(logWarnMock).toHaveBeenCalledWith(
      'rate limited',
      expect.objectContaining({ scope: 'sendCode', retryAfterSeconds: expect.any(Number) })
    )
  })

  it('logs the email-code scope when the per-email limit blocks', () => {
    for (let i = 0; i <= EMAIL_CODE_LIMIT.maxRequests; i++) checkEmailCodeRateLimit(EMAIL)
    expect(logWarnMock).toHaveBeenCalledWith('rate limited', expect.objectContaining({ scope: 'emailCode' }))
  })

  it('never writes the IP or email into the log', () => {
    exhaust('sendCode')
    for (let i = 0; i <= EMAIL_CODE_LIMIT.maxRequests; i++) checkEmailCodeRateLimit(EMAIL)
    const logged = JSON.stringify(logWarnMock.mock.calls)
    expect(logged).not.toContain(IP)
    expect(logged).not.toContain(EMAIL)
  })

  it('does not log allowed requests', () => {
    checkRateLimit(IP, 'checkEmail')
    checkEmailCodeRateLimit(EMAIL)
    expect(logWarnMock).not.toHaveBeenCalled()
  })
})
