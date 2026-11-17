import type { JWT } from 'next-auth/jwt'
import type { Role } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const log = createLogger('auth:session-guard')

const ADMIN_ROLES: readonly Role[] = ['ADMIN', 'SUPERADMIN']

/** Tokens minted before the `sessionVersion` column existed carry no claim. */
const LEGACY_SESSION_VERSION = 0

const isAdminRole = (role: Role): boolean => ADMIN_ROLES.includes(role)

/**
 * Sessions are JWTs, so nothing server-side can be deleted to sign one out.
 * Instead every admin request re-reads the account: a password reset or block
 * bumps `sessionVersion`, and any token carrying an older value is rejected.
 *
 * Returns the (possibly role-refreshed) token, or `null` to end the session —
 * Auth.js then clears the cookie and `auth()` yields `null`.
 * USER tokens are not checked (passwordless, nothing to revoke here).
 */
export async function validateAdminToken(token: JWT): Promise<JWT | null> {
  if (!isAdminRole(token.role)) return token
  if (!token.id) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: { sessionVersion: true, blockedAt: true, deletedAt: true, role: true },
    })

    if (
      !user ||
      user.blockedAt !== null ||
      user.deletedAt !== null ||
      !isAdminRole(user.role) ||
      user.sessionVersion !== (token.sessionVersion ?? LEGACY_SESSION_VERSION)
    ) {
      return null
    }

    // A SUPERADMIN demoted to ADMIN loses the extra rights on the next request
    return user.role === token.role ? token : { ...token, role: user.role }
  } catch (err) {
    // Fail closed: this check is the only thing enforcing reset / block
    log.error('session check failed, signing the admin out', { err })
    return null
  }
}
