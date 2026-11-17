import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/auth/permissions'
import { buildWalksWhere } from '@/lib/admin/walksWhere'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const sp = req.nextUrl.searchParams
  const q        = (sp.get('q') ?? '').trim()
  const fromStr  = sp.get('from') ?? ''
  const toStr    = sp.get('to') ?? ''
  const statuses = sp.getAll('status')
  const guides   = sp.getAll('guide')

  const where = buildWalksWhere({ q, fromStr, toStr, statuses, guides })

  const walks = await prisma.walk.findMany({
    where,
    orderBy: { startsAt: 'desc' },
    include: {
      guide:       { select: { name: true } },
      ticketTypes: { orderBy: { sortOrder: 'asc' } },
    },
    take: 10_000,
  })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Прогулки')

  ws.columns = [
    { header: 'ID',             key: 'id',           width: 38 },
    { header: 'Slug',           key: 'slug',          width: 30 },
    { header: 'Статус',         key: 'status',        width: 12 },
    { header: 'Название',       key: 'title',         width: 40 },
    { header: 'Подзаголовок',   key: 'subtitle',      width: 40 },
    { header: 'Описание',       key: 'description',   width: 60 },
    { header: 'Начало',         key: 'startsAt',      width: 20 },
    { header: 'Окончание',      key: 'endsAt',        width: 20 },
    { header: 'Локация',        key: 'location',      width: 40 },
    { header: 'Гид',            key: 'guide',         width: 20 },
    { header: 'Цена (коп.)',    key: 'priceKopecks',  width: 14 },
    { header: 'Мест всего',     key: 'capacity',      width: 12 },
    { header: 'Обложка URL',    key: 'coverPhotoUrl', width: 50 },
    { header: 'Галерея URL',    key: 'galleryUrl',    width: 50 },
    { header: 'Тема письма',    key: 'emailSubject',  width: 40 },
    { header: 'Текст письма',   key: 'emailBody',     width: 60 },
    { header: 'Опубликовано',   key: 'publishedAt',   width: 20 },
    { header: 'Создано',        key: 'createdAt',     width: 20 },
    { header: 'Типы билетов',   key: 'ticketTypes',   width: 60 },
  ]

  ws.getRow(1).font = { bold: true }

  for (const w of walks) {
    ws.addRow({
      id:           w.id,
      slug:         w.slug,
      status:       w.status,
      title:        w.title,
      subtitle:     w.subtitle ?? '',
      description:  w.description,
      startsAt:     w.startsAt,
      endsAt:       w.endsAt ?? '',
      location:     w.location,
      guide:        w.guide.name,
      priceKopecks: w.priceKopecks,
      capacity:     w.capacity,
      coverPhotoUrl: w.coverPhotoUrl,
      galleryUrl:   w.galleryUrl ?? '',
      emailSubject: w.emailSubject ?? '',
      emailBody:    w.emailBody ?? '',
      publishedAt:  w.publishedAt ?? '',
      createdAt:    w.createdAt,
      ticketTypes:  w.ticketTypes.map(t =>
        `${t.name}: ${t.priceKopecks != null ? t.priceKopecks / 100 + '₽' : 'бесплатно'}, ${t.capacity} мест`
      ).join(' | '),
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const date   = new Date().toISOString().slice(0, 10)
  const b64    = Buffer.from(buffer as ArrayBuffer).toString('base64')

  return NextResponse.json({ b64, filename: `walks-${date}.xlsx` })
}
