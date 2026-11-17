import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomePrivate } from '@/components/HomePrivate/HomePrivate'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('HomePrivate — structure', () => {
  it('renders a <section> with data-testid="home-private"', () => {
    render(<HomePrivate />)
    expect(screen.getByTestId('home-private').tagName).toBe('SECTION')
  })

  it('renders the heading «Частные события»', () => {
    render(<HomePrivate />)
    expect(screen.getByRole('heading', { level: 2, name: 'Частные события' })).toBeInTheDocument()
  })

  it('renders the intro description', () => {
    render(<HomePrivate />)
    expect(screen.getByText(/Мы организуем частные прогулки/)).toBeInTheDocument()
  })
})

describe('HomePrivate — cards', () => {
  it('renders the three event type cards', () => {
    render(<HomePrivate />)
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual([
      'Персональная прогулка в Москве и окрестностях',
      'Лекции',
      'Персональные консультации',
    ])
  })

  it('each card links to its private event page', () => {
    render(<HomePrivate />)
    expect(screen.getByRole('link', { name: /Персональная прогулка/ })).toHaveAttribute('href', '/private-walks')
    expect(screen.getByRole('link', { name: /Лекции/ })).toHaveAttribute('href', '/private-lectures')
    expect(screen.getByRole('link', { name: /Персональные консультации/ })).toHaveAttribute('href', '/private-consultations')
  })
})

describe('HomePrivate — Подробнее button', () => {
  it('links to the private events page', () => {
    render(<HomePrivate />)
    expect(screen.getByRole('link', { name: 'Подробнее' })).toHaveAttribute('href', '/private-events')
  })
})
