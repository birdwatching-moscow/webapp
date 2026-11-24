import { test, expect } from '../fixtures'

test.describe('Profile page', () => {
  test('authenticated user can access profile', async ({ profilePage }) => {
    await profilePage.goto()
    const heading = await profilePage.headingText()
    expect(heading).not.toBeNull()
  })

  test('authenticated user is not redirected to login', async ({ profilePage }) => {
    await profilePage.goto()
    const redirected = await profilePage.isRedirectedToLogin()
    expect(redirected).toBe(false)
  })
})
