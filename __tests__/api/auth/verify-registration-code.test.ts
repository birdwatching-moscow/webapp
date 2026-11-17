import { describe, it, expect, vi, beforeEach } from 'vitest'

const { prismaMock, sendMailMock } = vi.hoisted(() => ({
  prismaMock: {
    loginCode: { findFirst: vi.fn(), update: vi.fn() },
    user: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
  sendMailMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/mail', () => ({ sendMail: sendMailMock }))
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfterSeconds: 0 }),
}))
vi.mock('@/lib/auth/csrf', () => ({ verifyLoginCsrfToken: vi.fn().mockReturnValue(true) }))

import { POST } from '@/app/api/auth/verify-registration-code/route'
import { HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'

const EMAIL = 'old@test.com'
const VALID_CODE = { id: 'code-1', email: EMAIL, usedAt: null, attempts: 0, expiresAt: new Date(Date.now() + 60_000) }
const EXISTING_USER = { id: 'u-1', email: EMAIL, name: 'Мария', role: 'USER', blockedAt: null, deletedAt: null }

function makeReq(name = 'Иван') {
  return new Request('http://localhost/api/auth/verify-registration-code', {
    method: HTTP_METHOD.POST,
    headers: { ...JSON_HEADERS, 'x-csrf-token': 'csrf' },
    body: JSON.stringify({ email: EMAIL, code: '1234', name }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.loginCode.findFirst.mockResolvedValue(VALID_CODE)
  prismaMock.user.create.mockResolvedValue({ id: 'new-1' })
  sendMailMock.mockResolvedValue(undefined)
})

describe('POST /api/auth/verify-registration-code — new email', () => {
  it('creates the user with the typed name and sends a welcome email', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    const res = await POST(makeReq('Иван'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ next: 'session' })
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: EMAIL, name: 'Иван' }) })
    )
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ kind: 'welcome' }))
  })
})

describe('POST /api/auth/verify-registration-code — email already registered', () => {
  it('lets the user sign in: returns { next: "session" } instead of already_registered', async () => {
    prismaMock.user.findFirst.mockResolvedValue(EXISTING_USER)
    const res = await POST(makeReq('Иван'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ next: 'session' })
  })

  it('does not change the name in the database', async () => {
    prismaMock.user.findFirst.mockResolvedValue(EXISTING_USER)
    await POST(makeReq('Иван'))
    expect(prismaMock.user.create).not.toHaveBeenCalled()
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('does not send a welcome email', async () => {
    prismaMock.user.findFirst.mockResolvedValue(EXISTING_USER)
    await POST(makeReq('Иван'))
    expect(sendMailMock).not.toHaveBeenCalled()
  })

  it('leaves the code unconsumed so signIn("login-code") can use it', async () => {
    prismaMock.user.findFirst.mockResolvedValue(EXISTING_USER)
    await POST(makeReq('Иван'))
    expect(prismaMock.loginCode.update).not.toHaveBeenCalled()
  })
})
