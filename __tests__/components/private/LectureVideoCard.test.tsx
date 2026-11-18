import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

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

  it('uses the shared image placeholder picture', () => {
    render(<LectureVideoCard {...lecture} />)
    expect(screen.getByRole('img', { name: 'Видео «Как стать бердвотчером» скоро появится' })).toHaveAttribute(
      'src',
      '/placeholders/image-placeholder.png',
    )
  })

  it('is not a link while there is no video', () => {
    render(<LectureVideoCard {...lecture} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  describe('with a video', () => {
    const videoUrl = 'https://vk.com/video-81135982_456239017'

    it('the card is a link to the video, named by the lecture title', () => {
      render(<LectureVideoCard {...lecture} videoUrl={videoUrl} />)
      expect(screen.getByRole('link', { name: /Как стать бердвотчером/ })).toHaveAttribute('href', videoUrl)
    })

    it('opens the video in a new tab', () => {
      render(<LectureVideoCard {...lecture} videoUrl={videoUrl} />)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('no longer says the video is coming soon', () => {
      render(<LectureVideoCard {...lecture} videoUrl={videoUrl} />)
      expect(screen.queryByText(/скоро появится/)).toBeNull()
      expect(screen.queryByRole('img', { name: /скоро появится/ })).toBeNull()
    })
  })
})
