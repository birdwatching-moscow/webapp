import Link from 'next/link'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/utils/routes'
import { Button } from '@/components/ui/buttons/Button'
import { WalksFilters } from './WalksFilters'
import styles from './walks.module.css'

const PAGE_SIZE = 20

type Tab = 'active' | 'draft' | 'all'

const TABS: { id: Tab; label: string }[] = [
  { id: 'active', label: 'Активные' },
  { id: 'draft',  label: 'Черновики' },
  { id: 'all',    label: 'Все' },
]

const EMPTY_LABEL: Record<Tab, string> = {
  active: 'Нет предстоящих прогулок',
  draft:  'Нет черновиков',
  all:    'Нет прогулок',
}

type StatusKey = 'ACTIVE' | 'DRAFT' | 'CANCELLED' | 'PAST'

const STATUS_INFO: Record<StatusKey, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Активна',   cls: 'badgeACTIVE' },
  DRAFT:     { label: 'Черновик',  cls: 'badgeDRAFT' },
  CANCELLED: { label: 'Отменена',  cls: 'badgeCANCELLED' },
  PAST:      { label: 'Прошла',    cls: 'badgePAST' },
}


function getStatusInfo(status: string, startsAt: Date, now: Date) {
  if (status === 'ACTIVE' && startsAt < now) return STATUS_INFO.PAST
  return STATUS_INFO[status as StatusKey] ?? { label: status, cls: 'badgeACTIVE' }
}

