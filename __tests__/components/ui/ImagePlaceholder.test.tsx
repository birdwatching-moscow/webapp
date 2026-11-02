import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder/ImagePlaceholder'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} {...props} />
  ),
}))

describe('ImagePlaceholder — no src (placeholder mode)', () => {
  it('renders no <img> when src is not provided', () => {
    const { container } = render(<ImagePlaceholder ratio="16-9" alt="A bird" />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('wrapper has role="img" when no src', () => {
    render(<ImagePlaceholder ratio="16-9" alt="A bird" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('wrapper has aria-label equal to alt when no src', () => {
    render(<ImagePlaceholder ratio="16-9" alt="A bird" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'A bird')
  })
})

describe('ImagePlaceholder — with src (image mode)', () => {
  it('renders a next/image when src is provided', () => {
    render(<ImagePlaceholder ratio="16-9" src="/bird.jpg" alt="A bird" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('image has the correct alt text', () => {
    render(<ImagePlaceholder ratio="16-9" src="/bird.jpg" alt="A bird" />)
    expect(screen.getByAltText('A bird')).toBeInTheDocument()
  })

  it('image is rendered with fill prop', () => {
    render(<ImagePlaceholder ratio="16-9" src="/bird.jpg" alt="A bird" />)
    expect(screen.getByRole('img')).toHaveAttribute('data-fill', 'true')
  })
})

describe('ImagePlaceholder — aspect ratios', () => {
  const cases: Array<[string, string]> = [
    ['16-9', '16 / 9'],
    ['4-3', '4 / 3'],
    ['1-1', '1 / 1'],
    ['9-16', '9 / 16'],
  ]

  it.each(cases)('ratio="%s" sets aspect-ratio CSS to "%s"', (ratio, expected) => {
    const { container } = render(
      <ImagePlaceholder ratio={ratio as '16-9' | '4-3' | '1-1' | '9-16'} alt="test" />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.aspectRatio).toBe(expected)
  })
})

describe('ImagePlaceholder — className', () => {
  it('className is forwarded to the wrapper', () => {
    const { container } = render(<ImagePlaceholder ratio="1-1" alt="test" className="my-img" />)
    expect(container.firstChild).toHaveClass('my-img')
  })
})
