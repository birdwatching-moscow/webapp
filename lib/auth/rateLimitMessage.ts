import { HTTP_STATUS_TOO_MANY_REQUESTS, LOGIN_CODE_RESEND_WINDOW_MS } from '@/lib/constants'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { pluralRu } from '@/utils/pluralRu'

const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const MIN_MINUTES = 1
const DEFAULT_RETRY_SECONDS = LOGIN_CODE_RESEND_WINDOW_MS / MS_PER_SECOND
const MINUTE_FORMS: [string, string, string] = ['минуту', 'минуты', 'минут']

type RetryBody = { retryAfterSeconds?: unknown } | null | undefined
type ResponseLike = { headers?: Pick<Headers, 'get'> }

/** "через N минут" — rounded up, never less than one minute. */
const inMinutes = (seconds: number): string =>
  pluralRu(Math.max(MIN_MINUTES, Math.ceil(seconds / SECONDS_PER_MINUTE)), MINUTE_FORMS)

export const tooManyAttemptsMessage = (seconds: number): string =>
  `Слишком много попыток. Новый код можно отправить через ${inMinutes(seconds)}.`

export const codeTooFrequentMessage = (seconds: number): string =>
  `Код уже был отправлен. Запросить новый можно через ${inMinutes(seconds)}.`

const positiveNumber = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Seconds until the client may retry: the `Retry-After` header every 429 from
 * our API sets, then `retryAfterSeconds` in the body, then the resend window.
 */
export const retryAfterSeconds = (res: ResponseLike, body?: RetryBody): number =>
  positiveNumber(res.headers?.get('Retry-After')) ??
  positiveNumber(body?.retryAfterSeconds) ??
  DEFAULT_RETRY_SECONDS

/** Message for the code-resend window when the server gives no wait time. */
export const defaultTooManyAttemptsMessage = (): string => tooManyAttemptsMessage(DEFAULT_RETRY_SECONDS)

/**
 * Error text for a failed code resend. A per-email limit means a code was just
 * sent ("код уже был отправлен"); any other 429 is "too many attempts".
 */
export const resendErrorMessage = (
  res: ResponseLike & { status?: number },
  body?: { error?: string; retryAfterSeconds?: unknown } | null,
): string => {
  if (res.status !== HTTP_STATUS_TOO_MANY_REQUESTS) return AUTH_ERRORS.generic
  const seconds = retryAfterSeconds(res, body)
  return body?.error === 'code_rate_limited' ? codeTooFrequentMessage(seconds) : tooManyAttemptsMessage(seconds)
}
