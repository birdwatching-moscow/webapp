import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LectureVideoCard } from '@/components/private/LectureVideoCard'

const lecture = {
  title: 'Как стать бердвотчером',
  subtitle: 'Лекция и утренняя прогулка',
}

describe('LectureVideoCard', () => {
  it('renders the title as an h2 inside an article', () => {
    render(<LectureVideoCard {...lecture} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: lecture.title })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<LectureVideoCard {...lecture} />)
    expect(screen.getByText(lecture.subtitle)).toBeInTheDocument()
  })

  it('shows a labelled placeholder while there is no video', () => {
    render(<LectureVideoCard {...lecture} />)
    expect(screen.getByRole('img', { name: 'Видео «Как стать бердвотчером» скоро появится' })).toBeInTheDocument()
  })
})
