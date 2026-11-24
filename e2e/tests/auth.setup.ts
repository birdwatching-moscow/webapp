import { test as setup, expect } from '@playwright/test'
import { encode } from 'next-auth/jwt'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '../.auth/user.json')

const E2E_USER_ID = process.env.E2E_USER_ID
const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL
const AUTH_SECRET = process.env.AUTH_SECRET
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

setup('authenticate as test user', async ({ page }) => {
  if (!E2E_USER_ID || !E2E_USER_EMAIL || !AUTH_SECRET) {
    throw new Error(
      'Missing required env vars: E2E_USER_ID, E2E_USER_EMAIL, AUTH_SECRET',
    )
  }

  const isSecure = BASE_URL.startsWith('https')
  const cookieName = isSecure
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const token = await encode({
    token: { sub: E2E_USER_ID, email: E2E_USER_EMAIL },
    secret: AUTH_SECRET,
    salt: cookieName,
  })

  const url = new URL(BASE_URL)

  await page.context().addCookies([
    {
      name: cookieName,
      value: token,
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'Lax',
    },
  ])

  // Verify the session works before saving
  await page.goto('/profile')
  await expect(page).not.toHaveURL(/\/login/)

  await page.context().storageState({ path: AUTH_FILE })
})
