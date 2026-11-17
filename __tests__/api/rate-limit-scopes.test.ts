import { describe, it, expect, vi, beforeEach } from 'vitest'

// Each route must use its own rate-limit budget. A shared bucket made a normal
// login (check-email → request-login-code → verify-login-code) hit 429.
// The limiter is mocked to block, so every route returns right after the check.

const { checkRateLimitMock, authMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(),
  authMock: vi.fn(),
}))

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: checkRateLimitMock,
  checkEmailCodeRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfterSeconds: 0 }),
}))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/lib/mail', () => ({ sendMail: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/payments/yookassa', () => ({ createPayment: vi.fn() }))

import { POST as checkEmail } from '@/app/api/auth/check-email/route'
import { POST as requestLoginCode } from '@/app/api/auth/request-login-code/route'
import { POST as register } from '@/app/api/auth/register/route'
import { POST as verifyLoginCode } from '@/app/api/auth/verify-login-code/route'
import { POST as verifyRegistrationCode } from '@/app/api/auth/verify-registration-code/route'
import { POST as setInitialPassword } from '@/app/api/auth/set-initial-password/route'
import { POST as checkout } from '@/app/api/checkout/route'

const IP = '9.9.9.9'
const USER_ID = 'user-1'
const TOO_MANY_REQUESTS = 429

const request = () =>
  new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': IP },
    body: JSON.stringify({}),
  })

beforeEach(() => {
  vi.clearAllMocks()
  checkRateLimitMock.mockReturnValue({ allowed: false, retryAfterSeconds: 30 })
  authMock.mockResolvedValue({ user: { id: USER_ID, role: 'USER' } })
})

describe('each route checks its own rate-limit scope', () => {
  it.each([
    ['check-email', checkEmail, 'checkEmail'],
    ['request-login-code', requestLoginCode, 'sendCode'],
    ['register', register, 'sendCode'],
    ['verify-login-code', verifyLoginCode, 'verifyCode'],
    ['verify-registration-code', verifyRegistrationCode, 'verifyCode'],
    ['set-initial-password', setInitialPassword, 'setInitialPassword'],
  ] as const)('%s uses its own scope (by IP)', async (_name, handler, scope) => {
    const res = await handler(request())
    expect(res.status).toBe(TOO_MANY_REQUESTS)
    expect(checkRateLimitMock).toHaveBeenCalledWith(IP, scope)
  })

  it('checkout → checkout (by user id)', async () => {
    const res = await checkout(request())
    expect(res.status).toBe(TOO_MANY_REQUESTS)
    expect(checkRateLimitMock).toHaveBeenCalledWith(USER_ID, 'checkout')
  })
})
