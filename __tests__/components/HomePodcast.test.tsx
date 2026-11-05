import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomePodcast } from '@/components/HomePodcast/HomePodcast'

describe('HomePodcast', () => {
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
})
