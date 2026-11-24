import type { Page, Locator } from '@playwright/test'

export class ExpeditionsPage {
  readonly cards: Locator
  readonly heading: Locator
  readonly emptyState: Locator

  constructor(private readonly page: Page) {
    this.cards = page.locator('li[class*="gridItem"]')
    this.heading = page.locator('h1').first()
    this.emptyState = page.locator('text=скоро появятся')
  }

  async goto() {
    await this.page.goto('/expeditions')
  }

  async cardTitles(): Promise<string[]> {
    return this.cards.locator('h3').allTextContents()
  }

  async cardCount(): Promise<number> {
    return this.cards.count()
  }

  async hasContent(): Promise<boolean> {
    const count = await this.cards.count()
    if (count > 0) return true
    return this.emptyState.isVisible()
  }
}
