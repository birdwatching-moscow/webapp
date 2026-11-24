import { test, expect } from '../../fixtures'
import {
  CheckEmailResponseSchema,
  ErrorResponseSchema,
  RateLimitErrorSchema,
} from '../../schemas/api.schemas'

const ENDPOINT = '/api/auth/check-email'

test.describe('POST /api/auth/check-email', () => {
  test('returns { registered: true } for existing email', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: { email: process.env.E2E_USER_EMAIL },
    })

    expect(res.status()).toBe(200)

    const result = CheckEmailResponseSchema.safeParse(await res.json())
    expect(result.success, 'Response does not match schema').toBe(true)
    expect(result.data?.registered).toBe(true)
  })

  test('returns { registered: false } for unknown email', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: { email: 'does-not-exist@example.com' },
    })

    expect(res.status()).toBe(200)

    const result = CheckEmailResponseSchema.safeParse(await res.json())
    expect(result.success, 'Response does not match schema').toBe(true)
    expect(result.data?.registered).toBe(false)
  })

  test('returns 400 for invalid email', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: { email: 'not-an-email' },
    })

    expect(res.status()).toBe(400)

    const result = ErrorResponseSchema.safeParse(await res.json())
    expect(result.success, 'Error response does not match schema').toBe(true)
  })

  test('returns 400 for missing body', async ({ request }) => {
    const res = await request.post(ENDPOINT, { data: {} })

    expect(res.status()).toBe(400)

    const result = ErrorResponseSchema.safeParse(await res.json())
    expect(result.success, 'Error response does not match schema').toBe(true)
  })

  test('response shape is valid on 429 rate limit', async ({ request }) => {
    // Fire enough requests to trigger rate limiting
    let rateLimitRes: Awaited<ReturnType<typeof request.post>> | null = null
    for (let i = 0; i < 20; i++) {
      const res = await request.post(ENDPOINT, {
        data: { email: `probe${i}@example.com` },
      })
      if (res.status() === 429) {
        rateLimitRes = res
        break
      }
    }

    if (!rateLimitRes) {
      test.skip(true, 'Rate limit not triggered in this run')
      return
    }

    const result = RateLimitErrorSchema.safeParse(await rateLimitRes.json())
    expect(result.success, 'Rate limit response does not match schema').toBe(true)
    expect(rateLimitRes.headers()['retry-after']).toBeDefined()
  })
})
