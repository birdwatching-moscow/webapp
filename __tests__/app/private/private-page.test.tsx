import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivatePage, { metadata } from '@/app/(site)/private/page'

describe('/private page', () => {
  it('renders the page heading', () => {
    render(<PrivatePage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Частные события' })).toBeInTheDocument()
  })

  it.each([
    ['Прогулки по Москве', '/private-parks'],
    ['Лекции', '/private-lectures'],
    ['Персональные консультации', '/private-consultations'],
  ])('has a section heading «%s»', (heading) => {
    render(<PrivatePage />)
    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument()
  })

  it.each([
    ['/private-parks'],
    ['/private-lectures'],
    ['/private-consultations'],
  ])('has a «Подробнее» link to %s', (href) => {
    render(<PrivatePage />)
    const links = screen.getAllByRole('link', { name: 'Подробнее' })
    expect(links.some((l) => l.getAttribute('href') === href)).toBe(true)
  })

  it('renders the Воронье Гнездо notice banner', () => {
    render(<PrivatePage />)
    expect(screen.getAllByText(/Воронье гнездо/i).length).toBeGreaterThan(0)
  })

  it('keeps the page title', () => {
    expect(metadata.title).toBe('Частные события | Birdwatching Moscow')
  })
})
