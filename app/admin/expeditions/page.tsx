import Link from 'next/link'
import { Prisma, EventStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { SORT_ASC } from '@/lib/constants'
import { ROUTES } from '@/utils/routes'
import { Button } from '@/components/ui/buttons/Button'
import { buildExpeditionsWhere } from '@/lib/admin/expeditionsWhere'
import { getStatusInfo, filtersToSearchParams, getPageSlots, type AllFilters } from '../_shared/listUtils'
import { WalksFilters } from '../walks/WalksFilters'
import { WalksTable, type WalkRow } from '../walks/WalksTable'
import styles from '../walks/walks.module.css'

const PAGE_SIZE = 20

type Tab = 'active' | 'draft' | 'all'

const TABS: { id: Tab; label: string }[] = [
  { id: 'active', label: 'Активные' },
  { id: 'draft',  label: 'Черновики' },
  { id: 'all',    label: 'Все' },
]

const EMPTY_LABEL: Record<Tab, string> = {
  active: 'Нет предстоящих экспедиций',
  draft:  'Нет черновиков',
  all:    'Нет экспедиций',
}

function tabHref(tab: Tab, page?: number) {
  const params = new URLSearchParams()
  if (tab !== 'active') params.set('tab', tab)
  if (page && page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${ROUTES.admin.expeditions}?${qs}` : ROUTES.admin.expeditions
}

function allTabHref(filters: AllFilters, page?: number) {
  const params = filtersToSearchParams(filters)
  params.set('tab', 'all')
  if (page && page > 1) params.set('page', String(page))
  return `${ROUTES.admin.expeditions}?${params.toString()}`
}

export default async function ExpeditionsPage({
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

  const whereClause: Prisma.ExpeditionWhereInput =
    activeTab === 'all' ? buildExpeditionsWhere({
      q, fromStr, toStr,
      statuses: selectedStatuses,
      guides: selectedGuides,
      now,
    }) :
    activeTab === 'active' ? { status: EventStatus.ACTIVE, startsAt: { gte: now } } :
    activeTab === 'draft'  ? { status: EventStatus.DRAFT } :
    { status: { not: 'DELETED' as const } }

  const orderByClause: { startsAt: 'asc' | 'desc' } =
    activeTab === 'all' ? { startsAt: 'desc' } : { startsAt: 'asc' }

  const [expeditions, total, draftCount, activeCount, allGuides] = await Promise.all([
    prisma.expedition.findMany({
      where: whereClause,
      select: {
        id:         true,
        title:      true,
        startsAt:   true,
        endsAt:     true,
        totalSpots: true,
        spotsLeft:  true,
        status:     true,
        createdBy:  true,
        updatedAt:  true,
        updatedBy:  true,
        guides:     { select: { name: true } },
      },
      orderBy: orderByClause,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.expedition.count({ where: whereClause }),
    prisma.expedition.count({ where: { status: EventStatus.DRAFT } }),
    prisma.expedition.count({ where: { status: EventStatus.ACTIVE, startsAt: { gte: now } } }),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: SORT_ASC }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const from = total === 0 ? 0 : skip + 1
  const to = skip + expeditions.length
  const showStatus = activeTab === 'all'

  const rows: WalkRow[] = expeditions.map(e => {
    const statusInfo = getStatusInfo(e.status)
    return {
      id:            e.id,
      title:         e.title,
      dateStr:       e.startsAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).replace(' г.', ''),
      timeStr:       e.startsAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      endsAtTimeStr: e.endsAt ? e.endsAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : null,
      guideName:     e.guides.map(g => g.name).join(', '),
      ticketCount:   e.totalSpots - e.spotsLeft,
      capacity:      e.totalSpots,
      statusLabel:   statusInfo.label,
      statusCls:     statusInfo.cls,
      createdBy:     e.createdBy,
      updatedAt:     e.updatedAt.toISOString(),
      updatedBy:     e.updatedBy,
    }
  })

  const pageHref = (p: number) =>
    activeTab === 'all' ? allTabHref(filters, p) : tabHref(activeTab, p)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Экспедиции</h1>
        <Button as="a" href={ROUTES.admin.expeditionsNew} size="sm">
          + Добавить экспедицию
        </Button>
      </div>

      <nav className={styles.tabs} aria-label="Фильтр экспедиций">
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
          basePath={ROUTES.admin.expeditions}
        />
      )}

      {expeditions.length === 0 ? (
        <p className={styles.empty}>{EMPTY_LABEL[activeTab]}</p>
      ) : (
        <>
          <WalksTable
            rows={rows}
            showStatus={showStatus}
            basePath={ROUTES.admin.expeditions}
            fromTab={activeTab}
          />

          {activeTab === 'all' && (
            <p className={styles.countLine}>
              {hasFilters
                ? `Показано ${expeditions.length} из ${total}`
                : `Всего ${total}`}{' '}
              {total === 1 ? 'экспедиция' : total >= 2 && total <= 4 ? 'экспедиции' : 'экспедиций'}
            </p>
          )}

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
