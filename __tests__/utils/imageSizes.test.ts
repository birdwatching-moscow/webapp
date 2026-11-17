import { describe, it, expect } from 'vitest'
import { IMAGE_SIZES } from '@/utils/imageSizes'

// next/image only checks `sizes` in dev when it is exactly "100vw"; these
// presets must describe real widths so the browser picks the right file.
describe('IMAGE_SIZES', () => {
  it('pageWidth subtracts the page gutters (16px mobile, 96px from 1248px)', () => {
    expect(IMAGE_SIZES.pageWidth).toBe('(min-width: 1248px) calc(100vw - 192px), calc(100vw - 32px)')
  })

  it('cardThird is a third of the gutter width minus two 24px gaps on desktop', () => {
    expect(IMAGE_SIZES.cardThird).toBe('(min-width: 1248px) calc((100vw - 240px) / 3), calc(100vw - 32px)')
  })

  it('no preset is a bare 100vw', () => {
    Object.values(IMAGE_SIZES).forEach(value => expect(value).not.toBe('100vw'))
  })
})
