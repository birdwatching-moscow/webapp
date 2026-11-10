import { describe, it, expect } from 'vitest'
import { formatDurationRange } from '@/utils/formatDurationRange'

function make(startH: number, endH: number): [Date, Date] {
  const base = new Date('2026-05-01T00:00:00Z')
  return [
    new Date(base.getTime() + startH * 3600_000),
    new Date(base.getTime() + endH * 3600_000),
  ]
}

describe('formatDurationRange', () => {
  it('7:00→9:00 (2h) → "1.5–2 часа"', () => {
    const [s, e] = make(7, 9)
    expect(formatDurationRange(s, e)).toBe('1.5–2 часа')
  })

  it('11:00→13:30 (2.5h) → "2–2.5 часа"', () => {
    const [s, e] = make(11, 13.5)
    expect(formatDurationRange(s, e)).toBe('2–2.5 часа')
  })

  it('7:00→8:00 (1h) → "0.5–1 час"', () => {
    const [s, e] = make(7, 8)
    expect(formatDurationRange(s, e)).toBe('0.5–1 час')
  })

  it('9:00→14:00 (5h) → "4.5–5 часов"', () => {
    const [s, e] = make(9, 14)
    expect(formatDurationRange(s, e)).toBe('4.5–5 часов')
  })

  it('rounds up non-exact duration: 1h50m (1.833h) → upper=2 → "1.5–2 часа"', () => {
    const s = new Date('2026-05-01T07:00:00Z')
    const e = new Date('2026-05-01T08:50:00Z')
    expect(formatDurationRange(s, e)).toBe('1.5–2 часа')
  })
})
