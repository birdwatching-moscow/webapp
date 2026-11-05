import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeMedia } from '@/components/HomeMedia/HomeMedia'

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

describe('HomeMedia — structure', () => {
  it('renders a <section> with data-testid="home-media"', () => {
    render(<HomeMedia />)
    expect(screen.getByTestId('home-media').tagName).toBe('SECTION')
  })

  it('renders the section heading', () => {
    render(<HomeMedia />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'СМИ, научные и научно-популярные журналы о нас' }),
    ).toBeInTheDocument()
  })
})

describe('HomeMedia — cards', () => {
  it('renders the two publication cards in order', () => {
    render(<HomeMedia />)
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual([
      'Отправьтесь на московский бердвотчинг Т—Ж',
      'Что такое бёрдвотчинг и в чём его фишка',
    ])
  })

  it('renders publication logos from public/images/media', () => {
    render(<HomeMedia />)
    expect(screen.getByAltText('Т—Ж')).toHaveAttribute('src', '/images/media/t-bank.png')
    expect(screen.getByAltText('Timepad')).toHaveAttribute('src', '/images/media/timepad.png')
  })

  it('each card opens its article in a new tab', () => {
    render(<HomeMedia />)
    const tj = screen.getByRole('link', { name: /Отправьтесь на московский бердвотчинг/ })
    const timepad = screen.getByRole('link', { name: /Что такое бёрдвотчинг/ })
    expect(tj).toHaveAttribute('href', 'https://t-j.ru/big-birding-day/')
    expect(timepad).toHaveAttribute('href', 'https://journal.timepad.ru/learn/chto-takoe-byordvotching')
    expect(tj).toHaveAttribute('target', '_blank')
    expect(timepad).toHaveAttribute('target', '_blank')
  })
})

describe('HomeMedia — Посмотреть все button', () => {
  it('links to the media page', () => {
    render(<HomeMedia />)
    expect(screen.getByRole('link', { name: 'Посмотреть все' })).toHaveAttribute('href', '/media')
  })
})
