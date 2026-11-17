import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

vi.mock('@/components/ContactModal/ContactModal', () => ({
  ContactModal: ({ open, defaultType }: { open: boolean; defaultType?: string }) =>
    open ? <div role="dialog" data-type={defaultType} /> : null,
}))

import { PrivatePricing } from '@/components/private/PrivatePricing'

const props = {
  description: 'Прогулка 1.5-2 часа',
  prices: [
    { label: 'группа до 5 человек', price: '7 000 ₽' },
    { label: 'группа до 14 человек', price: '10 000 ₽' },
  ],
  note: 'Другие длительность и локации рассчитываются индивидуально.',
  terms: 'После согласования всех деталей прогулки…',
}

describe('PrivatePricing', () => {
  it('is the #price anchor target with the «Стоимость и условия» heading', () => {
    render(<PrivatePricing {...props} />)
    const section = screen.getByRole('region', { name: 'Стоимость и условия' })
    expect(section).toHaveAttribute('id', 'price')
  })

  it('shows every price with its group label', () => {
    render(<PrivatePricing {...props} />)
    for (const { label, price } of props.prices) {
      const card = screen.getByText(price).parentElement as HTMLElement
      expect(within(card).getByText(label)).toBeInTheDocument()
    }
  })

  it('shows the description, the note and the terms', () => {
    render(<PrivatePricing {...props} />)
    expect(screen.getByText(props.description)).toBeInTheDocument()
    expect(screen.getByText(props.note)).toBeInTheDocument()
    expect(screen.getByText(props.terms)).toBeInTheDocument()
  })

  it('«Оставить заявку» opens the contact form for a private event', () => {
    render(<PrivatePricing {...props} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Оставить заявку' }))
    expect(screen.getByRole('dialog')).toHaveAttribute('data-type', 'PRIVATE_EVENT')
  })
})
