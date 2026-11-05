import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeBook } from '@/components/HomeBook/HomeBook'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('HomeBook', () => {
  it('renders the section with testid', () => {
    render(<HomeBook />)
    expect(screen.getByTestId('home-book')).toBeInTheDocument()
  })

  it('renders the book title', () => {
    render(<HomeBook />)
    expect(screen.getByRole('heading', { name: /В том дереве слева/i })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<HomeBook />)
    expect(screen.getByText(/Вероники Самоцкой/i)).toBeInTheDocument()
  })

  it('renders the book cover image with alt text', () => {
    render(<HomeBook />)
    expect(screen.getByRole('img', { name: /В том дереве слева/i })).toBeInTheDocument()
  })

  it('renders a link to /book', () => {
    render(<HomeBook />)
    const link = screen.getByRole('link', { name: /Подробнее/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/book')
  })
})
