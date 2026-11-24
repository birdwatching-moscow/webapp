import { test, expect } from '../fixtures'

test.describe('Expeditions page', () => {
  test('shows the page heading', async ({ expeditionsPage }) => {
    await expeditionsPage.goto()
    await expect(expeditionsPage.heading).toBeVisible()
  })

  test('shows at least one expedition card', async ({ expeditionsPage }) => {
    await expeditionsPage.goto()
    const count = await expeditionsPage.cardCount()
    expect(count).toBeGreaterThan(0)
  })

  test('expedition cards have titles', async ({ expeditionsPage }) => {
    await expeditionsPage.goto()
    const titles = await expeditionsPage.cardTitles()
    expect(titles.length).toBeGreaterThan(0)
    titles.forEach(title => expect(title.trim()).not.toBe(''))
  })
})
