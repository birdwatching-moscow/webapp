import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// next/image requires `sizes` whenever `fill` is set; these tests pin the value
// each hero/404 image passes so the warning can't come back.
vi.mock('next/image', () => ({
  default: ({ src, alt, sizes }: { src: string; alt: string; sizes?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} sizes={sizes} />
  ),
}))
vi.mock('@/lib/expeditions', () => ({ getActiveExpeditions: vi.fn().mockResolvedValue([]) }))

import { WalksPageHero } from '@/components/walks-page/WalksPageHero'
import { Expeditions } from '@/components/expeditions/Expeditions'
import NotFound from '@/app/not-found'

const HERO_SIZES = '329px'
const NOT_FOUND_SIZES = '(min-width: 1248px) 480px, 100vw'

describe('fill images declare sizes', () => {
  it('walks page hero image is at most 329px wide', () => {
    const { container } = render(<WalksPageHero />)
    expect(container.querySelector('img')).toHaveAttribute('sizes', HERO_SIZES)
  })

  it('expeditions page hero image is at most 329px wide', async () => {
    const { container } = render(await Expeditions())
    expect(container.querySelector('img')).toHaveAttribute('sizes', HERO_SIZES)
  })

  it('404 images are full width on mobile and 480px on desktop', () => {
    const { container } = render(<NotFound />)
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(2)
    images.forEach(img => expect(img).toHaveAttribute('sizes', NOT_FOUND_SIZES))
  })
})
