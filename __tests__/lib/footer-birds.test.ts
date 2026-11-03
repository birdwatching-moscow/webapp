import { describe, it, expect } from 'vitest'
import { nameFromFilename } from '@/lib/footer-birds'

describe('nameFromFilename', () => {
  it('removes extension', () => {
    expect(nameFromFilename('kingfisher.jpg')).toBe('Kingfisher')
  })

  it('replaces hyphens with spaces', () => {
    expect(nameFromFilename('great-tit.jpg')).toBe('Great tit')
  })

  it('replaces underscores with spaces', () => {
    expect(nameFromFilename('great_spotted_woodpecker.png')).toBe('Great spotted woodpecker')
  })

  it('capitalises the first letter', () => {
    expect(nameFromFilename('robin.webp')).toBe('Robin')
  })

  it('handles Cyrillic filenames', () => {
    expect(nameFromFilename('зимородок.jpg')).toBe('Зимородок')
  })

  it('handles multiple consecutive hyphens', () => {
    expect(nameFromFilename('blue--tit.jpg')).toBe('Blue tit')
  })

  it('handles all supported extensions', () => {
    expect(nameFromFilename('swift.jpeg')).toBe('Swift')
    expect(nameFromFilename('swift.png')).toBe('Swift')
    expect(nameFromFilename('swift.webp')).toBe('Swift')
    expect(nameFromFilename('swift.avif')).toBe('Swift')
  })
})
