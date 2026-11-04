import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeAbout } from '@/components/HomeAbout/HomeAbout'

describe('HomeAbout — structure', () => {
  it('renders a <section> element', () => {
    const { container } = render(<HomeAbout />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})

describe('HomeAbout — heading', () => {
  it('renders an <h2> with text «О проекте»', () => {
    render(<HomeAbout />)
    const h2 = screen.getByRole('heading', { level: 2, name: 'О проекте' })
    expect(h2).toBeInTheDocument()
  })

  it('h2 has text-h1 class', () => {
    render(<HomeAbout />)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2).toHaveClass('text-h1')
  })
})

describe('HomeAbout — body text', () => {
  it('renders the body paragraph', () => {
    render(<HomeAbout />)
    expect(screen.getByText(/Помогать природе через образование людей/)).toBeInTheDocument()
  })

  it('body paragraph has text-body-l class', () => {
    render(<HomeAbout />)
    const p = screen.getByText(/Помогать природе через образование людей/)
    expect(p).toHaveClass('text-body-l')
  })
})

describe('HomeAbout — CTA button', () => {
  it('renders «Подробнее» link', () => {
    render(<HomeAbout />)
    expect(screen.getByRole('link', { name: 'Подробнее' })).toBeInTheDocument()
  })

  it('button links to /team', () => {
    render(<HomeAbout />)
    const link = screen.getByRole('link', { name: 'Подробнее' })
    expect(link).toHaveAttribute('href', '/team')
  })
})
