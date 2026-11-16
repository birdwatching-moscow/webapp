import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InfoCard } from '@/components/InfoCard/InfoCard'

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

const base = {
  imageSrc: '/images/home-walks.jpg',
  imageAlt: 'Фото',
  title: 'Лекции',
  description: 'Проводим лекции для компаний.',
}

describe('InfoCard — content', () => {
  it('renders the title as an <h3>', () => {
    render(<InfoCard {...base} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Лекции' })).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<InfoCard {...base} />)
    expect(screen.getByText('Проводим лекции для компаний.')).toBeInTheDocument()
  })

  it('renders the image with alt text', () => {
    render(<InfoCard {...base} />)
    expect(screen.getByAltText('Фото')).toHaveAttribute('src', '/images/home-walks.jpg')
  })

  it('renders the label when provided', () => {
    render(<InfoCard {...base} label="4–11 декабря" />)
    expect(screen.getByText('4–11 декабря')).toBeInTheDocument()
  })
})

describe('InfoCard — link behaviour', () => {
  it('is a link to href when href is provided', () => {
    render(<InfoCard {...base} href="/expeditions/altay" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/expeditions/altay')
  })

  it('renders no link when href is omitted', () => {
    render(<InfoCard {...base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
