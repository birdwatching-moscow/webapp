import { describe, it, expect, vi, beforeEach } from 'vitest'

// Rate limits must key on the real client IP. The leftmost X-Forwarded-For entry
// comes from the client, so a bot could forge a new one per request and dodge the limit.

const { checkRateLimitMock, checkContactFormRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(),
  checkContactFormRateLimitMock: vi.fn(),
}))

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: checkRateLimitMock,
  checkContactFormRateLimit: checkContactFormRateLimitMock,
  checkEmailCodeRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfterSeconds: 0 }),
}))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/lib/mail', () => ({ sendMail: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { POST as checkEmail } from '@/app/api/auth/check-email/route'
import { POST as requestLoginCode } from '@/app/api/auth/request-login-code/route'
import { POST as register } from '@/app/api/auth/register/route'
import { POST as verifyLoginCode } from '@/app/api/auth/verify-login-code/route'
import { POST as verifyRegistrationCode } from '@/app/api/auth/verify-registration-code/route'
import { POST as setInitialPassword } from '@/app/api/auth/set-initial-password/route'
import { POST as contactRequest } from '@/app/api/requests/route'

const REAL_IP = '5.5.5.5'
const FORGED_IP = '1.2.3.4'
const BLOCKED = { allowed: false, retryAfterSeconds: 30 }

const forgedRequest = () =>
  new Request('http://localhost/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': REAL_IP,
      'x-forwarded-for': `${FORGED_IP}, ${REAL_IP}`,
    },
    body: JSON.stringify({}),
  })

beforeEach(() => {
  vi.clearAllMocks()
  checkRateLimitMock.mockReturnValue(BLOCKED)
  checkContactFormRateLimitMock.mockReturnValue(BLOCKED)
})

describe('rate limits key on the real client IP, not a forged X-Forwarded-For', () => {
  it.each([
    ['check-email', checkEmail],
    ['request-login-code', requestLoginCode],
    ['register', register],
    ['verify-login-code', verifyLoginCode],
    ['verify-registration-code', verifyRegistrationCode],
    ['set-initial-password', setInitialPassword],
  ] as const)('%s', async (_name, handler) => {
    await handler(forgedRequest())
    expect(checkRateLimitMock).toHaveBeenCalledWith(REAL_IP, expect.any(String))
  })

  it('requests (contact forms)', async () => {
    await contactRequest(forgedRequest())
    expect(checkContactFormRateLimitMock).toHaveBeenCalledWith(REAL_IP)
  })
})
