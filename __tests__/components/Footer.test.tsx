import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/Footer'

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} />
  ),
}))

vi.mock('@/lib/footer-birds', () => ({
  getRandomBirdSrc: vi.fn(() => ({ src: '/footer-birds/kingfisher.jpg', name: 'Kingfisher' })),
}))

describe('Footer — structure', () => {
  it('renders a <footer> element', () => {
    const { container } = render(<Footer />)
    expect(container.querySelector('footer')).toBeInTheDocument()
  })
})

describe('Footer — logo block', () => {
  it('renders the Logo', () => {
    render(<Footer />)
    expect(screen.getByRole('img', { name: 'Birdwatching Moscow' })).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Footer />)
    expect(screen.getByText(/Знакомим людей с птицами/)).toBeInTheDocument()
  })
})

describe('Footer — bird photo', () => {
  it('renders bird image with src from getRandomBirdSrc', () => {
    render(<Footer />)
    const img = screen.getByAltText('Kingfisher')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/footer-birds/kingfisher.jpg')
  })

  it('uses bird name from getRandomBirdSrc as alt text', () => {
    render(<Footer />)
    expect(screen.getByAltText('Kingfisher')).toBeInTheDocument()
  })

  it('renders no bird image when getRandomBirdSrc returns null', async () => {
    const { getRandomBirdSrc } = await import('@/lib/footer-birds')
    vi.mocked(getRandomBirdSrc).mockReturnValueOnce(null)
    const { container } = render(<Footer />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('Footer — «события» column', () => {
  it('renders column label «СОБЫТИЯ»', () => {
    render(<Footer />)
    expect(screen.getByText('СОБЫТИЯ')).toBeInTheDocument()
  })

  it('renders link «Прогулки» → /walks', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Прогулки' })
    expect(link).toHaveAttribute('href', '/walks')
  })

  it('renders link «Экспедиции» → /expeditions', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Экспедиции' })
    expect(link).toHaveAttribute('href', '/expeditions')
  })

  it('renders link «Частные» → /private-events', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Частные' })
    expect(link).toHaveAttribute('href', '/private-events')
  })
})

describe('Footer — «прочее» column', () => {
  it('renders column label «ПРОЧЕЕ»', () => {
    render(<Footer />)
    expect(screen.getByText('ПРОЧЕЕ')).toBeInTheDocument()
  })

  it('renders link «О проекте» → /about', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'О проекте' })
    expect(link).toHaveAttribute('href', '/about')
  })

  it('renders link «FAQ» → /faq', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'FAQ' })
    expect(link).toHaveAttribute('href', '/faq')
  })

  it('renders link «Книга» → /book', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Книга' })
    expect(link).toHaveAttribute('href', '/book')
  })

  it('renders link «Сертификаты» → /certificates', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Сертификаты' })
    expect(link).toHaveAttribute('href', '/certificates')
  })

  it('renders link «BirdID» → /birdid', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'BirdID' })
    expect(link).toHaveAttribute('href', '/birdid')
  })
})

describe('Footer — «Контакты» column', () => {
  it('renders column label «КОНТАКТЫ»', () => {
    render(<Footer />)
    expect(screen.getByText('КОНТАКТЫ')).toBeInTheDocument()
  })

  it('renders email link with address as label', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'birdwatching@mail.ru' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'mailto:birdwatching@mail.ru')
  })

  it('renders link «ВКонтакте»', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'ВКонтакте' })).toBeInTheDocument()
  })

  it('renders link «Телеграм»', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Телеграм' })).toBeInTheDocument()
  })
})

describe('Footer — bottom bar', () => {
  it('shows the current year with copyright symbol', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year}`)).toBeInTheDocument()
  })

  it('renders «Оферта» link → /oferta', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Оферта' })
    expect(link).toHaveAttribute('href', '/oferta')
  })
})
