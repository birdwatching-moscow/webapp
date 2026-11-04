import { describe, it, expect } from 'vitest'
import { formatTicketsLabel } from '@/utils/formatTicketsLabel'

describe('formatTicketsLabel — zero tickets', () => {
  it('returns "нет билетов" for 0', () => {
    expect(formatTicketsLabel(0)).toBe('нет билетов')
  })
})

describe('formatTicketsLabel — singular', () => {
  it('returns "1 билет" for 1', () => {
    expect(formatTicketsLabel(1)).toBe('1 билет')
  })

  it('returns "21 билет" for 21', () => {
    expect(formatTicketsLabel(21)).toBe('21 билет')
  })
})

describe('formatTicketsLabel — genitive singular (2–4)', () => {
  it('returns "2 билета" for 2', () => {
    expect(formatTicketsLabel(2)).toBe('2 билета')
  })

  it('returns "4 билета" for 4', () => {
    expect(formatTicketsLabel(4)).toBe('4 билета')
  })

  it('returns "22 билета" for 22', () => {
    expect(formatTicketsLabel(22)).toBe('22 билета')
  })
})

describe('formatTicketsLabel — genitive plural (5+)', () => {
  it('returns "5 билетов" for 5', () => {
    expect(formatTicketsLabel(5)).toBe('5 билетов')
  })

  it('returns "11 билетов" for 11', () => {
    expect(formatTicketsLabel(11)).toBe('11 билетов')
  })

  it('returns "12 билетов" for 12', () => {
    expect(formatTicketsLabel(12)).toBe('12 билетов')
  })

  it('returns "20 билетов" for 20', () => {
    expect(formatTicketsLabel(20)).toBe('20 билетов')
  })
})
