import { describe, it, expect } from 'vitest'
import { formatKopecksRu } from '@/utils/formatMoney'

// Normalize Unicode whitespace (narrow no-break space  , non-breaking space  )
// to regular space so assertions are portable across Node.js ICU versions.
const n = (s: string) => s.replace(/[  ]/g, ' ')

describe('formatKopecksRu — basic conversion', () => {
  it('converts 75000 kopecks to "750,00 ₽"', () => {
    expect(n(formatKopecksRu(75000))).toBe('750,00 ₽')
  })

  it('converts 150000 kopecks to "1 500,00 ₽"', () => {
    expect(n(formatKopecksRu(150000))).toBe('1 500,00 ₽')
  })

  it('converts 0 kopecks to "0,00 ₽"', () => {
    expect(n(formatKopecksRu(0))).toBe('0,00 ₽')
  })

  it('converts 99990000 kopecks (999 900 ₽) without float drift', () => {
    expect(n(formatKopecksRu(99990000))).toBe('999 900,00 ₽')
  })

  it('handles kopecks with non-zero remainder: 10050 → "100,50 ₽"', () => {
    expect(n(formatKopecksRu(10050))).toBe('100,50 ₽')
  })
})

describe('formatKopecksRu — edge cases', () => {
  it('does not throw for negative kopecks', () => {
    expect(() => formatKopecksRu(-100)).not.toThrow()
  })

  it('uses integer arithmetic — result for 100 kopecks has exactly two decimal places', () => {
    const result = n(formatKopecksRu(100))
    expect(result).toBe('1,00 ₽')
  })
})
