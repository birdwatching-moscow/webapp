import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HighlightCard } from '@/components/cards/HighlightCard'

const base = {
  title: 'Бинокль',
  description: 'Дадим на прогулке, свой брать не обязательно.',
}

describe('HighlightCard — content', () => {
  it('renders title', () => {
    render(<HighlightCard {...base} />)
    expect(screen.getByText(base.title)).toBeInTheDocument()
  })

  it('title has text-h2 class', () => {
    render(<HighlightCard {...base} />)
    expect(screen.getByText(base.title).className).toMatch(/text-h2/)
  })

  it('renders description', () => {
    render(<HighlightCard {...base} />)
    expect(screen.getByText(base.description)).toBeInTheDocument()
  })
})

describe('HighlightCard — structure', () => {
  it('className prop is forwarded to the root element', () => {
    const { container } = render(<HighlightCard {...base} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })

  it('renders no interactive elements', () => {
    const { container } = render(<HighlightCard {...base} />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })

  it('renders no image', () => {
    const { container } = render(<HighlightCard {...base} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('[role="img"]')).toBeNull()
  })
})
