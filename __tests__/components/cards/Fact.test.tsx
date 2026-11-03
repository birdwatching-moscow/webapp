import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Fact } from '@/components/cards/Fact'

describe('Fact — content', () => {
  it('renders value', () => {
    render(<Fact value="24" label="Сентября" />)
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('value has text-h1 class', () => {
    render(<Fact value="24" label="Сентября" />)
    expect(screen.getByText('24').className).toMatch(/text-h1/)
  })

  it('renders label', () => {
    render(<Fact value="24" label="Сентября" />)
    expect(screen.getByText('Сентября')).toBeInTheDocument()
  })

  it('label has text-body-l class', () => {
    render(<Fact value="24" label="Сентября" />)
    expect(screen.getByText('Сентября').className).toMatch(/text-body-l/)
  })
})

describe('Fact — structure', () => {
  it('className prop is forwarded to the root element', () => {
    const { container } = render(<Fact value="100+" label="видов птиц" className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })

  it('renders no interactive elements', () => {
    const { container } = render(<Fact value="24" label="Сентября" />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })

  it('renders no image', () => {
    const { container } = render(<Fact value="24" label="Сентября" />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('[role="img"]')).toBeNull()
  })
})
