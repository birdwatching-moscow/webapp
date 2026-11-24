import type { Page, Locator } from '@playwright/test'

export class ExpeditionsPage {
  readonly cards: Locator
  readonly heading: Locator

  constructor(private readonly page: Page) {
    this.cards = page.locator('[data-testid="expedition-card"], [class*="card"]')
    this.heading = page.locator('h1').first()
  }

  async goto() {
    await this.page.goto('/expeditions')
  }

  async cardTitles(): Promise<string[]> {
    await this.cards.first().waitFor({ state: 'visible' })
    return this.cards.locator('h2, h3').allTextContents()
  }

  async cardCount(): Promise<number> {
    return this.cards.count()
  }
}
