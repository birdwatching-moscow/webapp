import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Review } from '@/components/cards/Review'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} {...props} />
  ),
}))

const base = {
  authorName: 'anna.gorban.169',
  body: '«Моя первая встреча с совой. Самостоятельно найти это чудо просто невозможно.»',
}

describe('Review — content', () => {
  it('renders authorName', () => {
    render(<Review {...base} />)
    expect(screen.getByText(base.authorName)).toBeInTheDocument()
  })

  it('authorName has text-h2 class', () => {
    render(<Review {...base} />)
    expect(screen.getByText(base.authorName).className).toMatch(/text-h2/)
  })

  it('renders body text', () => {
    render(<Review {...base} />)
    expect(screen.getByText(base.body)).toBeInTheDocument()
  })
})

describe('Review — author photo', () => {
  it('renders img with authorName alt using the default image when authorImageUrl is not provided', () => {
    render(<Review {...base} />)
    expect(screen.getByAltText(base.authorName)).toBeInTheDocument()
  })

  it('renders img element with authorName as alt when authorImageUrl is provided', () => {
    render(<Review {...base} authorImageUrl="/avatar.jpg" />)
    expect(screen.getByAltText(base.authorName)).toBeInTheDocument()
  })
})

describe('Review — structure', () => {
  it('root element is <article>', () => {
    const { container } = render(<Review {...base} />)
    expect(container.firstChild?.nodeName).toBe('ARTICLE')
  })

  it('className prop is forwarded to the root element', () => {
    const { container } = render(<Review {...base} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })

  it('renders no interactive elements', () => {
    const { container } = render(<Review {...base} />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })
})
