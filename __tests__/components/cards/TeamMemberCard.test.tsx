import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeamMemberCard } from '@/components/cards/TeamMemberCard'

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

describe('TeamMemberCard — content', () => {
  it('renders name', () => {
    render(<TeamMemberCard {...base} />)
    expect(screen.getByText(base.name)).toBeInTheDocument()
  })

  it('name element has text-h2 class', () => {
    render(<TeamMemberCard {...base} />)
    expect(screen.getByText(base.name).className).toMatch(/text-h2/)
  })

  it('renders role', () => {
    render(<TeamMemberCard {...base} />)
    expect(screen.getByText(base.role)).toBeInTheDocument()
  })

  it('renders details', () => {
    render(<TeamMemberCard {...base} />)
    expect(screen.getByText(base.details)).toBeInTheDocument()
  })
})

describe('TeamMemberCard — eBird link', () => {
  it('renders an anchor with ebirdHref when provided', () => {
    render(<TeamMemberCard {...base} />)
    expect(screen.getByRole('link', { name: /ebird/i })).toHaveAttribute('href', base.ebirdHref)
  })

  it('does not render eBird button when ebirdHref is omitted', () => {
    const { ebirdHref: _unused, ...noLink } = base
    render(<TeamMemberCard {...noLink} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})

describe('TeamMemberCard — photo', () => {
  it('renders placeholder role="img" when imageUrl is not provided', () => {
    const { ebirdHref: _unused, ...noLink } = base
    const { container } = render(<TeamMemberCard {...noLink} />)
    expect(container.querySelector('[role="img"]')).toBeInTheDocument()
  })

  it('renders img element when imageUrl is provided', () => {
    render(<TeamMemberCard {...base} imageUrl="/photo.jpg" />)
    expect(screen.getByAltText(base.imageAlt)).toBeInTheDocument()
  })
})

describe('TeamMemberCard — structure', () => {
  it('root element is <article>', () => {
    const { container } = render(<TeamMemberCard {...base} />)
    expect(container.firstChild?.nodeName).toBe('ARTICLE')
  })

  it('className prop is forwarded to the root element', () => {
    const { container } = render(<TeamMemberCard {...base} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })
})
