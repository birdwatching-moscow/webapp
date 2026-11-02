import { describe, it, expect } from 'vitest'
import { pluralRu } from '@/utils/pluralRu'

const forms: [string, string, string] = ['билет', 'билета', 'билетов']

describe('pluralRu — singular (n % 10 === 1, n % 100 !== 11)', () => {
  it('1 → "1 билет"', () => expect(pluralRu(1, forms)).toBe('1 билет'))
  it('21 → "21 билет"', () => expect(pluralRu(21, forms)).toBe('21 билет'))
  it('101 → "101 билет"', () => expect(pluralRu(101, forms)).toBe('101 билет'))
})

describe('pluralRu — few (n % 10 in [2,3,4], n % 100 not in [12,13,14])', () => {
  it('2 → "2 билета"', () => expect(pluralRu(2, forms)).toBe('2 билета'))
  it('3 → "3 билета"', () => expect(pluralRu(3, forms)).toBe('3 билета'))
  it('4 → "4 билета"', () => expect(pluralRu(4, forms)).toBe('4 билета'))
  it('22 → "22 билета"', () => expect(pluralRu(22, forms)).toBe('22 билета'))
  it('104 → "104 билета"', () => expect(pluralRu(104, forms)).toBe('104 билета'))
})

describe('pluralRu — many (teens 11-20 and all others)', () => {
  it('5 → "5 билетов"', () => expect(pluralRu(5, forms)).toBe('5 билетов'))
  it('11 → "11 билетов" (teen — always many)', () => expect(pluralRu(11, forms)).toBe('11 билетов'))
  it('12 → "12 билетов" (teen)', () => expect(pluralRu(12, forms)).toBe('12 билетов'))
  it('13 → "13 билетов" (teen)', () => expect(pluralRu(13, forms)).toBe('13 билетов'))
  it('14 → "14 билетов" (teen)', () => expect(pluralRu(14, forms)).toBe('14 билетов'))
  it('20 → "20 билетов"', () => expect(pluralRu(20, forms)).toBe('20 билетов'))
  it('111 → "111 билетов" (teen hundreds)', () => expect(pluralRu(111, forms)).toBe('111 билетов'))
  it('25 → "25 билетов"', () => expect(pluralRu(25, forms)).toBe('25 билетов'))
})
