/**
 * App-wide structured logger. No dependencies; writes to stdout/stderr so the
 * VPS process manager (Docker / systemd) collects the output.
 *
 *   import { createLogger } from '@/lib/logger'
 *   const log = createLogger('checkout')
 *   log.info('order created', { orderId })
 *   log.error('ЮKassa create payment failed', { err, orderId })
 *
 * - Level: `LOG_LEVEL` (debug | info | warn | error | silent). Defaults:
 *   debug in development, info in production, silent in tests.
 * - Format: `LOG_FORMAT` (pretty | json). Defaults: json in production
 *   (one line per record, easy to grep / ship), pretty elsewhere.
 * - Any `Error` in the context is serialised with name, message, stack and
 *   cause. Secret-looking keys (password, token, secret, cookie, …) are masked.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogLevelSetting = LogLevel | 'silent'
export type LogFormat = 'json' | 'pretty'
export type LogContext = Record<string, unknown>

export type LogRecord = {
  time: string
  level: LogLevel
  scope: string
  msg: string
  [key: string]: unknown
}

export type LogSink = (record: LogRecord, line: string) => void

export type Logger = {
  debug: (msg: string, context?: LogContext) => void
  info: (msg: string, context?: LogContext) => void
  warn: (msg: string, context?: LogContext) => void
  error: (msg: string, context?: LogContext) => void
  /** Logger with a nested scope, e.g. `auth` → `auth:otp`. */
  child: (scope: string) => Logger
}

export type LoggerOptions = {
  level?: LogLevelSetting
  format?: LogFormat
  sink?: LogSink
}

type LogEnv = { LOG_LEVEL?: string; LOG_FORMAT?: string; NODE_ENV?: string }

const LEVEL_WEIGHT: Record<LogLevelSetting, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: Number.POSITIVE_INFINITY,
}

const REDACTED = '[redacted]'
const CIRCULAR = '[circular]'
const MAX_DEPTH = 8
const SENSITIVE_KEY = /pass(word)?|token|secret|authorization|cookie|api[-_]?key/i

const isLogLevelSetting = (value: string | undefined): value is LogLevelSetting =>
  value !== undefined && value in LEVEL_WEIGHT

export const resolveLogLevel = (env: LogEnv = process.env): LogLevelSetting => {
  if (isLogLevelSetting(env.LOG_LEVEL)) return env.LOG_LEVEL
  if (env.NODE_ENV === 'test') return 'silent'
  if (env.NODE_ENV === 'production') return 'info'
  return 'debug'
}

export const resolveLogFormat = (env: LogEnv = process.env): LogFormat => {
  if (env.LOG_FORMAT === 'json' || env.LOG_FORMAT === 'pretty') return env.LOG_FORMAT
  return env.NODE_ENV === 'production' ? 'json' : 'pretty'
}

const serializeError = (error: Error, seen: WeakSet<object>, depth: number): LogContext => {
  const serialized: LogContext = { name: error.name, message: error.message }
  if (error.stack) serialized.stack = error.stack
  const { code } = error as Error & { code?: unknown }
  if (code !== undefined) serialized.code = code
  if (error.cause !== undefined) serialized.cause = sanitize(error.cause, seen, depth + 1)
  return serialized
}

/** Deep copy with Errors serialised, secrets masked and cycles cut. */
function sanitize(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return CIRCULAR
  if (depth > MAX_DEPTH) return '[max depth]'
  seen.add(value)

  if (value instanceof Error) return serializeError(value, seen, depth)
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(item => sanitize(item, seen, depth + 1))

  const result: LogContext = {}
  for (const [key, item] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY.test(key) ? REDACTED : sanitize(item, seen, depth + 1)
  }
  return result
}

const ANSI = { reset: '\x1b[0m', grey: '\x1b[90m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m' }
const LEVEL_COLOR: Record<LogLevel, string> = { debug: ANSI.grey, info: ANSI.cyan, warn: ANSI.yellow, error: ANSI.red }

const shouldColorize = (): boolean =>
  typeof process !== 'undefined' && Boolean(process.stdout?.isTTY) && !process.env.NO_COLOR

const formatPretty = (record: LogRecord): string => {
  const { time, level, scope, msg, err, ...rest } = record
  const color = shouldColorize()
  const paint = (code: string, text: string) => (color ? `${code}${text}${ANSI.reset}` : text)

  const clock = time.slice(11, 23) // HH:MM:SS.mmm
  const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : ''
  const head = `${paint(ANSI.grey, clock)} ${paint(LEVEL_COLOR[level], level.toUpperCase().padEnd(5))} [${scope}] ${msg}${extra}`

  if (err === undefined) return head
  const stack = typeof err === 'object' && err !== null && 'stack' in err ? String(err.stack) : JSON.stringify(err)
  return `${head}\n${paint(ANSI.grey, stack)}`
}

const defaultSink: LogSink = (record, line) => {
  if (record.level === 'error') console.error(line)
  else if (record.level === 'warn') console.warn(line)
  else if (record.level === 'info') console.info(line)
  else console.debug(line)
}

export const createLogger = (scope: string, options: LoggerOptions = {}): Logger => {
  const level = options.level ?? resolveLogLevel()
  const format = options.format ?? resolveLogFormat()
  const sink = options.sink ?? defaultSink

  const write = (recordLevel: LogLevel, msg: string, context?: LogContext) => {
    if (LEVEL_WEIGHT[recordLevel] < LEVEL_WEIGHT[level]) return
    const safeContext = context ? (sanitize(context, new WeakSet(), 0) as LogContext) : {}
    const record: LogRecord = {
      ...safeContext,
      time: new Date().toISOString(),
      level: recordLevel,
      scope,
      msg,
    }
    sink(record, format === 'json' ? JSON.stringify(record) : formatPretty(record))
  }

  return {
    debug: (msg, context) => write('debug', msg, context),
    info: (msg, context) => write('info', msg, context),
    warn: (msg, context) => write('warn', msg, context),
    error: (msg, context) => write('error', msg, context),
    child: childScope => createLogger(`${scope}:${childScope}`, { level, format, sink }),
  }
}
