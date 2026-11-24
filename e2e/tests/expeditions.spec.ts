import { test, expect } from '../fixtures'

test.describe('Expeditions page', () => {
  test('shows the page heading', async ({ expeditionsPage }) => {
    await expeditionsPage.goto()
    await expect(expeditionsPage.heading).toBeVisible()
  })

  test('shows cards or empty state', async ({ expeditionsPage }) => {
    await expeditionsPage.goto()
    const hasContent = await expeditionsPage.hasContent()
    expect(hasContent).toBe(true)
  })

  test('expedition cards have non-empty titles when present', async ({ expeditionsPage }) => {
    await expeditionsPage.goto()
    const count = await expeditionsPage.cardCount()
    if (count === 0) {
      test.skip(true, 'No expeditions in DB — skipping card title check')
      return
    }
    const titles = await expeditionsPage.cardTitles()
    titles.forEach(title => expect(title.trim()).not.toBe(''))
  })
})
