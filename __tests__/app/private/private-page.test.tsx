import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivatePage, { metadata } from '@/app/(site)/private/page'

describe('/private page — temporary links to the three private sections', () => {
  it.each([
    ['Парки', '/private/parks'],
    ['Лекции', '/private/lectures'],
    ['Консультации', '/private/consultations'],
  ])('has a «%s» button linking to %s', (label, href) => {
    render(<PrivatePage />)
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
  })

  it('renders exactly these three links', () => {
    render(<PrivatePage />)
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('keeps the page title', () => {
    expect(metadata.title).toBe('Частные события | Birdwatching Moscow')
  })
})
