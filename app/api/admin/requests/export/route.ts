import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/auth/permissions'
import { RequestStatus, RequestType } from '@/generated/prisma/client'

const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW:         'Новая',
  WAITLIST:    'Лист ожидания',
  OPEN:        'Открыта',
  IN_PROGRESS: 'В работе',
  CLOSED:      'Закрыта',
}

const TYPE_LABELS: Record<RequestType, string> = {
  PRIVATE_WALK:   'Личная прогулка',
  EXPEDITION:     'Экспедиция',
  CERTIFICATE:    'Сертификат',
  QUESTION:       'Вопрос',
  PRIVATE_EVENT:  'Частное мероприятие',
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const sp = req.nextUrl.searchParams
  const q        = (sp.get('q') ?? '').trim()
  const statuses = sp.getAll('status') as RequestStatus[]

  const where = buildRequestsWhere({ q, statuses })

  const requests = await prisma.request.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { expedition: { select: { title: true } } },
    take: 10_000,
  })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Заявки')

  ws.columns = [
    { header: 'ID',         key: 'id',         width: 38 },
    { header: 'Статус',     key: 'status',      width: 15 },
    { header: 'Тип',        key: 'type',        width: 20 },
    { header: 'Имя',        key: 'name',        width: 25 },
    { header: 'Email',      key: 'email',       width: 30 },
    { header: 'Экспедиция', key: 'expedition',  width: 40 },
    { header: 'Сообщение',  key: 'message',     width: 60 },
    { header: 'Дата',       key: 'createdAt',   width: 20 },
  ]

  ws.getRow(1).font = { bold: true }

  for (const r of requests) {
    ws.addRow({
      id:          r.id,
      status:      STATUS_LABELS[r.status] ?? r.status,
      type:        TYPE_LABELS[r.type] ?? r.type,
      name:        r.name,
      email:       r.email,
      expedition:  r.expedition?.title ?? '',
      message:     r.message,
      createdAt:   r.createdAt,
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const date   = new Date().toISOString().slice(0, 10)
  const b64    = Buffer.from(buffer as ArrayBuffer).toString('base64')

  return NextResponse.json({ b64, filename: `requests-${date}.xlsx` })
}

function buildRequestsWhere({ q, statuses }: { q: string; statuses: RequestStatus[] }) {
  const conditions: object[] = []
  if (q) {
    conditions.push({
      OR: [
        { name:  { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    })
  }
  if (statuses.length > 0) {
    conditions.push({ status: { in: statuses } })
  }
  return conditions.length > 0 ? { AND: conditions } : {}
}
