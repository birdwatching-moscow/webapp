import type { Page, Locator } from '@playwright/test'

export class ProfilePage {
  readonly heading: Locator

  constructor(private readonly page: Page) {
    this.heading = page.locator('h1').first()
  }

  async goto() {
    await this.page.goto('/profile')
  }

  async headingText(): Promise<string | null> {
    await this.heading.waitFor({ state: 'visible' })
    return this.heading.textContent()
  }

  async isRedirectedToLogin(): Promise<boolean> {
    await this.page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => null)
    return this.page.url().includes('/login')
  }
}
