'use client'

import { useEffect, useState, useTransition } from 'react'
import { getWalkTickets, deleteTicket, exportWalkParticipants, type WalkTicketRow } from '@/app/admin/walks/_actions'
import { Modal } from '@/components/ui/modal/Modal'
import { Button } from '@/components/ui/buttons/Button'
import ticketStyles from './walk-tickets-tab.module.css'

const ORDER_STATUS_LABELS: Record<string, string> = {
  PAID:              'Оплачен',
  PENDING:           'Ожидает',
  AWAITING_PAYMENT:  'Ожидает оплаты',
  FAILED:            'Ошибка',
  EXPIRED:           'Истёк',
}

const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatPrice(kopecks: number | null) {
  if (kopecks == null) return '—'
  if (kopecks === 0) return 'Бесплатно'
  return `${(kopecks / 100).toLocaleString('ru-RU')} ₽`
}

interface Props {
  walkId: string
}

export function WalkTicketsTab({ walkId }: Props) {
  const [tickets, setTickets] = useState<WalkTicketRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, startLoad] = useTransition()

  const [pendingDelete, setPendingDelete] = useState<WalkTicketRow | null>(null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [exporting, startExport] = useTransition()

  function load() {
    startLoad(async () => {
      try {
        const rows = await getWalkTickets(walkId)
        setTickets(rows)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      }
    })
  }

  useEffect(() => { load() }, [walkId])

  function confirmDelete() {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setDeleteError(null)
    startDelete(async () => {
      try {
        await deleteTicket(id)
        setTickets(prev => prev ? prev.filter(t => t.id !== id) : prev)
        setPendingDelete(null)
      } catch (e) {
        setDeleteError(e instanceof Error ? e.message : 'Ошибка удаления')
      }
    })
  }

  function handleExport() {
    startExport(async () => {
      try {
        const { b64, filename } = await exportWalkParticipants(walkId)
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
        const blob = new Blob([bytes], { type: MIME })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка экспорта')
      }
    })
  }

  const paidCount = tickets?.filter(t => t.orderStatus === 'PAID').length ?? 0

  if (loading || tickets === null) {
    return (
      <div className={ticketStyles.state}>
        {error ? (
          <span className={ticketStyles.stateError}>{error}</span>
        ) : (
          <span className={ticketStyles.stateMuted}>Загрузка…</span>
        )}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className={ticketStyles.state}>
        <span className={ticketStyles.stateMuted}>Билетов пока нет</span>
      </div>
    )
  }

  return (
    <div className={ticketStyles.root}>
      <div className={ticketStyles.header}>
        <p className={ticketStyles.summary}>
          Всего билетов: <strong>{tickets.length}</strong>
          {' · '}
          Оплачено: <strong>{paidCount}</strong>
        </p>
        <button
          type="button"
          className={ticketStyles.exportBtn}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Загрузка…' : 'Скачать Excel'}
        </button>
      </div>

      {error && <p className={ticketStyles.stateError}>{error}</p>}

      <div className={ticketStyles.tableWrap}>
        <table className={ticketStyles.table}>
          <thead>
            <tr>
              <th className={ticketStyles.th}>Участник</th>
              <th className={ticketStyles.th}>Email</th>
              <th className={ticketStyles.th}>Статус</th>
              <th className={ticketStyles.th}>Сумма</th>
              <th className={ticketStyles.th}>Дата покупки</th>
              <th className={ticketStyles.th}>Бинокль</th>
              <th className={ticketStyles.th}></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className={ticketStyles.tr}>
                <td className={ticketStyles.td}>{t.userName}</td>
                <td className={ticketStyles.td}>
                  <a href={`mailto:${t.userEmail}`} className={ticketStyles.email}>{t.userEmail}</a>
                </td>
                <td className={ticketStyles.td}>
                  <span className={[ticketStyles.statusBadge, ticketStyles[`status_${t.orderStatus}`]].filter(Boolean).join(' ')}>
                    {ORDER_STATUS_LABELS[t.orderStatus] ?? t.orderStatus}
                  </span>
                </td>
                <td className={ticketStyles.td}>{formatPrice(t.unitPriceKopecks)}</td>
                <td className={ticketStyles.td}>{formatDate(t.paidAt ?? t.createdAt)}</td>
                <td className={ticketStyles.td}>
                  {t.hasBinoculars == null ? '—' : t.hasBinoculars ? 'Да' : 'Нет'}
                </td>
                <td className={ticketStyles.tdAction}>
                  <button
                    type="button"
                    className={ticketStyles.deleteBtn}
                    onClick={() => { setDeleteError(null); setPendingDelete(t) }}
                    title="Удалить билет"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={pendingDelete !== null}
        onClose={() => { if (!deleting) { setPendingDelete(null); setDeleteError(null) } }}
        title="Удалить билет?"
        footer={
          <div className={ticketStyles.modalFooter}>
            <Button fullWidth variant="secondary" onClick={() => { setPendingDelete(null); setDeleteError(null) }} disabled={deleting}>
              Назад
            </Button>
            <Button fullWidth variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? '…' : 'Удалить'}
            </Button>
          </div>
        }
      >
        <p className={ticketStyles.modalText}>
          Билет участника <strong>{pendingDelete?.userName}</strong> ({pendingDelete?.userEmail}) будет удалён без возможности восстановления.
        </p>
        {deleteError && <p className={ticketStyles.stateError} style={{ marginTop: '0.5rem' }}>{deleteError}</p>}
      </Modal>
    </div>
  )
}
