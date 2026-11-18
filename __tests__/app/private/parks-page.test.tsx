import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))
vi.mock('@/components/ContactModal/ContactModal', () => ({ ContactModal: () => null }))

import ParksPage, { metadata } from '@/app/(site)/private-parks/page'
import { PRIVATE_PARKS } from '@/lib/private/parks'

describe('/private-parks page', () => {
  it('sets the page title', () => {
    expect(metadata.title).toBe('Парки Москвы и окрестностей | Birdwatching Moscow')
  })

  it('hero: h1, subtitle and «Посмотреть стоимость» jumping to the price section', () => {
    render(<ParksPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Парки Москвы и окрестностей' })).toBeInTheDocument()
    expect(
      screen.getByText('Примеры локации для персональных прогулок с гидом Birdwatching Moscow.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Посмотреть стоимость' })).toHaveAttribute('href', '#price')
    expect(document.getElementById('price')).not.toBeNull()
  })

  it('«Примеры локаций»: one card per park with its photo', () => {
    render(<ParksPage />)
    const section = screen.getByRole('region', { name: 'Примеры локаций' })
    const cards = within(section).getAllByRole('article')
    expect(cards).toHaveLength(PRIVATE_PARKS.length)
    expect(within(cards[0]).getByText('Скверы МГУ')).toBeInTheDocument()
    expect(within(cards[0]).getByRole('img', { name: 'Скверы МГУ' })).toHaveAttribute('src', '/images/parks/mgu.jpg')
    expect(within(cards[0]).getByTestId('photo-caption')).toHaveTextContent('Ivtorov, CC BY-SA 4.0')
  })

  it('«альбомы» opens the VK photo albums in a new tab', () => {
    render(<ParksPage />)
    const link = screen.getByRole('link', { name: 'альбомы' })
    expect(link).toHaveAttribute('href', 'https://vk.ru/albums-81135982')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('«Важно знать»: five cards, «Подробнее» links to FAQ', () => {
    render(<ParksPage />)
    const section = screen.getByRole('region', { name: 'Важно знать' })
    for (const title of ['Птицы не гарантированы', 'Прошлые прогулки', 'Что взять с собой', 'Одежда по погоде', 'Место встречи']) {
      expect(within(section).getByText(title)).toBeInTheDocument()
    }
    expect(within(section).getByRole('link', { name: 'Подробнее' })).toHaveAttribute('href', '/faq')
  })

  it('«Стоимость и условия»: both group prices and the request button', () => {
    render(<ParksPage />)
    const section = screen.getByRole('region', { name: 'Стоимость и условия' })
    expect(within(section).getByText('7 000 ₽')).toBeInTheDocument()
    expect(within(section).getByText('10 000 ₽')).toBeInTheDocument()
    expect(within(section).getByRole('button', { name: 'Оставить заявку' })).toBeInTheDocument()
  })
})
