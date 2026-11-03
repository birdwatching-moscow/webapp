import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero/Hero'

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} />
  ),
}))

vi.mock('@/lib/footer-birds', () => ({
  getRandomBirdSrc: vi.fn(() => ({ src: '/footer-birds/kingfisher.jpg', name: 'Kingfisher' })),
}))

describe('Hero — structure', () => {
  it('renders a <section> element', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})

describe('Hero — heading', () => {
  it('renders an <h1> with the heading text', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
    expect(h1).toHaveTextContent('Помогаем природе через образование людей')
  })

  it('h1 has text-display class', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveClass('text-display')
  })
})

describe('Hero — subheading', () => {
  it('renders the subheading paragraph', () => {
    render(<Hero />)
    expect(
      screen.getByText(/Знакомим людей с птицами/)
    ).toBeInTheDocument()
  })

  it('subheading has text-body-l class', () => {
    render(<Hero />)
    const sub = screen.getByText(/Знакомим людей с птицами/)
    expect(sub).toHaveClass('text-body-l')
  })
})

describe('Hero — CTA button', () => {
  it('renders «Выбрать прогулку» link', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: 'Выбрать прогулку' })).toBeInTheDocument()
  })

  it('CTA link points to /walks', () => {
    render(<Hero />)
    const link = screen.getByRole('link', { name: 'Выбрать прогулку' })
    expect(link).toHaveAttribute('href', '/walks')
  })
})

describe('Hero — media', () => {
  it('renders the hero-media container', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('[data-testid="hero-media"]')).toBeInTheDocument()
  })

  it('renders bird image with src from getRandomBirdSrc', () => {
    render(<Hero />)
    const img = screen.getByAltText('Kingfisher')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/footer-birds/kingfisher.jpg')
  })

  it('renders no <img> when getRandomBirdSrc returns null', async () => {
    const { getRandomBirdSrc } = await import('@/lib/footer-birds')
    vi.mocked(getRandomBirdSrc).mockReturnValueOnce(null)
    const { container } = render(<Hero />)
    expect(container.querySelector('[data-testid="hero-media"] img')).toBeNull()
  })
})
