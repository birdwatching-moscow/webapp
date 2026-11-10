import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MediaPage, { metadata } from '@/app/(site)/media/page'

describe('Media page', () => {
  it('renders the «СМИ и материалы о бердвотчинге» heading', () => {
    render(<MediaPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'СМИ и материалы о бердвотчинге' }),
    ).toBeInTheDocument()
  })

  it('sets the page title', () => {
    expect(metadata.title).toBe('СМИ и материалы о бердвотчинге | Birdwatching Moscow')
  })
})
