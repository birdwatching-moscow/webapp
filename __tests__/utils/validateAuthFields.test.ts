import { describe, it, expect } from 'vitest'
import { validateEmail, validateName } from '@/utils/validateAuthFields'

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
