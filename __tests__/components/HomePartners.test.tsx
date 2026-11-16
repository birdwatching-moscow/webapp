import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomePartners } from '@/components/HomePartners/HomePartners'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('HomePartners — structure', () => {
  it('renders a <section> with data-testid="home-partners"', () => {
    render(<HomePartners />)
    expect(screen.getByTestId('home-partners').tagName).toBe('SECTION')
  })

  it('renders the section heading', () => {
    render(<HomePartners />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Друзья и партнёры проекта' }),
    ).toBeInTheDocument()
  })
})

describe('HomePartners — logos', () => {
  it('renders all 8 partner logos', () => {
    render(<HomePartners />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(8)
  })

  it('renders logos with correct src and alt', () => {
    render(<HomePartners />)
    expect(screen.getByAltText('Биологический факультет МГУ')).toHaveAttribute('src', '/images/partners/biofak.png')
    expect(screen.getByAltText('Leica')).toHaveAttribute('src', '/images/partners/leica.png')
    expect(screen.getByAltText('Парк Горького')).toHaveAttribute('src', '/images/partners/pg.png')
    expect(screen.getByAltText('Bird ID')).toHaveAttribute('src', '/images/partners/birdid.png')
    expect(screen.getByAltText('Macaulay Library')).toHaveAttribute('src', '/images/partners/macaulay.png')
    expect(screen.getByAltText('Monticola')).toHaveAttribute('src', '/images/partners/monticola.png')
    expect(screen.getByAltText('Элементы')).toHaveAttribute('src', '/images/partners/elements.png')
    expect(screen.getByAltText('Союз охраны птиц России')).toHaveAttribute('src', '/images/partners/sopr.png')
  })

  it('each logo links to a new tab', () => {
    render(<HomePartners />)
    const links = screen.getAllByRole('link').filter(
      (l) => l !== screen.queryByRole('link', { name: 'Посмотреть все' }),
    )
    expect(links).toHaveLength(8)
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})

describe('HomePartners — button', () => {
  it('renders "Посмотреть все" linking to /partners', () => {
    render(<HomePartners />)
    expect(screen.getByRole('link', { name: 'Посмотреть все' })).toHaveAttribute('href', '/partners')
  })
})
