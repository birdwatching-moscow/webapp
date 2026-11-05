import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditorialCard } from '@/components/cards/EditorialCard'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} {...props} />
  ),
}))

const base = {
  title: 'Что такое бёрдвотчинг и в чём его фишка',
  subtitle: 'Бёрдвотчинг — не новое, но как будто очень нужное занятие.',
  imageAlt: 'Иллюстрация к статье',
}

describe('EditorialCard — content', () => {
  it('renders title', () => {
    render(<EditorialCard {...base} />)
    expect(screen.getByText(base.title)).toBeInTheDocument()
  })

  it('title has text-h2 class', () => {
    render(<EditorialCard {...base} />)
    expect(screen.getByText(base.title).className).toMatch(/text-h2/)
  })

  it('title is an <h3> heading', () => {
    render(<EditorialCard {...base} />)
    expect(screen.getByRole('heading', { level: 3, name: base.title })).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<EditorialCard {...base} />)
    expect(screen.getByText(base.subtitle)).toBeInTheDocument()
  })
})

describe('EditorialCard — image', () => {
  it('renders a placeholder role="img" when imageUrl is not provided', () => {
    const { container } = render(<EditorialCard {...base} />)
    expect(container.querySelector('[role="img"]')).toBeInTheDocument()
  })

  it('renders img element when imageUrl is provided', () => {
    render(<EditorialCard {...base} imageUrl="/article.jpg" />)
    expect(screen.getByAltText(base.imageAlt)).toBeInTheDocument()
  })
})

describe('EditorialCard — structure', () => {
  it('root element is <article>', () => {
    const { container } = render(<EditorialCard {...base} />)
    expect(container.firstChild?.nodeName).toBe('ARTICLE')
  })

  it('className prop is forwarded to the root element', () => {
    const { container } = render(<EditorialCard {...base} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })

  it('renders no interactive elements', () => {
    const { container } = render(<EditorialCard {...base} />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })
})

describe('EditorialCard — link', () => {
  it('wraps the card in an external link when href is provided', () => {
    render(<EditorialCard {...base} href="https://example.com/article" />)
    const link = screen.getByRole('link', { name: new RegExp(base.title) })
    expect(link).toHaveAttribute('href', 'https://example.com/article')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
