import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/api/validate'
import { checkRateLimit } from '@/lib/rateLimit'
import { HTTP_STATUS_TOO_MANY_REQUESTS } from '@/lib/constants'

const checkEmailSchema = z.object({ email: z.string().email() })

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

  const result = await validateRequest(req, checkEmailSchema)
  if (!result.success) return result.response

  const { email } = result.data
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  })

  return NextResponse.json({ registered: !!user })
}
