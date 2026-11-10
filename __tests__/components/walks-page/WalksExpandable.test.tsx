import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { WalkTableRow } from '@/lib/walks'
import { WalksExpandable } from '@/components/walks-page/WalksExpandable'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const aug9_8am = new Date('2026-08-09T05:00:00.000Z')

const makeWalk = (n: number): WalkTableRow => ({
  id:                `walk-${n}`,
  slug:              `walk-slug-${n}`,
  title:             `Прогулка ${n}`,
  startsAt:          new Date(aug9_8am.getTime() + n * 86400_000),
  endsAt:            null,
  priceKopecks:      95000,
  minPriceKopecks:   95000,
  ticketTypeCount:   1,
  capacity:          10,
  ticketsSold:       n,
})

const walk1 = makeWalk(1)
const walk2 = makeWalk(2)
const walk3 = makeWalk(3)
const walk4 = makeWalk(4)

const fiveWalks = [makeWalk(1), makeWalk(2), makeWalk(3), makeWalk(4), makeWalk(5)]

describe('WalksExpandable — empty state', () => {
  it('returns null when walks array is empty', () => {
    const { container } = render(<WalksExpandable walks={[]} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('WalksExpandable — structure', () => {
  it('renders section with data-testid="walks-table"', () => {
    render(<WalksExpandable walks={[walk1]} />)
    expect(screen.getByTestId('walks-table')).toBeInTheDocument()
    expect(screen.getByTestId('walks-table').tagName).toBe('SECTION')
  })

  it('renders heading "Ближайшие"', () => {
    render(<WalksExpandable walks={[walk1]} />)
    expect(screen.getByRole('heading', { name: 'Ближайшие' })).toBeInTheDocument()
  })
})

describe('WalksExpandable — walk rows', () => {
  it('renders a link to /walks/[slug] for each walk', () => {
    render(<WalksExpandable walks={[walk1, walk2]} />)
    const links = screen.getAllByRole('link')
    expect(links.some(l => l.getAttribute('href') === '/walks/walk-slug-1')).toBe(true)
    expect(links.some(l => l.getAttribute('href') === '/walks/walk-slug-2')).toBe(true)
  })

  it('shows plain price for single ticket type', () => {
    render(<WalksExpandable walks={[walk1]} />)
    expect(screen.getByText('950 ₽')).toBeInTheDocument()
  })

  it('shows "от X" when ticketTypeCount > 1', () => {
    const multiType = { ...makeWalk(1), ticketTypeCount: 2, minPriceKopecks: 80000 }
    render(<WalksExpandable walks={[multiType]} />)
    expect(screen.getByText('от 800 ₽')).toBeInTheDocument()
  })

  it('shows "нет билетов" when available === 0', () => {
    const soldOut = { ...makeWalk(1), ticketsSold: 10 }
    render(<WalksExpandable walks={[soldOut]} />)
    expect(screen.getByText('нет билетов')).toBeInTheDocument()
  })

  it('shows "1 билет" when available === 1', () => {
    const oneLeft = { ...makeWalk(1), capacity: 10, ticketsSold: 9 }
    render(<WalksExpandable walks={[oneLeft]} />)
    expect(screen.getByText('1 билет')).toBeInTheDocument()
  })

  it('shows "5 билетов" when available === 5', () => {
    const fiveLeft = { ...makeWalk(1), capacity: 10, ticketsSold: 5 }
    render(<WalksExpandable walks={[fiveLeft]} />)
    expect(screen.getByText('5 билетов')).toBeInTheDocument()
  })

  it('treats negative available as 0 / "нет билетов"', () => {
    const oversold = { ...makeWalk(1), capacity: 5, ticketsSold: 7 }
    render(<WalksExpandable walks={[oversold]} />)
    expect(screen.getByText('нет билетов')).toBeInTheDocument()
  })
})

describe('WalksExpandable — expand/collapse (mobile)', () => {
  it('does not render "Посмотреть все" button when walks.length <= 3', () => {
    render(<WalksExpandable walks={[walk1, walk2, walk3]} />)
    expect(screen.queryByRole('button', { name: 'Посмотреть все' })).toBeNull()
  })

  it('renders "Посмотреть все" button when walks.length > 3', () => {
    render(<WalksExpandable walks={fiveWalks} />)
    expect(screen.getByRole('button', { name: 'Посмотреть все' })).toBeInTheDocument()
  })

  it('all rows are present in the DOM even before expansion (visibility is CSS-only)', () => {
    render(<WalksExpandable walks={fiveWalks} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })

  it('clicking "Посмотреть все" removes the button', () => {
    render(<WalksExpandable walks={fiveWalks} />)
    const btn = screen.getByRole('button', { name: 'Посмотреть все' })
    fireEvent.click(btn)
    expect(screen.queryByRole('button', { name: 'Посмотреть все' })).toBeNull()
  })

  it('table wrapper gains an "expanded"-like class after clicking the button', () => {
    render(<WalksExpandable walks={fiveWalks} />)
    const wrapper = screen.getByTestId('walks-expandable-wrapper')
    expect(wrapper.className).not.toContain('expanded')
    fireEvent.click(screen.getByRole('button', { name: 'Посмотреть все' }))
    expect(wrapper.className).toContain('expanded')
  })
})
