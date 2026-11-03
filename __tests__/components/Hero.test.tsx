import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero/Hero'

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
    expect(h1.textContent).toMatch(/Помогаем природе через образование/)
  })

  it('h1 has text-display class', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveClass('text-display')
  })

  it('renders the full desktop heading text «людей»', () => {
    render(<Hero />)
    // The full-length heading must exist in the DOM (may be hidden on mobile via CSS)
    expect(screen.getByText(/Помогаем природе через образование людей/)).toBeInTheDocument()
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

describe('Hero — media placeholder', () => {
  it('renders a media placeholder element', () => {
    const { container } = render(<Hero />)
    // placeholder is a div with a data-testid (no <img> until a real photo is added)
    expect(container.querySelector('[data-testid="hero-media"]')).toBeInTheDocument()
  })

  it('placeholder does not contain an <img> before a photo is provided', () => {
    const { container } = render(<Hero />)
    const media = container.querySelector('[data-testid="hero-media"]')
    expect(media?.querySelector('img')).toBeNull()
  })
})
