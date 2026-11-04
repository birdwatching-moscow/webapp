import { describe, it, expect } from 'vitest'
import { formatWalkDate } from '@/utils/formatWalkDate'

// 09 Aug 2026 08:00 Moscow time (UTC+3)
const aug9_8am = new Date('2026-08-09T05:00:00.000Z')

// 05 Jul 2026 07:00 Moscow time (UTC+3)
const jul5_7am = new Date('2026-07-05T04:00:00.000Z')

describe('formatWalkDate — without duration', () => {
  it('formats date as DD.MM.YYYY · HH:MM', () => {
    expect(formatWalkDate(aug9_8am, null)).toBe('09.08.2026 · 08:00')
  })

  it('formats another date correctly', () => {
    expect(formatWalkDate(jul5_7am, null)).toBe('05.07.2026 · 07:00')
  })
})

describe('formatWalkDate — with duration end-time string', () => {
  it('appends duration end time with en-dash when duration looks like HH:MM', () => {
    expect(formatWalkDate(aug9_8am, '10:00')).toBe('09.08.2026 · 08:00–10:00')
  })

  it('appends non-HH:MM duration as suffix after space', () => {
    expect(formatWalkDate(aug9_8am, '2 ч')).toBe('09.08.2026 · 08:00 (2 ч)')
  })
})
