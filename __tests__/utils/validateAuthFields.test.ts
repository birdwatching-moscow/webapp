import { describe, it, expect } from 'vitest'
import { validateEmail, validateName, validateNewPasswordPair, latinOnlyError } from '@/utils/validateAuthFields'
import { AUTH_LABELS } from '@/lib/auth-labels'

const EMAIL_REQUIRED = 'Введите почту, чтобы продолжить'
const EMAIL_INVALID = 'Введите почту в формате name@example.ru'
const NAME_REQUIRED = 'Введите имя, чтобы продолжить'

describe('validateEmail', () => {
  it('returns null for a valid email', () => {
    expect(validateEmail('ivan@test.com')).toBeNull()
  })

  it('ignores surrounding whitespace', () => {
    expect(validateEmail('  ivan@test.com  ')).toBeNull()
  })

  it('returns the required message for an empty string', () => {
    expect(validateEmail('')).toBe(EMAIL_REQUIRED)
  })

  it('returns the required message for whitespace only', () => {
    expect(validateEmail('   ')).toBe(EMAIL_REQUIRED)
  })

  it('returns the format message when @ is missing', () => {
    expect(validateEmail('ivan.test.com')).toBe(EMAIL_INVALID)
  })

  it('returns the format message when the domain has no dot', () => {
    expect(validateEmail('ivan@test')).toBe(EMAIL_INVALID)
  })

  it('returns the format message when the email contains a space', () => {
    expect(validateEmail('iv an@test.com')).toBe(EMAIL_INVALID)
  })
})

describe('validateName', () => {
  it('returns null for a non-empty name', () => {
    expect(validateName('Иван')).toBeNull()
  })

  it('returns the required message for an empty string', () => {
    expect(validateName('')).toBe(NAME_REQUIRED)
  })

  it('returns the required message for whitespace only', () => {
    expect(validateName('   ')).toBe(NAME_REQUIRED)
  })
})

describe('validateNewPasswordPair — same rules as the first admin password', () => {
  const ASP = AUTH_LABELS.adminSetPassword
  const VALID = 'abcdefgh-1234567' // 16 printable latin chars

  it('valid and matching → no errors', () => {
    expect(validateNewPasswordPair(VALID, VALID)).toEqual({ passwordError: '', confirmError: '' })
  })

  it('non-latin new password → latin-only error on the password field', () => {
    expect(validateNewPasswordPair('пароль-кириллицей', 'x')).toEqual({ passwordError: ASP.latinOnly, confirmError: '' })
  })

  it('a space counts as not allowed', () => {
    expect(validateNewPasswordPair('abcdefgh 1234567', 'abcdefgh 1234567').passwordError).toBe(ASP.latinOnly)
  })

  it('non-latin confirmation → latin-only error on the confirm field', () => {
    expect(validateNewPasswordPair(VALID, 'пароль')).toEqual({ passwordError: '', confirmError: ASP.latinOnly })
  })

  it('too short → length error on the password field', () => {
    expect(validateNewPasswordPair('short-1', 'short-1')).toEqual({ passwordError: ASP.tooShort, confirmError: '' })
  })

  it('latin-only takes precedence over length', () => {
    expect(validateNewPasswordPair('пароль', 'пароль').passwordError).toBe(ASP.latinOnly)
  })

  it('different passwords → mismatch error on the confirm field', () => {
    expect(validateNewPasswordPair(VALID, `${VALID}x`)).toEqual({ passwordError: '', confirmError: ASP.mismatch })
  })
})

describe('latinOnlyError — live check while typing', () => {
  it('returns the latin-only message for non-latin input, empty string otherwise', () => {
    expect(latinOnlyError('abc')).toBe('')
    expect(latinOnlyError('абв')).toBe(AUTH_LABELS.adminSetPassword.latinOnly)
  })
})
