import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const { prismaMock, bcryptCompareMock, validateAdminTokenMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn() },
    loginCode: { findFirst: vi.fn(), update: vi.fn() },
    adminLoginChallenge: { findFirst: vi.fn(), update: vi.fn() },
  },
  bcryptCompareMock: vi.fn(),
  validateAdminTokenMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('bcryptjs', () => ({ default: { compare: bcryptCompareMock, hash: vi.fn() } }))
vi.mock('@/lib/auth/sessionGuard', () => ({ validateAdminToken: validateAdminTokenMock }))
vi.mock('next-auth', () => ({
  default: (config: unknown) => ({ handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn(), _config: config }),
  CredentialsSignin: class extends Error {},
}))

import type { JWT } from 'next-auth/jwt'
import type { Session, User } from 'next-auth'
import { authorizeAdminTwoFactor, authorizeCredentials, authorizeLoginCode } from '@/lib/auth/authorize'
import authConfig from '@/auth.config'
import { authOptions } from '@/lib/auth'

const SESSION_VERSION = 7

const ADMIN_ROW = {
  id: 'admin-1',
  email: 'admin@test.com',
  name: 'Анна',
  role: 'ADMIN' as const,
  deletedAt: null,
  blockedAt: null,
  passwordHash: '$2b$12$somehash',
  passwordResetRequired: false,
  sessionVersion: SESSION_VERSION,
}
const USER_ROW = { ...ADMIN_ROW, id: 'user-1', email: 'user@test.com', role: 'USER' as const, passwordHash: null }

beforeEach(() => {
  vi.clearAllMocks()
  bcryptCompareMock.mockResolvedValue(true)
  prismaMock.adminLoginChallenge.findFirst.mockResolvedValue({ id: 'ch-1' })
  prismaMock.adminLoginChallenge.update.mockResolvedValue({})
  prismaMock.loginCode.findFirst.mockResolvedValue({
    id: 'code-1',
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    attempts: 0,
  })
  prismaMock.loginCode.update.mockResolvedValue({})
})

describe('sign-in returns the current sessionVersion', () => {
  it('authorizeAdminTwoFactor', async () => {
    prismaMock.user.findFirst.mockResolvedValue(ADMIN_ROW)
    const result = await authorizeAdminTwoFactor({ email: ADMIN_ROW.email, challengeToken: 'tok', password: 'pass' })
    expect(result).toMatchObject({ id: ADMIN_ROW.id, sessionVersion: SESSION_VERSION })
  })

  it('authorizeCredentials', async () => {
    prismaMock.user.findFirst.mockResolvedValue(ADMIN_ROW)
    const result = await authorizeCredentials({ email: ADMIN_ROW.email, password: 'pass' })
    expect(result).toMatchObject({ id: ADMIN_ROW.id, sessionVersion: SESSION_VERSION })
  })

  it('authorizeLoginCode', async () => {
    prismaMock.user.findFirst.mockResolvedValue(USER_ROW)
    const result = await authorizeLoginCode({ email: USER_ROW.email, code: 'ABCD2F' })
    expect(result).toMatchObject({ id: USER_ROW.id, sessionVersion: SESSION_VERSION })
  })
})

describe('auth.config callbacks', () => {
  it('jwt with a freshly signed-in user copies sessionVersion into the token', async () => {
    const user = { id: 'admin-1', role: 'ADMIN', sessionVersion: SESSION_VERSION } as User
    const token = await authConfig.callbacks.jwt({ token: {} as JWT, user } as Parameters<typeof authConfig.callbacks.jwt>[0])
    expect(token).toMatchObject({ id: 'admin-1', role: 'ADMIN', sessionVersion: SESSION_VERSION })
  })

  it('session does not expose sessionVersion to the client', async () => {
    const session = { user: {}, expires: '' } as Session
    const token: JWT = { id: 'admin-1', role: 'ADMIN', sessionVersion: SESSION_VERSION }
    const result = await authConfig.callbacks.session({ session, token } as Parameters<typeof authConfig.callbacks.session>[0])
    expect(result.user).not.toHaveProperty('sessionVersion')
  })

  it('auth.config.ts stays edge-safe: imports nothing Prisma / Node-only', () => {
    const source = readFileSync(path.join(process.cwd(), 'auth.config.ts'), 'utf-8')
    expect(source).not.toMatch(/@\/lib\/prisma|sessionGuard|bcryptjs|from ['"]crypto['"]/)
  })
})

describe('lib/auth wires the session guard into the jwt callback', () => {
  type JwtParams = Parameters<NonNullable<NonNullable<typeof authOptions.callbacks>['jwt']>>[0]
  const jwt = (params: Partial<JwtParams>) => authOptions.callbacks!.jwt!(params as JwtParams)

  it('on sign-in (user present) the guard is not called', async () => {
    const user = { id: 'admin-1', role: 'ADMIN', sessionVersion: SESSION_VERSION } as User
    const token = await jwt({ token: {} as JWT, user })
    expect(validateAdminTokenMock).not.toHaveBeenCalled()
    expect(token).toMatchObject({ id: 'admin-1', sessionVersion: SESSION_VERSION })
  })

  it('on a later request (no user) the guard checks the token and its result is returned', async () => {
    const token: JWT = { id: 'admin-1', role: 'ADMIN', sessionVersion: SESSION_VERSION }
    const checked: JWT = { ...token, role: 'SUPERADMIN' }
    validateAdminTokenMock.mockResolvedValue(checked)
    expect(await jwt({ token })).toBe(checked)
    expect(validateAdminTokenMock).toHaveBeenCalledWith(token)
  })

  it('guard says revoked → jwt returns null (signed out)', async () => {
    validateAdminTokenMock.mockResolvedValue(null)
    expect(await jwt({ token: { id: 'admin-1', role: 'ADMIN', sessionVersion: 1 } })).toBeNull()
  })
})
