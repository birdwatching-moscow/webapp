import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    walk: { findMany: vi.fn().mockResolvedValue([]) },
    expedition: { findMany: vi.fn().mockResolvedValue([]) },
  },
}))

import sitemap from '@/app/sitemap'

describe('sitemap — private page', () => {
  it('lists /private instead of the old /private-events', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(urls).toContain('https://birdwatching.moscow/private')
    expect(urls).not.toContain('https://birdwatching.moscow/private-events')
  })

  it('lists /private-parks instead of the merged /private-walks', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(urls).toContain('https://birdwatching.moscow/private-parks')
    expect(urls).not.toContain('https://birdwatching.moscow/private-walks')
  })
})
