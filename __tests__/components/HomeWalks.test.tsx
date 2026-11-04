import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeWalks } from '@/components/HomeWalks/HomeWalks'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('HomeWalks — structure', () => {
  it('renders a <section> with data-testid="home-walks"', () => {
    render(<HomeWalks />)
    expect(screen.getByTestId('home-walks')).toBeInTheDocument()
    expect(screen.getByTestId('home-walks').tagName).toBe('SECTION')
  })
})

describe('HomeWalks — heading', () => {
  it('renders an <h2> with text «Прогулки по Москве»', () => {
    render(<HomeWalks />)
    expect(screen.getByRole('heading', { level: 2, name: 'Прогулки по Москве' })).toBeInTheDocument()
  })

  it('h2 has text-h1 class', () => {
    render(<HomeWalks />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-h1')
  })
})

describe('HomeWalks — body text', () => {
  it('renders the body paragraph', () => {
    render(<HomeWalks />)
    expect(screen.getByText(/Прогулки в Москве проходят каждые выходные/)).toBeInTheDocument()
  })

  it('body paragraph has text-body-l class', () => {
    render(<HomeWalks />)
    const p = screen.getByText(/Прогулки в Москве проходят каждые выходные/)
    expect(p).toHaveClass('text-body-l')
  })
})

describe('HomeWalks — photo', () => {
  it('renders a PhotoCard with an img', () => {
    render(<HomeWalks />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('PhotoCard info icon is present', () => {
    const { container } = render(<HomeWalks />)
    expect(container.querySelector('[data-testid="photo-info-icon"]')).toBeInTheDocument()
  })
})
