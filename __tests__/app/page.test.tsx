import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/walks', () => ({ getActiveWalks: vi.fn(() => Promise.resolve([])) }))
vi.mock('@/lib/expeditions', () => ({ getActiveExpeditions: vi.fn(() => Promise.resolve([])) }))
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))
vi.mock('@/lib/footer-birds', () => ({
  getRandomBirdSrc: vi.fn(() => ({ src: '/footer-birds/kingfisher.jpg', name: 'Kingfisher' })),
}))

import Home from '@/app/(site)/page'

describe('Home page', () => {
  it('renders without errors', async () => {
    render(await Home())
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the media section', async () => {
    render(await Home())
    expect(screen.getByTestId('home-media')).toBeInTheDocument()
  })

  it('does not render Админка link', async () => {
    const { container } = render(await Home())
    expect(container.querySelector('a[href="/admin/walks"]')).toBeNull()
  })
})
