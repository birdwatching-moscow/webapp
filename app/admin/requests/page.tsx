import Link from 'next/link'
import { RequestStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/utils/routes'
import { ExportButton } from '../walks/ExportButton'
import { RequestsFilters } from './RequestsFilters'
import { RequestsTable } from './RequestsTable'
import styles from './requests.module.css'

const PAGE_SIZE = 25

const VALID_STATUSES = new Set<string>(['NEW', 'WAITLIST', 'OPEN', 'IN_PROGRESS', 'CLOSED'])

function getPageSlots(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const slots: (number | null)[] = [1]
  if (current > 4) slots.push(null)
  const start = Math.max(2, current - 2)
  const end   = Math.min(total - 1, current + 2)
  for (let i = start; i <= end; i++) slots.push(i)
  if (current < total - 3) slots.push(null)
  slots.push(total)
  return slots
}

function buildWhere(q: string, statuses: RequestStatus[]) {
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

function pageHref(q: string, statuses: string[], page: number) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  statuses.forEach(s => params.append('status', s))
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${ROUTES.admin.requests}?${qs}` : ROUTES.admin.requests
}

function exportHref(q: string, statuses: string[]) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  statuses.forEach(s => params.append('status', s))
  const qs = params.toString()
  return qs ? `/api/admin/requests/export?${qs}` : '/api/admin/requests/export'
}

function plural(n: number) {
  if (n % 100 >= 11 && n % 100 <= 14) return 'заявок'
  const r = n % 10
  if (r === 1) return 'заявка'
  if (r >= 2 && r <= 4) return 'заявки'
  return 'заявок'
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string | string[]; page?: string }>
}) {
  const { q: qParam, status: statusParam, page: pageParam } = await searchParams

  const q = (qParam ?? '').trim()
  const selectedStatuses: RequestStatus[] = (() => {
    const raw = Array.isArray(statusParam) ? statusParam : statusParam ? [statusParam] : []
    return raw.filter(s => VALID_STATUSES.has(s)) as RequestStatus[]
  })()

  const pageNum = Math.max(1, parseInt(pageParam ?? '1', 10))
  const skip    = (pageNum - 1) * PAGE_SIZE
  const hasFilters = q !== '' || selectedStatuses.length > 0

  const where = buildWhere(q, selectedStatuses)

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      include: { expedition: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.request.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const fromNum    = total === 0 ? 0 : skip + 1
  const toNum      = skip + requests.length

  const rows = requests.map(r => ({
    id:              r.id,
    name:            r.name,
    email:           r.email,
    type:            r.type,
    expeditionTitle: r.expedition?.title ?? null,
    message:         r.message,
    status:          r.status,
    createdAt:       r.createdAt.toLocaleString('ru-RU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Moscow',
    }).replace(' г.', ''),
  }))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Заявки</h1>
      </div>

      <div className={styles.toolbar}>
        <RequestsFilters initial={{ q, statuses: selectedStatuses }} />
        <div className={styles.toolbarActions}>
          <ExportButton
            href={exportHref(q, selectedStatuses)}
            className={styles.exportBtn}
          />
        </div>
      </div>

      {requests.length === 0 ? (
        <p className={styles.empty}>Нет заявок</p>
      ) : (
        <>
          <RequestsTable requests={rows} />

          <p className={styles.countLine}>
            {hasFilters
              ? `Показано ${fromNum}–${toNum} из ${total}`
              : `Всего ${total}`}{' '}
            {plural(total)}
          </p>

          {totalPages > 1 && (
            <div className={styles.paginationBar}>
              <span className={styles.paginationInfo}>
                {fromNum}–{toNum} из {total}
              </span>
              <div className={styles.paginationPages}>
                <Link
                  href={pageHref(q, selectedStatuses, pageNum - 1)}
                  className={[styles.pageBtn, pageNum <= 1 ? styles.pageBtnDisabled : ''].filter(Boolean).join(' ')}
                  aria-label="Предыдущая страница"
                >
                  ←
                </Link>
                {getPageSlots(pageNum, totalPages).map((slot, i) =>
                  slot === null ? (
                    <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>…</span>
                  ) : (
                    <Link
                      key={slot}
                      href={pageHref(q, selectedStatuses, slot)}
                      className={[styles.pageBtn, slot === pageNum ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      aria-label={`Страница ${slot}`}
                      aria-current={slot === pageNum ? 'page' : undefined}
                    >
                      {slot}
                    </Link>
                  )
                )}
                <Link
                  href={pageHref(q, selectedStatuses, pageNum + 1)}
                  className={[styles.pageBtn, pageNum >= totalPages ? styles.pageBtnDisabled : ''].filter(Boolean).join(' ')}
                  aria-label="Следующая страница"
                >
                  →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
