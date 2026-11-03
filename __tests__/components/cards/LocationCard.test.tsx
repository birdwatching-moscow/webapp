import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LocationCard } from '@/components/cards/LocationCard'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} {...props} />
  ),
}))

const base = {
  name: 'Измайловский парк',
  description: 'Старейший лесопарк Москвы с богатой орнитофауной.',
  species: 'кряква, зяблик, большая синица',
  imageAlt: 'Фото локации',
}

describe('LocationCard — content', () => {
  it('renders name', () => {
    render(<LocationCard {...base} />)
    expect(screen.getByText(base.name)).toBeInTheDocument()
  })

  it('name has text-h2 class', () => {
    render(<LocationCard {...base} />)
    expect(screen.getByText(base.name).className).toMatch(/text-h2/)
  })

  it('renders description', () => {
    render(<LocationCard {...base} />)
    expect(screen.getByText(base.description)).toBeInTheDocument()
  })

  it('renders "Птицы: " prefix followed by species value', () => {
    render(<LocationCard {...base} />)
    const el = screen.getByText(/Птицы:/)
    expect(el.textContent).toContain('Птицы:')
    expect(el.textContent).toContain(base.species)
  })
})

describe('LocationCard — image', () => {
  it('renders placeholder role="img" when imageUrl is not provided', () => {
    const { container } = render(<LocationCard {...base} />)
    expect(container.querySelector('[role="img"]')).toBeInTheDocument()
  })

  it('renders img element when imageUrl is provided', () => {
    render(<LocationCard {...base} imageUrl="/location.jpg" />)
    expect(screen.getByAltText(base.imageAlt)).toBeInTheDocument()
  })
})

describe('LocationCard — structure', () => {
  it('root element is <article>', () => {
    const { container } = render(<LocationCard {...base} />)
    expect(container.firstChild?.nodeName).toBe('ARTICLE')
  })

  it('className prop is forwarded to the root element', () => {
    const { container } = render(<LocationCard {...base} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })

  it('renders no interactive elements', () => {
    const { container } = render(<LocationCard {...base} />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })
})
