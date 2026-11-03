import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeamCard } from '@/components/cards/TeamCard'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} {...props} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const base = {
  name: 'Вероника Самоцкая',
  role: 'Основатель проекта Birdwatching Moscow',
  details: 'Биофак МГУ, зоолог, орнитолог, бёрдвотчинг-гид.',
  imageAlt: 'Фото Вероники',
  ebirdHref: 'https://ebird.org/profile/example',
}

describe('TeamCard — content', () => {
  it('renders name', () => {
    render(<TeamCard {...base} />)
    expect(screen.getByText(base.name)).toBeInTheDocument()
  })

  it('name element has text-h2 class', () => {
    render(<TeamCard {...base} />)
    expect(screen.getByText(base.name).className).toMatch(/text-h2/)
  })

  it('renders role', () => {
    render(<TeamCard {...base} />)
    expect(screen.getByText(base.role)).toBeInTheDocument()
  })

  it('renders details', () => {
    render(<TeamCard {...base} />)
    expect(screen.getByText(base.details)).toBeInTheDocument()
  })
})

describe('TeamCard — eBird link', () => {
  it('renders an anchor with ebirdHref when provided', () => {
    render(<TeamCard {...base} />)
    expect(screen.getByRole('link', { name: /ebird/i })).toHaveAttribute('href', base.ebirdHref)
  })

  it('does not render eBird button when ebirdHref is omitted', () => {
    const { ebirdHref: _unused, ...noLink } = base
    render(<TeamCard {...noLink} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})

describe('TeamCard — photo', () => {
  it('renders placeholder role="img" when imageUrl is not provided', () => {
    const { ebirdHref: _unused, ...noLink } = base
    const { container } = render(<TeamCard {...noLink} />)
    expect(container.querySelector('[role="img"]')).toBeInTheDocument()
  })

  it('renders img element when imageUrl is provided', () => {
    render(<TeamCard {...base} imageUrl="/photo.jpg" />)
    expect(screen.getByAltText(base.imageAlt)).toBeInTheDocument()
  })
})

describe('TeamCard — structure', () => {
  it('root element is <article>', () => {
    const { container } = render(<TeamCard {...base} />)
    expect(container.firstChild?.nodeName).toBe('ARTICLE')
  })

  it('className prop is forwarded to the root element', () => {
    const { container } = render(<TeamCard {...base} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })
})