function tabHref(tab: Tab, page?: number) {
  const params = new URLSearchParams()
  if (tab !== 'active') params.set('tab', tab)
  if (page && page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${ROUTES.admin.walks}?${qs}` : ROUTES.admin.walks
}

type AllFilters = { q: string; from: string; to: string; statuses: string[]; guides: string[] }

function allTabHref(filters: AllFilters, page?: number) {
  const params = new URLSearchParams()
  params.set('tab', 'all')
  if (filters.q) params.set('q', filters.q)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  filters.statuses.forEach(s => params.append('status', s))
  filters.guides.forEach(g => params.append('guide', g))
  if (page && page > 1) params.set('page', String(page))
  return `${ROUTES.admin.walks}?${params.toString()}`
}

function getPageSlots(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const slots: (number | null)[] = [1]
  if (current > 4) slots.push(null)

  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  for (let i = start; i <= end; i++) slots.push(i)

  if (current < total - 3) slots.push(null)
  slots.push(total)

  return slots
}

export default async function WalksPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    page?: string
    q?: string
    from?: string
    to?: string
    status?: string | string[]
    guide?: string | string[]
  }>
}) {
  const { tab, page, q: qParam, from: fromParam, to: toParam, status: statusParam, guide: guideParam } = await searchParams
  const activeTab: Tab = (TABS.find(t => t.id === tab)?.id) ?? 'active'
  const pageNum = Math.max(1, parseInt(page ?? '1', 10))
  const skip = (pageNum - 1) * PAGE_SIZE
  const now = new Date()

  // Filter state — only used on 'all' tab
  const q = activeTab === 'all' ? (qParam ?? '').trim() : ''
  const fromStr = activeTab === 'all' ? (fromParam ?? '') : ''
  const toStr = activeTab === 'all' ? (toParam ?? '') : ''
  const selectedStatuses: string[] = activeTab === 'all'
    ? (Array.isArray(statusParam) ? statusParam : statusParam ? [statusParam] : [])
    : []
  const selectedGuides: string[] = activeTab === 'all'
    ? (Array.isArray(guideParam) ? guideParam : guideParam ? [guideParam] : [])
    : []
  const filters: AllFilters = { q, from: fromStr, to: toStr, statuses: selectedStatuses, guides: selectedGuides }
  const hasFilters = q !== '' || fromStr !== '' || toStr !== '' || selectedStatuses.length > 0 || selectedGuides.length > 0

  // Build where clause
  let whereClause: Prisma.WalkWhereInput
  if (activeTab === 'all') {
    const and: Prisma.WalkWhereInput[] = []

    if (q) and.push({ title: { contains: q, mode: 'insensitive' } })
    if (fromStr) and.push({ startsAt: { gte: new Date(fromStr) } })
    if (toStr) and.push({ startsAt: { lte: new Date(toStr + 'T23:59:59') } })

    if (selectedStatuses.length > 0) {
      const statusOr: Prisma.WalkWhereInput[] = []
      for (const s of selectedStatuses) {
        if (s === 'active')    statusOr.push({ status: 'ACTIVE', startsAt: { gte: now } })
        if (s === 'past')      statusOr.push({ status: 'ACTIVE', startsAt: { lt:  now } })
        if (s === 'draft')     statusOr.push({ status: 'DRAFT' })
        if (s === 'cancelled') statusOr.push({ status: 'CANCELLED' })
      }
      and.push({ OR: statusOr })
    } else {
      and.push({ status: { not: 'DELETED' as const } })
    }

    if (selectedGuides.length > 0) {
      and.push({ guideId: { in: selectedGuides.map(Number) } })
    }

    whereClause = and.length === 1 ? and[0] : { AND: and }
  } else {
    whereClause =
      activeTab === 'active' ? { status: 'ACTIVE', startsAt: { gte: now } } :
      activeTab === 'draft'  ? { status: 'DRAFT' } :
      { status: { not: 'DELETED' as const } }
  }

  const orderByClause: { startsAt: 'asc' | 'desc' } =
    activeTab === 'all' ? { startsAt: 'desc' } : { startsAt: 'asc' }

  const [walks, total, draftCount, activeCount, allGuides] = await Promise.all([
    prisma.walk.findMany({
      where: whereClause,
      include: {
        _count: { select: { tickets: true } },
        guide: { select: { name: true } },
      },
      orderBy: orderByClause,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.walk.count({ where: whereClause }),
    prisma.walk.count({ where: { status: 'DRAFT' } }),
    prisma.walk.count({ where: { status: 'ACTIVE', startsAt: { gte: now } } }),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const from = total === 0 ? 0 : skip + 1
  const to = skip + walks.length
  const showStatus = activeTab === 'all'

  const pageHref = (p: number) =>
    activeTab === 'all' ? allTabHref(filters, p) : tabHref(activeTab, p)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Прогулки</h1>
        <Button as="a" href={ROUTES.admin.walksNew} size="sm">
          + Добавить прогулку
        </Button>
      </div>

      <nav className={styles.tabs} aria-label="Фильтр прогулок">
        {TABS.map(t => {
          const isActive = activeTab === t.id
          const badgeCount =
            t.id === 'draft'  ? draftCount :
            t.id === 'active' ? activeCount :
            0
          return (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={[styles.tab, isActive ? styles.tabActive : ''].filter(Boolean).join(' ')}
            >
              {t.label}
              {badgeCount > 0 && (
                <span className={styles.tabCount}>{badgeCount}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {activeTab === 'all' && (
        <WalksFilters
          guides={allGuides}
          initial={filters}
        />
      )}

      {walks.length === 0 ? (
        <p className={styles.empty}>{EMPTY_LABEL[activeTab]}</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Дата и время</th>
                  <th>Гид</th>
                  <th>Билеты</th>
                  {showStatus && <th>Статус</th>}
                </tr>
              </thead>
              <tbody>
                {walks.map(w => {
                  const statusInfo = getStatusInfo(w.status, w.startsAt, now)
                  return (
                    <tr key={w.id}>
                      <td>
                        <Link href={`/admin/walks/${w.id}`} className={styles.nameLink}>
                          {w.title}
                        </Link>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <span>{w.startsAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).replace(' г.', '')}</span>
                          <span className={styles.dateTime}>
                            {w.startsAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            {w.endsAt && ` – ${w.endsAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>
                      </td>
                      <td className={styles.muted}>{w.guide.name}</td>
                      <td className={styles.tickets}>
                        {w._count.tickets} / {w.capacity}
                      </td>
                      {showStatus && (
                        <td>
                          <span className={[styles.badge, styles[statusInfo.cls as keyof typeof styles]].join(' ')}>
                            {statusInfo.label}
                          </span>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationBar}>
              <span className={styles.paginationInfo}>
                {from}–{to} из {total}
              </span>
              <div className={styles.paginationPages}>
                <Link
                  href={pageHref(pageNum - 1)}
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
                      href={pageHref(slot)}
                      className={[styles.pageBtn, slot === pageNum ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      aria-label={`Страница ${slot}`}
                      aria-current={slot === pageNum ? 'page' : undefined}
                    >
                      {slot}
                    </Link>
                  )
                )}

                <Link
                  href={pageHref(pageNum + 1)}
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
