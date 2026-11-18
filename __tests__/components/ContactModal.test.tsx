import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
