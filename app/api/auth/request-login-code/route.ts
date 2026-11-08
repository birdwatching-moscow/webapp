import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requestLoginCodeSchema } from '@/lib/validation/auth'
import { generateLoginCode, hashLoginCode } from '@/lib/login-code'
import { sendMail } from '@/lib/mail'
import { LOGIN_CODE_TTL_MS, HTTP_STATUS_TOO_MANY_REQUESTS } from '@/lib/constants'
import { validateRequest } from '@/lib/api/validate'
import { checkRateLimit, checkEmailCodeRateLimit } from '@/lib/rateLimit'
import { generateLoginCsrfToken } from '@/lib/auth/csrf'
import { trackEmailRequestPerIp } from '@/lib/monitoring'

// Byte-identical for unknown, privileged, blocked and soft-deleted accounts —
// anything else would turn this endpoint into an email-enumeration oracle.
const SAFE_RESPONSE = { ok: true }

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const rateLimit = await checkRateLimit(ip)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: HTTP_STATUS_TOO_MANY_REQUESTS, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const result = await validateRequest(req, requestLoginCodeSchema)
  if (!result.success) {
    return result.response
  }

  const { email } = result.data

  const emailRateLimit = checkEmailCodeRateLimit(email)
  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { error: 'code_rate_limited', retryAfterSeconds: emailRateLimit.retryAfterSeconds },
      { status: HTTP_STATUS_TOO_MANY_REQUESTS, headers: { 'Retry-After': String(emailRateLimit.retryAfterSeconds) } }
    )
  }

  trackEmailRequestPerIp(ip, email).catch((err) =>
    console.error('[monitoring] trackEmailRequestPerIp failed', err)
  )

  try {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    })

    if (user && !user.blockedAt) {
      // One active code per email, mirroring the password-reset invalidation
      await prisma.loginCode.deleteMany({
        where: { email, usedAt: null },
      })

      const code = generateLoginCode()

      if (process.env.NODE_ENV === 'development') {
        console.log(`[dev] login code for ${email}: ${code}`)
      }

      await prisma.loginCode.create({
        data: {
          email,
          codeHash: hashLoginCode(code),
          expiresAt: new Date(Date.now() + LOGIN_CODE_TTL_MS),
        },
      })

      await sendMail({
        to: email,
        kind: 'login-code',
        data: { code },
      })
    }
  } catch (err) {
    // Log but swallow — the anti-enumeration guarantee must hold even on
    // infrastructure failure; a 500 would reveal which emails have live accounts.
    console.error('POST /api/auth/request-login-code failed', err)
  }

  let csrfToken: string | undefined
  try {
    csrfToken = generateLoginCsrfToken(email)
  } catch (err) {
    console.error('[auth] csrf token generation failed', err)
  }

  return NextResponse.json({ ...SAFE_RESPONSE, csrfToken })
}
