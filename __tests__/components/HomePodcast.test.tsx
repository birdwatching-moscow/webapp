import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomePodcast } from '@/components/HomePodcast/HomePodcast'

const APPLE_EMBED_SRC =
  'https://embed.podcasts.apple.com/ua/podcast/%D0%B2%D0%B8%D1%82%D1%8E-%D0%B2%D0%B8%D0%B4%D0%B5%D0%BB-%D1%82%D1%80%D0%B5%D0%B9%D0%BB%D0%B5%D1%80-%D0%BF%D0%BE%D0%B4%D0%BA%D0%B0%D1%81%D1%82%D0%B0-%D0%BF%D1%80%D0%BE-%D0%BF%D1%82%D0%B8%D1%86/id1580414020?i=1000531511652'

const setTimeZone = (timeZone: string) =>
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    ...new Intl.DateTimeFormat().resolvedOptions(),
    timeZone,
  })

afterEach(() => vi.restoreAllMocks())

describe('HomePodcast', () => {
  // The player depends on the browser time zone — pin it so these don't depend on the machine
  beforeEach(() => setTimeZone('Europe/Moscow'))

  it('renders the section with testid', () => {
    render(<HomePodcast />)
    expect(screen.getByTestId('home-podcast')).toBeInTheDocument()
  })

  it('renders the podcast title as a heading', () => {
    render(<HomePodcast />)
    expect(screen.getByRole('heading', { name: /Подкаст/i })).toBeInTheDocument()
  })

  it('renders the description mentioning Arzamas', () => {
    render(<HomePodcast />)
    expect(screen.getByText(/Arzamas/i)).toBeInTheDocument()
  })

  it('renders Yandex Music link with correct href', () => {
    render(<HomePodcast />)
    const link = screen.getByRole('link', { name: /Яндекс\.Музыка/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://music.yandex.ru/album/17448287')
  })

  it('renders Apple Podcast link with correct href', () => {
    render(<HomePodcast />)
    const link = screen.getByRole('link', { name: /Apple Podcast/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://podcasts.apple.com/ru/podcast/id1580414020')
  })

  it('renders the Yandex Music widget iframe', () => {
    render(<HomePodcast />)
    const iframe = document.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe?.getAttribute('src')).toContain('17448287')
  })

  // The player is a whole Yandex Music app (~300 requests, several MB);
  // load it only when the user scrolls near the podcast section.
  it('lazy-loads the Yandex Music widget', () => {
    render(<HomePodcast />)
    expect(document.querySelector('iframe')).toHaveAttribute('loading', 'lazy')
  })
})

describe('HomePodcast — player by the visitor time zone', () => {
  it('outside Russia shows the Apple Podcasts player instead of Yandex Music', () => {
    setTimeZone('Europe/Berlin')
    render(<HomePodcast />)
    const iframes = document.querySelectorAll('iframe')
    expect(iframes).toHaveLength(1)
    expect(iframes[0]).toHaveAttribute('src', APPLE_EMBED_SRC)
    expect(iframes[0]).toHaveAttribute('title', 'Подкаст «Витю видел?» в Apple Podcasts')
    expect(iframes[0]).toHaveAttribute('loading', 'lazy')
    expect(iframes[0]).toHaveAttribute(
      'sandbox',
      'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation',
    )
    expect(iframes[0]).toHaveAttribute('allow', 'autoplay *; encrypted-media *; fullscreen *; clipboard-write')
  })

  it.each(['Europe/Moscow', 'Asia/Vladivostok'])('in Russia (%s) keeps the Yandex Music player', (tz) => {
    setTimeZone(tz)
    render(<HomePodcast />)
    expect(document.querySelector('iframe')?.getAttribute('src')).toContain('music.yandex.ru')
  })

  it('keeps Yandex Music when the time zone cannot be read', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockImplementation(() => {
      throw new Error('no Intl')
    })
    render(<HomePodcast />)
    expect(document.querySelector('iframe')?.getAttribute('src')).toContain('music.yandex.ru')
  })
})
