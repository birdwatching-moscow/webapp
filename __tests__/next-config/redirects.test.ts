import { describe, it, expect } from 'vitest'
import nextConfig from '@/next.config'

describe('next.config redirects', () => {
  it('/private-events permanently redirects to /private (page was renamed)', async () => {
    const redirects = await nextConfig.redirects?.()
    expect(redirects).toContainEqual({ source: '/private-events', destination: '/private', permanent: true })
  })
})
