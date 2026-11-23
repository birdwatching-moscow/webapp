'use client'

import { useRouter } from 'next/navigation'
import styles from './walks.module.css'

export type WalkRow = {
  id: string
  title: string
  dateStr: string
  timeStr: string
  endsAtTimeStr: string | null
  guideName: string
  ticketCount: number
  capacity: number
  statusLabel: string
  statusCls: string
  createdBy: string | null
  updatedAt: string | null
  updatedBy: string | null
}

interface Props {
  rows: WalkRow[]
  showStatus: boolean
  basePath?: string
  fromTab?: string
}

function formatUpdatedAt(iso: string, timeZone: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone,
  })
}

export function WalksTable({ rows, showStatus, basePath = '/admin/walks', fromTab }: Props) {
  const router = useRouter()
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Название</th>
            <th>Дата и время</th>
            <th>Гид</th>
            <th>Билеты</th>
            {showStatus && <th>Статус</th>}
            <th>Автор</th>
            <th>Последнее редактирование</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(w => (
            <tr
              key={w.id}
              className={styles.tableRow}
              onClick={e => {
                if ((e.target as HTMLElement).closest('a')) return
                router.push(`${basePath}/${w.id}${fromTab ? `?from=${fromTab}` : ''}`)
              }}
            >
              <td className={styles.nameLink}>{w.title}</td>
              <td>
                <div className={styles.dateCell}>
                  <span>{w.dateStr}</span>
                  <span className={styles.dateTime}>
                    {w.timeStr}{w.endsAtTimeStr && ` – ${w.endsAtTimeStr}`}
                  </span>
                </div>
              </td>
              <td className={styles.muted}>{w.guideName}</td>
              <td className={styles.tickets}>{w.ticketCount} / {w.capacity}</td>
              {showStatus && (
                <td>
                  <span className={[styles.badge, styles[w.statusCls as keyof typeof styles]].join(' ')}>
                    {w.statusLabel}
                  </span>
                </td>
              )}
              <td className={styles.muted}>{w.createdBy ?? '—'}</td>
              <td>
                {w.updatedAt ? (
                  <div className={styles.dateCell}>
                    <span className={styles.muted}>{w.updatedBy ?? '—'}</span>
                    <span className={styles.dateTime}>{formatUpdatedAt(w.updatedAt, userTz)}</span>
                  </div>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
