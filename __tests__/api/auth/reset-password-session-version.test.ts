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
import { HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'

const VALID_TOKEN_ROW = {
  id: 'tok-1',
  userId: 'admin-1',
  tokenHash: 'a'.repeat(64),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  usedAt: null,
}
const ADMIN = { id: 'admin-1', email: 'admin@test.com' }

function makeReq() {
  return new Request('http://localhost/api/auth/reset-password', {
    method: HTTP_METHOD.POST,
    headers: JSON_HEADERS,
    body: JSON.stringify({ token: 'rawtoken123', newPassword: '1234567890123456' }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.passwordResetToken.findUnique.mockResolvedValue(VALID_TOKEN_ROW)
  prismaMock.user.findFirst.mockResolvedValue(ADMIN)
  prismaMock.user.update.mockResolvedValue(ADMIN)
  prismaMock.adminLoginChallenge.create.mockResolvedValue({ id: 'ch-1' })
})

describe('POST /api/auth/reset-password — revokes other sessions', () => {
  it('bumps sessionVersion atomically in the same update as the new password', async () => {
    await POST(makeReq())
    expect(prismaMock.user.update).toHaveBeenCalledTimes(1)
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ADMIN.id },
        data: expect.objectContaining({
          passwordHash: '$2b$12$newhash',
          sessionVersion: { increment: 1 },
        }),
      })
    )
  })

  it('used link → 400 and the version is not bumped', async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({ ...VALID_TOKEN_ROW, usedAt: new Date() })
    const res = await POST(makeReq())
    expect(res.status).toBe(400)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
