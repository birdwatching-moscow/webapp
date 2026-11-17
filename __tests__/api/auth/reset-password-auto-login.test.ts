import { describe, it, expect, vi, beforeEach } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    passwordResetToken: { findUnique: vi.fn() },
    user: { findFirst: vi.fn(), update: vi.fn() },
    adminLoginChallenge: { create: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('$2b$12$newhash'), compare: vi.fn() } }))

import { POST } from '@/app/api/auth/8qfzgof9uev06a/reset-password/route'
import { hashChallengeToken } from '@/lib/auth/challenge'
import { ADMIN_CHALLENGE_TTL_MS, HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'

const VALID_TOKEN_ROW = {
  id: 'tok-1',
  userId: 'admin-1',
  tokenHash: 'a'.repeat(64),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  usedAt: null,
}
const ADMIN = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN', deletedAt: null }
const BODY = { token: 'rawtoken123', newPassword: '1234567890123456' }

function makeReq(body: object) {
  return new Request('http://localhost/api/auth/reset-password', {
    method: HTTP_METHOD.POST,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.passwordResetToken.findUnique.mockResolvedValue(VALID_TOKEN_ROW)
  prismaMock.user.findFirst.mockResolvedValue(ADMIN)
  prismaMock.user.update.mockResolvedValue(ADMIN)
  prismaMock.adminLoginChallenge.create.mockResolvedValue({ id: 'ch-1' })
})

describe('POST /api/auth/reset-password — sign-in right after the reset', () => {
  it('returns the account email and a challenge token for the admin-2fa sign-in', async () => {
    const res = await POST(makeReq(BODY))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.email).toBe(ADMIN.email)
    expect(body.challengeToken).toMatch(/^[0-9a-f]{64}$/)
  })

  it('stores only the hash of the returned challenge token, for the account email, with the admin challenge TTL', async () => {
    const before = Date.now()
    const res = await POST(makeReq(BODY))
    const { challengeToken } = await res.json()

    expect(prismaMock.adminLoginChallenge.create).toHaveBeenCalledTimes(1)
    const { data } = prismaMock.adminLoginChallenge.create.mock.calls[0][0]
    expect(data.email).toBe(ADMIN.email)
    expect(data.tokenHash).toBe(hashChallengeToken(challengeToken))
    expect(data.expiresAt.getTime()).toBeGreaterThanOrEqual(before + ADMIN_CHALLENGE_TTL_MS)
    expect(data.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + ADMIN_CHALLENGE_TTL_MS)
  })

  it('creates the challenge only after the password has been changed', async () => {
    await POST(makeReq(BODY))
    const updateOrder = prismaMock.user.update.mock.invocationCallOrder[0]
    const createOrder = prismaMock.adminLoginChallenge.create.mock.invocationCallOrder[0]
    expect(createOrder).toBeGreaterThan(updateOrder)
  })

  it('password changed but the challenge could not be stored: still 200, no token (page falls back to /login)', async () => {
    prismaMock.adminLoginChallenge.create.mockRejectedValue(new Error('db down'))
    const res = await POST(makeReq(BODY))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.challengeToken).toBeUndefined()
  })
})

describe('POST /api/auth/reset-password — no challenge when the reset fails', () => {
  it('used link: no challenge is created', async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({ ...VALID_TOKEN_ROW, usedAt: new Date() })
    const res = await POST(makeReq(BODY))
    expect(res.status).toBe(400)
    expect(prismaMock.adminLoginChallenge.create).not.toHaveBeenCalled()
  })

  it('expired link: no challenge is created', async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({ ...VALID_TOKEN_ROW, expiresAt: new Date(Date.now() - 1) })
    await POST(makeReq(BODY))
    expect(prismaMock.adminLoginChallenge.create).not.toHaveBeenCalled()
  })

  it('deleted account: no challenge is created', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    await POST(makeReq(BODY))
    expect(prismaMock.adminLoginChallenge.create).not.toHaveBeenCalled()
  })

  it('password update failed: 500 and no challenge is created', async () => {
    prismaMock.user.update.mockRejectedValue(new Error('db down'))
    const res = await POST(makeReq(BODY))
    expect(res.status).toBe(500)
    expect(prismaMock.adminLoginChallenge.create).not.toHaveBeenCalled()
  })
})
