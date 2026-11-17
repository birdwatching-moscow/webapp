import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { JWT } from 'next-auth/jwt'

const { prismaMock, logErrorMock } = vi.hoisted(() => ({
  prismaMock: { user: { findUnique: vi.fn() } },
  logErrorMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ error: logErrorMock, warn: vi.fn(), info: vi.fn(), debug: vi.fn() }),
}))

import { validateAdminToken } from '@/lib/auth/sessionGuard'

const ADMIN_TOKEN: JWT = { id: 'admin-1', role: 'ADMIN', sessionVersion: 2 }
const ACTIVE_ROW = { sessionVersion: 2, blockedAt: null, deletedAt: null, role: 'ADMIN' as const }

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.user.findUnique.mockResolvedValue(ACTIVE_ROW)
})

describe('validateAdminToken — valid admin session', () => {
  it('matching version, not blocked or deleted → returns the token', async () => {
    expect(await validateAdminToken(ADMIN_TOKEN)).toEqual(ADMIN_TOKEN)
  })

  it('selects exactly sessionVersion, blockedAt, deletedAt and role by user id', async () => {
    await validateAdminToken(ADMIN_TOKEN)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: ADMIN_TOKEN.id },
      select: { sessionVersion: true, blockedAt: true, deletedAt: true, role: true },
    })
  })

  it('SUPERADMIN token is checked too', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, role: 'SUPERADMIN' })
    const token: JWT = { ...ADMIN_TOKEN, role: 'SUPERADMIN' }
    expect(await validateAdminToken(token)).toEqual(token)
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1)
  })
})

describe('validateAdminToken — revoked session → null', () => {
  it('token carries an older sessionVersion (password was reset)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, sessionVersion: 3 })
    expect(await validateAdminToken(ADMIN_TOKEN)).toBeNull()
  })

  it('account blocked, even with a matching version', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, blockedAt: new Date() })
    expect(await validateAdminToken(ADMIN_TOKEN)).toBeNull()
  })

  it('account soft-deleted, even with a matching version', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, deletedAt: new Date() })
    expect(await validateAdminToken(ADMIN_TOKEN)).toBeNull()
  })

  it('user row missing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    expect(await validateAdminToken(ADMIN_TOKEN)).toBeNull()
  })

  it('admin was demoted to USER', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, role: 'USER' })
    expect(await validateAdminToken(ADMIN_TOKEN)).toBeNull()
  })

  it('token has no id → null without querying the DB', async () => {
    const token = { role: 'ADMIN', sessionVersion: 0 } as unknown as JWT
    expect(await validateAdminToken(token)).toBeNull()
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })
})

describe('validateAdminToken — role refresh', () => {
  it('SUPERADMIN demoted to ADMIN → token role becomes ADMIN', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, role: 'ADMIN' })
    const result = await validateAdminToken({ ...ADMIN_TOKEN, role: 'SUPERADMIN' })
    expect(result).toMatchObject({ id: ADMIN_TOKEN.id, role: 'ADMIN' })
  })
})

describe('validateAdminToken — tokens issued before the migration (no claim)', () => {
  const LEGACY_TOKEN: JWT = { id: 'admin-1', role: 'ADMIN' }

  it('DB version 0 → still valid (no mass logout on deploy)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, sessionVersion: 0 })
    expect(await validateAdminToken(LEGACY_TOKEN)).toEqual(LEGACY_TOKEN)
  })

  it('DB version 1 (first reset/block happened) → null', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...ACTIVE_ROW, sessionVersion: 1 })
    expect(await validateAdminToken(LEGACY_TOKEN)).toBeNull()
  })
})

describe('validateAdminToken — USER sessions are not checked', () => {
  it('USER token → returned as is, no DB query', async () => {
    const token: JWT = { id: 'user-1', role: 'USER' }
    expect(await validateAdminToken(token)).toEqual(token)
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('USER token while the DB is down → still returned (no query at all)', async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error('db down'))
    const token: JWT = { id: 'user-1', role: 'USER' }
    expect(await validateAdminToken(token)).toEqual(token)
  })
})

describe('validateAdminToken — DB error (fail-closed)', () => {
  it('admin token → null and the error is logged', async () => {
    const err = new Error('db down')
    prismaMock.user.findUnique.mockRejectedValue(err)
    expect(await validateAdminToken(ADMIN_TOKEN)).toBeNull()
    expect(logErrorMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ err }))
  })
})
