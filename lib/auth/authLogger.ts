import { createLogger, type Logger } from '@/lib/logger'

/** Auth.js errors carry a `type` (e.g. "CredentialsSignin") and sometimes `cause.err`. */
type AuthJsError = Error & { type?: string; code?: string }

const REJECTED_SIGN_IN = 'CredentialsSignin'

type AuthLoggerOptions = {
  /** Forward Auth.js internal debug messages. They fire on every auth request. */
  debug?: boolean
}

const unwrapCause = (error: Error): { err: Error; details: Record<string, unknown> } | null => {
  const { cause } = error
  if (!cause || typeof cause !== 'object' || !('err' in cause) || !(cause.err instanceof Error)) return null
  const { err, ...details } = cause as { err: Error } & Record<string, unknown>
  return { err, details }
}

/**
 * Adapter for the Auth.js `logger` option.
 *
 * - A rejected sign-in (wrong / expired / used code, blocked account) is an
 *   expected outcome, not a failure: one debug line with its code, no stack.
 * - Every other Auth.js error is logged at error level with the real cause.
 */
export const createAuthLogger = (log: Logger, { debug = true }: AuthLoggerOptions = {}) => ({
  error(error: Error) {
    const { type, code } = error as AuthJsError
    const name = type ?? error.name

    if (name === REJECTED_SIGN_IN) {
      log.debug('sign-in rejected', code ? { code } : undefined)
      return
    }

    const unwrapped = unwrapCause(error)
    if (unwrapped) {
      log.error(name, { err: unwrapped.err, details: unwrapped.details })
      return
    }
    log.error(name, { err: error })
  },

  warn(code: string) {
    log.warn('auth warning', { code, docs: 'https://warnings.authjs.dev' })
  },

  debug(message: string, metadata?: unknown) {
    if (!debug) return
    log.debug(message, metadata === undefined ? undefined : { metadata })
  },
})

export const authLogger = createAuthLogger(createLogger('auth'), {
  debug: process.env.AUTH_DEBUG === 'true',
})
