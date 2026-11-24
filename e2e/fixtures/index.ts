/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { ExpeditionsPage } from '../pages/ExpeditionsPage'
import { ProfilePage } from '../pages/ProfilePage'

type Fixtures = {
  loginPage: LoginPage
  expeditionsPage: ExpeditionsPage
  profilePage: ProfilePage
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },

  expeditionsPage: async ({ page }, use) => {
    await use(new ExpeditionsPage(page))
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page))
  },
})

export { expect }
