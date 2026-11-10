import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WalksTable } from '@/components/WalksTable/WalksTable'
import type { WalkTableRow } from '@/lib/walks'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const aug9_8am = new Date('2026-08-09T05:00:00.000Z')

const walks: WalkTableRow[] = [
  {
    id: 'walk-1',
    slug: 'birdwatching-mgu',
    title: 'Бёрдвотчинг по скверам МГУ',
    startsAt: aug9_8am,
    endsAt: null,
    priceKopecks: 95000,
    minPriceKopecks: 95000,
    ticketTypeCount: 1,
    capacity: 12,
    ticketsSold: 11,
  },
  {
    id: 'walk-2',
    slug: 'ptitsy-losiny-ostrov',
    title: 'Птицы Лосиного острова',
    startsAt: new Date('2026-08-15T05:00:00.000Z'),
    endsAt: null,
    priceKopecks: 95000,
    minPriceKopecks: 95000,
    ticketTypeCount: 1,
    capacity: 10,
    ticketsSold: 10,
  },
]

describe('WalksTable — empty state', () => {
  it('renders nothing when walks array is empty', () => {
    const { container } = render(<WalksTable walks={[]} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('WalksTable — structure', () => {
  it('renders section with data-testid="walks-table"', () => {
    render(<WalksTable walks={walks} />)
    expect(screen.getByTestId('walks-table')).toBeInTheDocument()
    expect(screen.getByTestId('walks-table').tagName).toBe('SECTION')
  })

  it('renders heading "Ближайшие"', () => {
    render(<WalksTable walks={walks} />)
    expect(screen.getByRole('heading', { name: 'Ближайшие' })).toBeInTheDocument()
  })
})

describe('WalksTable — walk rows', () => {
  it('renders a link to /walks/[slug] for each walk', () => {
    render(<WalksTable walks={walks} />)
    const link1 = screen.getByRole('link', { name: /МГУ/ })
    expect(link1).toHaveAttribute('href', '/walks/birdwatching-mgu')
  })

  it('renders second walk link with correct href', () => {
    render(<WalksTable walks={walks} />)
    const link2 = screen.getByRole('link', { name: /Лосиного/ })
    expect(link2).toHaveAttribute('href', '/walks/ptitsy-losiny-ostrov')
  })

  it('renders plain price for single ticket type', () => {
    render(<WalksTable walks={walks} />)
    const prices = screen.getAllByText('950 ₽')
    expect(prices.length).toBe(2)
  })

  it('renders "1 билет" for walk with 1 available ticket', () => {
    render(<WalksTable walks={walks} />)
    expect(screen.getByText('1 билет')).toBeInTheDocument()
  })

  it('renders "нет билетов" for walk with 0 available tickets', () => {
    render(<WalksTable walks={walks} />)
    expect(screen.getByText('нет билетов')).toBeInTheDocument()
  })

  it('renders date label for first walk', () => {
    render(<WalksTable walks={walks} />)
    expect(screen.getByText('09.08.2026 · 08:00')).toBeInTheDocument()
  })
})

describe('WalksTable — showMoreButton', () => {
  it('does not render "Подробнее" link by default', () => {
    render(<WalksTable walks={walks} />)
    expect(screen.queryByRole('link', { name: 'Подробнее' })).not.toBeInTheDocument()
  })

  it('renders "Подробнее" link to /walks when showMoreButton={true}', () => {
    render(<WalksTable walks={walks} showMoreButton />)
    const btn = screen.getByRole('link', { name: 'Подробнее' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/walks')
  })

  it('does not render "Подробнее" when showMoreButton={false}', () => {
    render(<WalksTable walks={walks} showMoreButton={false} />)
    expect(screen.queryByRole('link', { name: 'Подробнее' })).not.toBeInTheDocument()
  })
})
