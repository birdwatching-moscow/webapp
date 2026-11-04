import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionIntro } from '@/components/SectionIntro/SectionIntro'

describe('SectionIntro', () => {
  it('renders the title as an <h2>', () => {
    render(<SectionIntro title="Частные события" description="Описание" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Частные события' })).toBeInTheDocument()
  })

  it('renders the description paragraph', () => {
    render(<SectionIntro title="Частные события" description="Описание раздела" />)
    expect(screen.getByText('Описание раздела').tagName).toBe('P')
  })
})
