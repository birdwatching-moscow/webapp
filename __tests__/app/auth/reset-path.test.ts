/* eslint-disable security/detect-non-literal-fs-filename -- paths are built from
   repo constants to check the app/ folder layout, never from user input */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROUTES, API_ROUTES } from '@/utils/routes'

// Only admins have passwords, so the reset flow lives under an unguessable
// segment. Folder names can't import constants, so these tests keep the
// constants and the file system in sync.

const ROOT = process.cwd()
const AUTH_GROUP = join(ROOT, 'app', '(site)', '(auth)')
const MIN_SEGMENT_LENGTH = 12

const secretSegment = () => ROUTES.resetPassword.split('/')[1]

describe('password reset lives under an unguessable path', () => {
  it('is no longer /reset-password', () => {
    expect(ROUTES.resetPassword).not.toBe('/reset-password')
  })

  it('starts with a random-looking segment of at least 12 characters', () => {
    expect(secretSegment()).toMatch(new RegExp(`^[a-z0-9]{${MIN_SEGMENT_LENGTH},}$`))
  })

  it('has the request and confirm pages where ROUTES.resetPassword points', () => {
    expect(existsSync(join(AUTH_GROUP, ROUTES.resetPassword, 'page.tsx'))).toBe(true)
    expect(existsSync(join(AUTH_GROUP, ROUTES.resetPassword, '[token]', 'page.tsx'))).toBe(true)
  })

  it('has the API routes where API_ROUTES points, under the same secret segment', () => {
    expect(API_ROUTES.auth.requestPasswordReset).toContain(secretSegment())
    expect(API_ROUTES.auth.resetPassword).toContain(secretSegment())
    expect(existsSync(join(ROOT, 'app', API_ROUTES.auth.requestPasswordReset, 'route.ts'))).toBe(true)
    expect(existsSync(join(ROOT, 'app', API_ROUTES.auth.resetPassword, 'route.ts'))).toBe(true)
  })

  it('removes the old guessable pages and API routes', () => {
    expect(existsSync(join(AUTH_GROUP, 'reset-password'))).toBe(false)
    expect(existsSync(join(ROOT, 'app', 'api', 'auth', 'request-password-reset'))).toBe(false)
    expect(existsSync(join(ROOT, 'app', 'api', 'auth', 'reset-password'))).toBe(false)
  })

  it('does not leak the secret segment through robots.ts or sitemap.ts', () => {
    for (const file of ['robots.ts', 'sitemap.ts']) {
      expect(readFileSync(join(ROOT, 'app', file), 'utf8')).not.toContain(secretSegment())
    }
  })
})
