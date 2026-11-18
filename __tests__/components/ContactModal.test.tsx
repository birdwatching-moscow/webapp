import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MAX_REQUEST_NAME, MAX_REQUEST_MESSAGE } from '@/lib/validation/requests'

vi.mock('@/lib/api/requests', () => ({ submitContactRequest: vi.fn() }))

import { ContactModal } from '@/components/ContactModal/ContactModal'

const LEAD_TIME_NOTE =
  'Желательно дать нам вводные данные для вашей прогулки за неделю до нужной даты, а в апреле - июне - за 2-3 недели, так как график у гидов плотный.'

describe('ContactModal — private event lead-time note', () => {
  it('private event form shows the note below the form', () => {
    render(<ContactModal open onClose={vi.fn()} defaultType="PRIVATE_EVENT" />)
    const note = screen.getByText(LEAD_TIME_NOTE)
    // Outside the bordered form card, as in Figma 2088:8554
    expect(note.closest('form')).toBeNull()
    expect(screen.getByRole('dialog')).toContainElement(note)
  })

  it.each(['QUESTION', 'EXPEDITION', 'CERTIFICATE'] as const)('%s form has no such note', (type) => {
    render(<ContactModal open onClose={vi.fn()} defaultType={type} />)
    expect(screen.queryByText(LEAD_TIME_NOTE)).toBeNull()
  })
})

describe('ContactModal — no character counters', () => {
  const COUNTER = /\d+ \/ \d+|Максимум \d+ символов/

  it.each(['QUESTION', 'EXPEDITION', 'CERTIFICATE', 'PRIVATE_EVENT'] as const)(
    '%s form shows no counter while typing, even at the limit',
    (type) => {
      render(<ContactModal open onClose={vi.fn()} defaultType={type} />)
      fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'Анна' } })
      fireEvent.change(screen.getByPlaceholderText('Комментарий'), { target: { value: 'Вопрос' } })
      expect(screen.queryByText(COUNTER)).toBeNull()

      fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'а'.repeat(MAX_REQUEST_NAME) } })
      fireEvent.change(screen.getByPlaceholderText('Комментарий'), { target: { value: 'а'.repeat(MAX_REQUEST_MESSAGE) } })
      expect(screen.queryByText(COUNTER)).toBeNull()
    },
  )

  it('fields still cap input length', () => {
    render(<ContactModal open onClose={vi.fn()} defaultType="QUESTION" />)
    expect(screen.getByPlaceholderText('Имя')).toHaveAttribute('maxlength', String(MAX_REQUEST_NAME))
    expect(screen.getByPlaceholderText('Комментарий')).toHaveAttribute('maxlength', String(MAX_REQUEST_MESSAGE))
  })
})
