import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/utils/routes'
import { Button } from '@/components/ui/buttons/Button'
import styles from './walks.module.css'

const PAGE_SIZE = 20

type Tab = 'active' | 'draft' | 'past' | 'cancelled' | 'all'

const TABS: { id: Tab; label: string }[] = [
  { id: 'active',    label: 'Активные' },
  { id: 'draft',     label: 'Черновики' },
  { id: 'past',      label: 'Прошедшие' },
  { id: 'cancelled', label: 'Отмененные' },
  { id: 'all',       label: 'Все' },
]

const EMPTY_LABEL: Record<Tab, string> = {
  active:    'Нет предстоящих прогулок',
  draft:     'Нет черновиков',
  past:      'Нет прошедших прогулок',
  cancelled: 'Нет отмененных прогулок',
  all:       'Нет прогулок',
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
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const { tab, page } = await searchParams
  const activeTab: Tab = (TABS.find(t => t.id === tab)?.id) ?? 'active'
  const pageNum = Math.max(1, parseInt(page ?? '1', 10))
  const skip = (pageNum - 1) * PAGE_SIZE
  const now = new Date()

  const whereClause =
    activeTab === 'active'    ? { status: 'ACTIVE' as const,              startsAt: { gte: now } } :
    activeTab === 'draft'     ? { status: 'DRAFT' as const } :
    activeTab === 'past'      ? { status: 'ACTIVE' as const,              startsAt: { lt: now } } :
    activeTab === 'cancelled' ? { status: 'CANCELLED' as const } :
                                { status: { not: 'DELETED' as const } }

  const orderByClause =
    activeTab === 'active' || activeTab === 'draft'
      ? { startsAt: 'asc' as const }
      : { startsAt: 'desc' as const }

  const [walks, total, draftCount] = await Promise.all([
    prisma.walk.findMany({
      where: whereClause,
      include: {
        _count: { select: { tickets: true } },
      },
      orderBy: orderByClause,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.walk.count({ where: whereClause }),
    activeTab !== 'draft'
      ? prisma.walk.count({ where: { status: 'DRAFT' } })
      : Promise.resolve(0),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const from = total === 0 ? 0 : skip + 1
  const to = skip + walks.length
  const showStatus = activeTab === 'all'

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
          const showDraftBadge = t.id === 'draft' && draftCount > 0 && !isActive
          return (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={[styles.tab, isActive ? styles.tabActive : ''].filter(Boolean).join(' ')}
            >
              {t.label}
              {showDraftBadge && (
                <span className={styles.tabCount}>{draftCount}</span>
              )}
            </Link>
          )
        })}
      </nav>

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
                  <th>Место</th>
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
                      <td className={styles.muted}>{w.location}</td>
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
                  href={tabHref(activeTab, pageNum - 1)}
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
                      href={tabHref(activeTab, slot)}
                      className={[styles.pageBtn, slot === pageNum ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      aria-label={`Страница ${slot}`}
                      aria-current={slot === pageNum ? 'page' : undefined}
                    >
                      {slot}
                    </Link>
                  )
                )}

                <Link
                  href={tabHref(activeTab, pageNum + 1)}
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
