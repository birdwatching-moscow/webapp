import type { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(private readonly page: Page) {
    this.emailInput = page.locator('input[name="email"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMessage = page.locator('[data-testid="form-error"], [class*="formError"], [class*="error"]').first()
  }

  async goto() {
    await this.page.goto('/login')
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async submit() {
    await this.submitButton.click()
  }

  async fillAndSubmit(email: string) {
    await this.enterEmail(email)
    await this.submit()
  }

  async heading(): Promise<string | null> {
    return this.page.locator('h1').first().textContent()
  }
}
