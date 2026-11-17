import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { confirmResetSchema } from '@/lib/validation/auth'
import { generateChallengeToken, hashChallengeToken } from '@/lib/auth/challenge'
import { ADMIN_CHALLENGE_TTL_MS, BCRYPT_COST, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_INTERNAL_SERVER_ERROR } from '@/lib/constants'
import { validateRequest } from '@/lib/api/validate'
import { createLogger } from '@/lib/logger'

const log = createLogger('auth:password-reset')

// `code` lets the page show its own (Russian) message instead of this text.
const INVALID_LINK = { error: 'Invalid or expired link', code: 'invalid_link' }

export async function POST(req: Request) {
  const result = await validateRequest(req, confirmResetSchema)

  if (!result.success) {
    return result.response
  }

  const { token: rawToken, newPassword } = result.data
  let email: string

  try {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    })

    const now = new Date()

    if (
      !resetToken ||
      resetToken.usedAt !== null ||
      resetToken.expiresAt <= now
    ) {
      return NextResponse.json(INVALID_LINK, { status: HTTP_STATUS_BAD_REQUEST })
    }

    const user = await prisma.user.findFirst({
      where: {
        id: resetToken.userId,
        deletedAt: null,
      },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json(INVALID_LINK, { status: HTTP_STATUS_BAD_REQUEST })
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST)

    // Nested write — Prisma runs the password change and the token burn in a
    // single transaction, so a used token can never survive a changed password.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        // The forced ADMIN/SUPERADMIN rotation is satisfied by this reset
        passwordResetRequired: false,
        // Every session issued before this reset stops working (lib/auth/sessionGuard.ts)
        sessionVersion: { increment: 1 },
        passwordResetTokens: {
          update: {
            where: { id: resetToken.id },
            data: { usedAt: now },
          },
        },
      },
    })
    email = user.email
  } catch (err) {
    log.error('reset confirm failed', { err })
    return NextResponse.json({ error: 'Internal server error' }, { status: HTTP_STATUS_INTERNAL_SERVER_ERROR })
  }

  // The reset link proved control of the mailbox (same factor as the emailed
  // code) and the admin just typed the new password, so hand out the same
  // challenge the code step would — the page signs in without a second round.
  try {
    const challengeToken = generateChallengeToken()
    await prisma.adminLoginChallenge.create({
      data: {
        email,
        tokenHash: hashChallengeToken(challengeToken),
        expiresAt: new Date(Date.now() + ADMIN_CHALLENGE_TTL_MS),
      },
    })
    return NextResponse.json({ ok: true, email, challengeToken })
  } catch (err) {
    // The password is already changed — report success; the page falls back to /login
    log.error('post-reset challenge failed', { err })
    return NextResponse.json({ ok: true })
  }
}