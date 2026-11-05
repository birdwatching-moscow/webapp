import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PartnersPage, { metadata } from '@/app/partners/page'

describe('Partners page', () => {
  it('renders the «Друзья и партнёры проекта» heading', () => {
    render(<PartnersPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Друзья и партнёры проекта' }),
    ).toBeInTheDocument()
  })

  it('sets the page title', () => {
    expect(metadata.title).toBe('Друзья и партнёры проекта | Birdwatching Moscow')
  })
})
