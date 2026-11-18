import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

vi.mock('@/components/ContactModal/ContactModal', () => ({ ContactModal: () => null }))

import LecturesPage, { metadata } from '@/app/(site)/private-lectures/page'
import { PRIVATE_LECTURES } from '@/lib/private/lectures'

describe('/private-lectures page', () => {
  it('sets the page title', () => {
    expect(metadata.title).toBe('Лекции | Birdwatching Moscow')
  })

  it('hero: h1, both intro paragraphs and the «Оставить заявку» button', () => {
    render(<LecturesPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Лекции' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Пригласите эксперта Birdwatching Moscow провести лекцию о птицах, бёрдвотчинге и городской природе.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Проводим лекции для компаний, школ, библиотек, музеев, образовательных и культурных проектов. Тему и формат можем подобрать под вашу аудиторию и задачу.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Оставить заявку' })).toBeInTheDocument()
  })

  it('«Записи лекций»: one card per lecture with title, subtitle and a video placeholder', () => {
    render(<LecturesPage />)
    const section = screen.getByRole('region', { name: 'Записи лекций' })
    const cards = within(section).getAllByRole('article')
    expect(cards).toHaveLength(PRIVATE_LECTURES.length)

    const first = cards[0]
    expect(within(first).getByRole('heading', { level: 2, name: 'Природа на остановке!' })).toBeInTheDocument()
    expect(within(first).getByText('Поп-ап-инсталляция, Северный речной вокзал, МТМ')).toBeInTheDocument()
    expect(within(first).getByRole('img', { name: 'Видео «Природа на остановке!» скоро появится' })).toBeInTheDocument()

    const last = cards[cards.length - 1]
    expect(within(last).getByRole('heading', { level: 2, name: 'Как стать бердвотчером' })).toBeInTheDocument()
    expect(
      within(last).getByText('Лекция и утренняя прогулка, Республиканская детская библиотека, Ташкент'),
    ).toBeInTheDocument()
  })

  it('shows the seven lectures from the design', () => {
    expect(PRIVATE_LECTURES).toHaveLength(7)
  })
})
