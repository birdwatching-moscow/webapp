import { describe, it, expect, vi } from 'vitest'
import { createLogger, resolveLogLevel, type LogRecord } from '@/lib/logger'

function capture() {
  const records: LogRecord[] = []
  const lines: string[] = []
  return {
    records,
    lines,
    sink: (record: LogRecord, line: string) => {
      records.push(record)
      lines.push(line)
    },
  }
}

describe('createLogger — levels', () => {
  it('drops records below the configured level', () => {
    const out = capture()
    const log = createLogger('auth', { level: 'warn', format: 'json', sink: out.sink })
    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')
    expect(out.records.map(r => r.level)).toEqual(['warn', 'error'])
  })

  it('writes nothing when the level is silent', () => {
    const out = capture()
    const log = createLogger('auth', { level: 'silent', format: 'json', sink: out.sink })
    log.error('e')
    expect(out.records).toHaveLength(0)
  })
})

describe('createLogger — record shape', () => {
  it('includes time, level, scope, message and context', () => {
    const out = capture()
    const log = createLogger('checkout', { level: 'debug', format: 'json', sink: out.sink })
    log.info('order created', { orderId: 'o-1', seats: 2 })
    const record = out.records[0]
    expect(record).toMatchObject({ level: 'info', scope: 'checkout', msg: 'order created', orderId: 'o-1', seats: 2 })
    expect(new Date(record.time).toString()).not.toBe('Invalid Date')
  })

  it('json format writes one parseable line per record', () => {
    const out = capture()
    const log = createLogger('checkout', { level: 'debug', format: 'json', sink: out.sink })
    log.warn('slow', { ms: 1200 })
    expect(out.lines[0]).not.toContain('\n')
    expect(JSON.parse(out.lines[0])).toMatchObject({ level: 'warn', scope: 'checkout', msg: 'slow', ms: 1200 })
  })

  it('pretty format puts level, scope and message on one readable line', () => {
    const out = capture()
    const log = createLogger('mail', { level: 'debug', format: 'pretty', sink: out.sink })
    log.error('send failed', { to: 'x' })
    expect(out.lines[0]).toMatch(/ERROR/)
    expect(out.lines[0]).toContain('[mail]')
    expect(out.lines[0]).toContain('send failed')
  })

  it('child() nests the scope', () => {
    const out = capture()
    const log = createLogger('auth', { level: 'debug', format: 'json', sink: out.sink }).child('otp')
    log.info('x')
    expect(out.records[0].scope).toBe('auth:otp')
  })
})

describe('createLogger — errors', () => {
  it('serialises an Error passed as err with name, message and stack', () => {
    const out = capture()
    const log = createLogger('s3', { level: 'debug', format: 'json', sink: out.sink })
    log.error('upload failed', { err: new TypeError('boom') })
    expect(out.records[0].err).toMatchObject({ name: 'TypeError', message: 'boom' })
    expect((out.records[0].err as { stack?: string }).stack).toContain('boom')
    expect(JSON.parse(out.lines[0]).err.message).toBe('boom')
  })

  it('serialises a nested cause', () => {
    const out = capture()
    const log = createLogger('s3', { level: 'debug', format: 'json', sink: out.sink })
    log.error('upload failed', { err: new Error('outer', { cause: new Error('inner') }) })
    expect(out.records[0].err).toMatchObject({ message: 'outer', cause: { message: 'inner' } })
  })

  it('keeps non-Error err values as they are', () => {
    const out = capture()
    const log = createLogger('s3', { level: 'debug', format: 'json', sink: out.sink })
    log.error('upload failed', { err: 'plain string' })
    expect(out.records[0].err).toBe('plain string')
  })
})

describe('createLogger — redaction', () => {
  it('masks secret-looking keys at any depth', () => {
    const out = capture()
    const log = createLogger('auth', { level: 'debug', format: 'json', sink: out.sink })
    log.info('x', {
      password: 'p',
      csrfToken: 't',
      user: { email: 'a@b.ru', passwordHash: 'h', Authorization: 'Bearer z' },
    })
    expect(out.records[0]).toMatchObject({
      password: '[redacted]',
      csrfToken: '[redacted]',
      user: { email: 'a@b.ru', passwordHash: '[redacted]', Authorization: '[redacted]' },
    })
  })

  it('does not mutate the caller context', () => {
    const out = capture()
    const log = createLogger('auth', { level: 'debug', format: 'json', sink: out.sink })
    const context = { password: 'p' }
    log.info('x', context)
    expect(context.password).toBe('p')
  })
})

describe('createLogger — default sink', () => {
  it('routes error and warn to console.error / console.warn', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const log = createLogger('x', { level: 'debug', format: 'json' })
    log.error('e')
    log.warn('w')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })
})

describe('resolveLogLevel', () => {
  it('uses LOG_LEVEL when it is a valid level', () => {
    expect(resolveLogLevel({ LOG_LEVEL: 'error', NODE_ENV: 'development' })).toBe('error')
  })

  it('ignores an invalid LOG_LEVEL and falls back to the environment default', () => {
    expect(resolveLogLevel({ LOG_LEVEL: 'loud', NODE_ENV: 'production' })).toBe('info')
  })

  it('defaults to debug in development, info in production and silent in tests', () => {
    expect(resolveLogLevel({ NODE_ENV: 'development' })).toBe('debug')
    expect(resolveLogLevel({ NODE_ENV: 'production' })).toBe('info')
    expect(resolveLogLevel({ NODE_ENV: 'test' })).toBe('silent')
  })
})
