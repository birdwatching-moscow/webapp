import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'

vi.mock('next/image', () => ({
  default: ({ src, alt, sizes }: { src: string; alt: string; sizes?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} sizes={sizes} />
  ),
}))

describe('PhotoCard — responsive sizes (required with fill)', () => {
  it('defaults sizes to 100vw', () => {
    render(<PhotoCard src="/test.jpg" alt="Test photo" />)
    expect(screen.getByRole('img', { name: 'Test photo' })).toHaveAttribute('sizes', '100vw')
  })

  it('passes a custom sizes value through', () => {
    render(<PhotoCard src="/test.jpg" alt="Test photo" sizes="(min-width: 1248px) 33vw, 100vw" />)
    expect(screen.getByRole('img', { name: 'Test photo' })).toHaveAttribute('sizes', '(min-width: 1248px) 33vw, 100vw')
  })
})

describe('PhotoCard — structure', () => {
  it('renders an img with the given alt', () => {
    render(<PhotoCard src="/test.jpg" alt="Test photo" />)
    expect(screen.getByRole('img', { name: 'Test photo' })).toBeInTheDocument()
  })

  it('renders the info icon', () => {
    const { container } = render(<PhotoCard src="/test.jpg" alt="Test photo" />)
    expect(container.querySelector('[data-testid="photo-info-icon"]')).toBeInTheDocument()
  })

  it('renders the caption overlay element', () => {
    const { container } = render(<PhotoCard src="/test.jpg" alt="Test photo" />)
    expect(container.querySelector('[data-testid="photo-caption"]')).toBeInTheDocument()
  })
})

describe('PhotoCard — caption', () => {
  it('shows the provided caption text', () => {
    render(<PhotoCard src="/test.jpg" alt="Test photo" caption="Custom caption" />)
    expect(screen.getByTestId('photo-caption')).toHaveTextContent('Custom caption')
  })

  it('falls back to Lorem Ipsum when caption is omitted', () => {
    render(<PhotoCard src="/test.jpg" alt="Test photo" />)
    expect(screen.getByTestId('photo-caption')).toHaveTextContent('Lorem ipsum')
  })

  it('does not crash when caption is omitted', () => {
    expect(() => render(<PhotoCard src="/test.jpg" alt="Test photo" />)).not.toThrow()
  })
})

describe('PhotoCard — icon position', () => {
  it('info icon is inside the card container', () => {
    const { container } = render(<PhotoCard src="/test.jpg" alt="Test photo" />)
    const card = container.firstChild as HTMLElement
    expect(card.querySelector('[data-testid="photo-info-icon"]')).not.toBeNull()
  })
})
