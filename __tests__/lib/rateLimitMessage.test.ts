import { describe, it, expect } from 'vitest'
import {
  retryAfterSeconds,
  tooManyAttemptsMessage,
  codeTooFrequentMessage,
} from '@/lib/auth/rateLimitMessage'
import { mapOtpVerifyError } from '@/lib/auth/mapOtpVerifyError'
import { LOGIN_CODE_RESEND_WINDOW_MS } from '@/lib/constants'

const MS_PER_SECOND = 1000
const DEFAULT_SECONDS = LOGIN_CODE_RESEND_WINDOW_MS / MS_PER_SECOND

const response = (headers: Record<string, string> = {}) => ({ headers: new Headers(headers) })

describe('tooManyAttemptsMessage', () => {
  it.each([
    [30, '1 минуту'],
    [60, '1 минуту'],
    [61, '2 минуты'],
    [180, '3 минуты'],
    [300, '5 минут'],
    [21 * 60, '21 минуту'],
  ])('%i seconds → "через %s"', (seconds, minutes) => {
    expect(tooManyAttemptsMessage(seconds)).toBe(
      `Слишком много попыток. Новый код можно отправить через ${minutes}.`
    )
  })

  it('never says "0 минут" for zero or negative values', () => {
    expect(tooManyAttemptsMessage(0)).toContain('через 1 минуту')
    expect(tooManyAttemptsMessage(-5)).toContain('через 1 минуту')
  })
})

describe('codeTooFrequentMessage', () => {
  it('uses the same minute rounding', () => {
    expect(codeTooFrequentMessage(150)).toBe('Код уже был отправлен. Запросить новый можно через 3 минуты.')
  })
})

describe('retryAfterSeconds', () => {
  it('reads the Retry-After header', () => {
    expect(retryAfterSeconds(response({ 'Retry-After': '120' }))).toBe(120)
  })

  it('falls back to retryAfterSeconds in the body', () => {
    expect(retryAfterSeconds(response(), { retryAfterSeconds: 45 })).toBe(45)
  })

  it('prefers the header over the body', () => {
    expect(retryAfterSeconds(response({ 'Retry-After': '90' }), { retryAfterSeconds: 10 })).toBe(90)
  })

  it('falls back to the resend window constant when neither is usable', () => {
    expect(retryAfterSeconds(response({ 'Retry-After': 'soon' }))).toBe(DEFAULT_SECONDS)
    expect(retryAfterSeconds({})).toBe(DEFAULT_SECONDS)
  })
})

describe('mapOtpVerifyError — too_many_attempts', () => {
  it('uses the resend window from code, not a hard-coded minute', () => {
    expect(mapOtpVerifyError('too_many_attempts')).toBe(tooManyAttemptsMessage(DEFAULT_SECONDS))
  })
})
