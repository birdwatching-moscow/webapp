import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpeditionCard } from '@/components/cards/ExpeditionCard'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} {...props} />
  ),
}))

const base = {
  dateRange: '15–22 мая',
  title: 'Дагестан: горы и каспийский берег',
  summary: 'Восемь дней, смешанные биотопы, до двенадцати участников.',
  imageAlt: 'Фото экспедиции',
}

describe('ExpeditionCard — content', () => {
  it('renders dateRange', () => {
    render(<ExpeditionCard {...base} />)
    expect(screen.getByText(base.dateRange)).toBeInTheDocument()
  })

  it('dateRange element has text-label class', () => {
    render(<ExpeditionCard {...base} />)
    expect(screen.getByText(base.dateRange).className).toMatch(/text-label/)
  })

  it('renders title', () => {
    render(<ExpeditionCard {...base} />)
    expect(screen.getByText(base.title)).toBeInTheDocument()
  })

  it('title has text-h2 class', () => {
    render(<ExpeditionCard {...base} />)
    expect(screen.getByText(base.title).className).toMatch(/text-h2/)
  })

  it('renders summary', () => {
    render(<ExpeditionCard {...base} />)
    expect(screen.getByText(base.summary)).toBeInTheDocument()
  })
})

describe('ExpeditionCard — photo zone', () => {
  it('renders a button with aria-label "Открыть превью"', () => {
    render(<ExpeditionCard {...base} />)
    expect(screen.getByRole('button', { name: 'Открыть превью' })).toBeInTheDocument()
  })

  it('renders the ⓘ character inside the photo zone', () => {
    render(<ExpeditionCard {...base} />)
    expect(screen.getByText('ⓘ')).toBeInTheDocument()
  })

  it('clicking the photo button calls onPreview once', () => {
    const onPreview = vi.fn()
    render(<ExpeditionCard {...base} onPreview={onPreview} />)
    fireEvent.click(screen.getByRole('button', { name: 'Открыть превью' }))
    expect(onPreview).toHaveBeenCalledTimes(1)
  })

  it('clicking the photo button without onPreview does not throw', () => {
    render(<ExpeditionCard {...base} />)
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Открыть превью' }))).not.toThrow()
  })

  it('renders placeholder role="img" when imageUrl is not provided', () => {
    const { container } = render(<ExpeditionCard {...base} />)
    expect(container.querySelector('[role="img"]')).toBeInTheDocument()
  })

  it('renders img element when imageUrl is provided', () => {
    render(<ExpeditionCard {...base} imageUrl="/expedition.jpg" />)
    expect(screen.getByAltText(base.imageAlt)).toBeInTheDocument()
  })
})

describe('ExpeditionCard — narrow prop', () => {
  it('renders without crashing when narrow={true}', () => {
    render(<ExpeditionCard {...base} narrow />)
    expect(screen.getByText(base.title)).toBeInTheDocument()
  })

  it('renders without crashing when narrow={false}', () => {
    render(<ExpeditionCard {...base} narrow={false} />)
    expect(screen.getByText(base.title)).toBeInTheDocument()
  })
})

describe('ExpeditionCard — structure', () => {
  it('root element is <article>', () => {
    const { container } = render(<ExpeditionCard {...base} />)
    expect(container.firstChild?.nodeName).toBe('ARTICLE')
  })

  it('className prop is forwarded to the root element', () => {
    const { container } = render(<ExpeditionCard {...base} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })
})
