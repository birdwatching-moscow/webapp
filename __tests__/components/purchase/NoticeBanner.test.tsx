import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoticeBanner } from '@/components/purchase/NoticeBanner'

describe('NoticeBanner — neutral states (SoldOut, Checking, Canceled)', () => {
  const neutralStates = ['SoldOut', 'Checking', 'Canceled'] as const

  neutralStates.forEach(state => {
    it(`${state} does not apply the error CSS class to the root element`, () => {
      const { container } = render(<NoticeBanner state={state} />)
      expect((container.firstChild as HTMLElement).className).not.toMatch(/error/)
    })
  })
})

describe('NoticeBanner — error states (WidgetFirst, WidgetRepeated, Unavailable, Declined, Expired, CheckingStopped)', () => {
  const errorStates = [
    'WidgetFirst',
    'WidgetRepeated',
    'Unavailable',
    'Declined',
    'Expired',
    'CheckingStopped',
  ] as const

  errorStates.forEach(state => {
    it(`${state} applies the error CSS class to the root element`, () => {
      const { container } = render(<NoticeBanner state={state} />)
      expect((container.firstChild as HTMLElement).className).toMatch(/error/)
    })
  })
})

describe('NoticeBanner — action slot', () => {
  it('renders no button when action is not provided', () => {
    const { container } = render(<NoticeBanner state="SoldOut" />)
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  it('renders the provided action node', () => {
    render(<NoticeBanner state="SoldOut" action={<button>Написать в поддержку</button>} />)
    expect(screen.getByRole('button', { name: 'Написать в поддержку' })).toBeInTheDocument()
  })
})

describe('NoticeBanner — className prop', () => {
  it('appends className to root element', () => {
    const { container } = render(<NoticeBanner state="Canceled" className="my-extra" />)
    expect(container.firstChild).toHaveClass('my-extra')
  })
})

describe('NoticeBanner — non-empty content', () => {
  it('renders non-empty text content for every state', () => {
    const allStates = [
      'SoldOut', 'Checking', 'Canceled',
      'WidgetFirst', 'WidgetRepeated', 'Unavailable',
      'Declined', 'Expired', 'CheckingStopped',
    ] as const

    allStates.forEach(state => {
      const { container } = render(<NoticeBanner state={state} />)
      expect((container.firstChild as HTMLElement).textContent?.trim()).not.toBe('')
    })
  })
})
