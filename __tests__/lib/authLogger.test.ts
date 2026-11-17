import { describe, it, expect } from 'vitest'
import { CredentialsSignin } from 'next-auth'
import { createLogger, type LogRecord } from '@/lib/logger'
import { createAuthLogger } from '@/lib/auth/authLogger'

function setup() {
  const records: LogRecord[] = []
  const log = createLogger('auth', { level: 'debug', format: 'json', sink: r => records.push(r) })
  return { records, authLogger: createAuthLogger(log) }
}

describe('createAuthLogger — rejected sign-in (CredentialsSignin)', () => {
  it('logs a wrong code as a single debug line without a stack', () => {
    const { records, authLogger } = setup()
    authLogger.error(new CredentialsSignin())
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({ level: 'debug', msg: 'sign-in rejected' })
    expect(records[0].err).toBeUndefined()
  })

  it('keeps the rejection code (e.g. account_blocked)', () => {
    const { records, authLogger } = setup()
    const error = new CredentialsSignin()
    error.code = 'account_blocked'
    authLogger.error(error)
    expect(records[0]).toMatchObject({ level: 'debug', code: 'account_blocked' })
  })
})

describe('createAuthLogger — other auth errors', () => {
  it('logs unexpected errors at error level with the error attached', () => {
    const { records, authLogger } = setup()
    authLogger.error(new Error('database is down'))
    expect(records[0]).toMatchObject({ level: 'error', err: { message: 'database is down' } })
  })

  it('unwraps cause.err that Auth.js attaches to its errors', () => {
    const { records, authLogger } = setup()
    const inner = new Error('prisma timeout')
    const outer = new Error('Read more at https://errors.authjs.dev#callbackrouteerror', {
      cause: { err: inner, provider: 'login-code' },
    })
    authLogger.error(outer)
    expect(records[0]).toMatchObject({
      level: 'error',
      err: { message: 'prisma timeout' },
      details: { provider: 'login-code' },
    })
  })
})

describe('createAuthLogger — warn and debug', () => {
  it('logs Auth.js warnings with their code', () => {
    const { records, authLogger } = setup()
    authLogger.warn('debug-enabled')
    expect(records[0]).toMatchObject({ level: 'warn', code: 'debug-enabled' })
  })

  it('passes Auth.js debug messages through at debug level', () => {
    const { records, authLogger } = setup()
    authLogger.debug('session', { userId: 'u1' })
    expect(records[0]).toMatchObject({ level: 'debug', msg: 'session', metadata: { userId: 'u1' } })
  })

  it('drops Auth.js debug messages when debug is disabled (they fire on every request)', () => {
    const records: LogRecord[] = []
    const log = createLogger('auth', { level: 'debug', format: 'json', sink: r => records.push(r) })
    createAuthLogger(log, { debug: false }).debug('request', { url: '/api/auth/session' })
    expect(records).toHaveLength(0)
  })

  it('still logs rejected sign-ins when Auth.js debug is disabled', () => {
    const records: LogRecord[] = []
    const log = createLogger('auth', { level: 'debug', format: 'json', sink: r => records.push(r) })
    createAuthLogger(log, { debug: false }).error(new CredentialsSignin())
    expect(records[0]).toMatchObject({ level: 'debug', msg: 'sign-in rejected' })
  })
})
