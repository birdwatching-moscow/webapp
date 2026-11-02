import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/ui/logo/Logo'

describe('Logo', () => {
  it('renders an <svg> element', () => {
    const { container } = render(<Logo />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('svg has role="img"', () => {
    render(<Logo />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('svg has aria-label="Birdwatching Moscow"', () => {
    render(<Logo />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Birdwatching Moscow')
  })

  it('className prop is forwarded to the svg element', () => {
    const { container } = render(<Logo className="logo-sm" />)
    expect(container.querySelector('svg')).toHaveClass('logo-sm')
  })

  it('renders without props', () => {
    expect(() => render(<Logo />)).not.toThrow()
  })
})
