'use client'

import { useState } from 'react'
import { RequestStatus, RequestType } from '@/generated/prisma/client'
import { Modal } from '@/components/ui/modal/Modal'
import { StatusPicker } from './StatusPicker'
import styles from './requests.module.css'

export type RequestRow = {
  id: string
  name: string
  email: string
  type: RequestType
  expeditionTitle: string | null
  message: string
  status: RequestStatus
  createdAt: string
}

const TYPE_LABELS: Record<RequestType, string> = {
  PRIVATE_WALK:  'Личная прогулка',
  EXPEDITION:    'Экспедиция',
  CERTIFICATE:   'Сертификат',
  QUESTION:      'Вопрос',
  PRIVATE_EVENT: 'Частное мероприятие',
}

const STATUS_INFO: Record<RequestStatus, { label: string; cls: string }> = {
  NEW:         { label: 'Новая',          cls: 'badgeNEW' },
  WAITLIST:    { label: 'Лист ожидания',  cls: 'badgeWAITLIST' },
  OPEN:        { label: 'Открыта',        cls: 'badgeOPEN' },
  IN_PROGRESS: { label: 'В работе',       cls: 'badgeIN_PROGRESS' },
  CLOSED:      { label: 'Закрыта',        cls: 'badgeCLOSED' },
}

interface Props {
  requests: RequestRow[]
}

export function RequestsTable({ requests }: Props) {
  const [active, setActive] = useState<RequestRow | null>(null)

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Тип</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr
                key={r.id}
                className={styles.tableRow}
                onClick={e => {
                  // don't open modal when clicking the status picker
                  if ((e.target as HTMLElement).closest('[data-status-picker]')) return
                  setActive(r)
                }}
              >
                <td className={styles.nameCell}>{r.name}</td>
                <td className={styles.emailCell}>{r.email}</td>
                <td>{TYPE_LABELS[r.type] ?? r.type}</td>
                <td onClick={e => e.stopPropagation()} data-status-picker="">
                  <StatusPicker id={r.id} status={r.status} />
                </td>
                <td className={styles.dateCell}>{r.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <Modal
          open
          onClose={() => setActive(null)}
          title={TYPE_LABELS[active.type] ?? active.type}
        >
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Имя</span>
              <span className={styles.detailValue}>{active.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <a href={`mailto:${active.email}`} className={styles.detailEmail}>{active.email}</a>
            </div>
            {active.expeditionTitle && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Экспедиция</span>
                <span className={styles.detailValue}>{active.expeditionTitle}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Статус</span>
              <span className={[styles.badge, styles[STATUS_INFO[active.status].cls as keyof typeof styles]].join(' ')}>
                {STATUS_INFO[active.status].label}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Дата</span>
              <span className={styles.detailValue}>{active.createdAt}</span>
            </div>
            <div className={styles.detailMessageRow}>
              <span className={styles.detailLabel}>Сообщение</span>
              <p className={styles.detailMessage}>{active.message}</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
