import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PurchaseSummary } from '@/components/purchase/PurchaseSummary'

const base = {
  walkTitle: 'Утренняя прогулка',
  walkDate: new Date('2025-03-12T06:00:00Z'), // 06:00 UTC = 09:00 Europe/Moscow
  walkLocation: 'Парк Горького',
  quantity: 1,
  unitPriceKopecks: 75000,
}

// Normalize Unicode whitespace for money assertions.
const normalize = (s: string) => s.replace(/[  ]/g, ' ')

describe('PurchaseSummary — fields rendered', () => {
  it('renders walkTitle in an element with class "text-h3"', () => {
    render(<PurchaseSummary {...base} />)
    const el = screen.getByText(base.walkTitle)
    expect(el.className).toMatch(/text-h3/)
  })

  it('renders date as "12 марта, 09:00" in Europe/Moscow timezone', () => {
    render(<PurchaseSummary {...base} />)
    expect(screen.getByText(/12 марта.*09:00/)).toBeInTheDocument()
  })

  it('renders walkLocation', () => {
    render(<PurchaseSummary {...base} />)
    expect(screen.getByText(base.walkLocation)).toBeInTheDocument()
  })
})

describe('PurchaseSummary — Russian plural quantity', () => {
  it('quantity=1 renders "1 билет"', () => {
    render(<PurchaseSummary {...base} quantity={1} />)
    expect(screen.getByText(/1 билет\b/)).toBeInTheDocument()
  })

  it('quantity=2 renders "2 билета"', () => {
    render(<PurchaseSummary {...base} quantity={2} />)
    expect(screen.getByText(/2 билета/)).toBeInTheDocument()
  })

  it('quantity=5 renders "5 билетов"', () => {
    render(<PurchaseSummary {...base} quantity={5} />)
    expect(screen.getByText(/5 билетов/)).toBeInTheDocument()
  })
})

describe('PurchaseSummary — money formatting', () => {
  it('unit price 75000 kopecks renders as "750,00 ₽"', () => {
    render(<PurchaseSummary {...base} unitPriceKopecks={75000} quantity={1} />)
    expect(normalize(document.body.textContent!)).toContain('750,00 ₽')
  })

  it('total for quantity=2, unitPriceKopecks=75000 renders "1 500,00 ₽"', () => {
    render(<PurchaseSummary {...base} unitPriceKopecks={75000} quantity={2} />)
    expect(normalize(document.body.textContent!)).toContain('1 500,00 ₽')
  })

  it('unitPriceKopecks=0 renders "0,00 ₽" for both unit price and total', () => {
    render(<PurchaseSummary {...base} unitPriceKopecks={0} />)
    const text = normalize(document.body.textContent!)
    expect((text.match(/0,00 ₽/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })
})

describe('PurchaseSummary — structural constraints', () => {
  it('renders no interactive elements', () => {
    const { container } = render(<PurchaseSummary {...base} />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('form')).toBeNull()
  })

  it('className prop is forwarded to the root element', () => {
    const { container } = render(<PurchaseSummary {...base} className="extra-class" />)
    expect(container.firstChild).toHaveClass('extra-class')
  })
})
