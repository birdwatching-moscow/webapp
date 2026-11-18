import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation/auth'
import { sendMail } from '@/lib/mail'
import { validateRequest } from '@/lib/api/validate'
import { generateLoginCode, hashLoginCode } from '@/lib/login-code'
import { generateLoginCsrfToken } from '@/lib/auth/csrf'
import { checkRateLimit, checkEmailCodeRateLimit } from '@/lib/rateLimit'
import { LOGIN_CODE_TTL_MS, HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_TOO_MANY_REQUESTS } from '@/lib/constants'
import { getClientIp } from '@/lib/clientIp'

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const rateLimit = await checkRateLimit(ip, 'sendCode')
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: HTTP_STATUS_TOO_MANY_REQUESTS, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const result = await validateRequest(req, registerSchema)
  if (!result.success) return result.response

  const { email, name } = result.data

  const emailRateLimit = checkEmailCodeRateLimit(email)
  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { error: 'code_rate_limited', retryAfterSeconds: emailRateLimit.retryAfterSeconds },
      { status: HTTP_STATUS_TOO_MANY_REQUESTS, headers: { 'Retry-After': String(emailRateLimit.retryAfterSeconds) } }
    )
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    })

    // Every branch returns the same response, so the form never reveals
    // whether an email is registered.
    if (existing && existing.role !== 'USER') {
      // Admins sign in with a password on /login — /register has no password step.
      const loginUrl = `${process.env.NEXTAUTH_URL ?? ''}/login`
      await sendMail({ to: email, kind: 'already-registered', data: { loginUrl } })
    } else if (existing?.blockedAt) {
      // Same as /login: a blocked account gets no code.
    } else {
      // New email → registration code. Existing USER → a login code; the
      // stored name is kept (verify-registration-code won't overwrite it).
      await prisma.loginCode.deleteMany({ where: { email, usedAt: null } })

      const code = generateLoginCode()
      await prisma.loginCode.create({
        data: {
          email,
          codeHash: hashLoginCode(code),
          expiresAt: new Date(Date.now() + LOGIN_CODE_TTL_MS),
        },
      })

      if (process.env.NODE_ENV === 'development') {
        console.log(`[dev] registration code for ${email}: ${code}`)
      }

      await sendMail({ to: email, kind: 'login-code', data: { code, name: existing?.name ?? name } })
    }
  } catch (err) {
    console.error('POST /api/auth/register failed', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: HTTP_STATUS_INTERNAL_SERVER_ERROR })
  }

  let csrfToken: string | undefined
  try {
    csrfToken = generateLoginCsrfToken(email)
  } catch (err) {
    console.error('[auth] csrf token generation failed', err)
  }

  return NextResponse.json({ ok: true, csrfToken })
}
