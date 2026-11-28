import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/api/validate'
import { EventStatus, RequestStatus, RequestType } from '@/generated/prisma/client'
import { requestBodySchema } from '@/lib/validation/requests'
import { sendMail } from '@/lib/mail'
import { checkContactFormRateLimit } from '@/lib/rateLimit'
import {
  ADMIN_EMAIL,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_TOO_MANY_REQUESTS,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '@/lib/constants'
import { getClientIp } from '@/lib/clientIp'

const REQUEST_TYPE_LABEL: Record<string, string> = {
  EXPEDITION:    'Заявка на экспедицию',
  CERTIFICATE:   'Заявка на сертификат',
  QUESTION:      'Задать вопрос',
  PRIVATE_EVENT: 'Заявка на частное мероприятие',
}

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getClientIp(req)
  const rateLimit = checkContactFormRateLimit(ip)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: HTTP_STATUS_TOO_MANY_REQUESTS, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  // Honeypot: bots fill hidden fields; humans leave them empty
  const rawBody = await req.clone().json().catch(() => ({})) as Record<string, unknown>
  if (rawBody._hp) {
    return NextResponse.json({ id: 'ok' }, { status: HTTP_STATUS_CREATED })
  }

  const validation = await validateRequest(req, requestBodySchema)
  if (!validation.success) return validation.response

  const data = validation.data

  try {
    if (data.type === RequestType.EXPEDITION && data.expeditionId) {
      const expedition = await prisma.expedition.findUnique({
        where: { id: data.expeditionId },
        select: { id: true, status: true },
      })
      if (!expedition || expedition.status !== EventStatus.ACTIVE) {
        return NextResponse.json({ error: 'Expedition not found' }, { status: HTTP_STATUS_NOT_FOUND })
      }
    }

    const isWaitlist = data.type === RequestType.EXPEDITION && 'isWaitlist' in data && data.isWaitlist === true
    const request = await prisma.request.create({
      data: {
        type:        data.type,
        expeditionId: data.type === RequestType.EXPEDITION && 'expeditionId' in data ? (data.expeditionId ?? null) : null,
        name:        data.name,
        email:       data.email,
        message:     data.message ?? '',
        status:      isWaitlist ? RequestStatus.WAITLIST : RequestStatus.OPEN,
      },
    })

    sendMail({
      to: ADMIN_EMAIL,
      kind: 'contact-request',
      data: {
        label:   REQUEST_TYPE_LABEL[data.type] ?? data.type,
        name:    data.name,
        email:   data.email,
        message: data.message ?? '',
      },
    }).catch(err => console.error('contact-request mail failed', err))

    return NextResponse.json({ id: request.id }, { status: HTTP_STATUS_CREATED })
  } catch (err) {
    console.error('POST /api/requests failed', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR }
    )
  }
}
