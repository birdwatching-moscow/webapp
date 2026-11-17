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
}

interface Props {
  rows: WalkRow[]
  showStatus: boolean
}

export function WalksTable({ rows, showStatus }: Props) {
  const router = useRouter()

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
          </tr>
        </thead>
        <tbody>
          {rows.map(w => (
            <tr
              key={w.id}
              className={styles.tableRow}
              onClick={e => {
                if ((e.target as HTMLElement).closest('a')) return
                router.push(`/admin/walks/${w.id}`)
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
