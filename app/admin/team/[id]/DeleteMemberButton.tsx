'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTeamMember } from '../_actions'
import { Modal } from '@/components/ui/modal/Modal'
import { Button } from '@/components/ui/buttons/Button'
import styles from './member-edit.module.css'

interface Props {
  memberId: number
  memberName: string
}

export function DeleteMemberButton({ memberId, memberName }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, startDeleting] = useTransition()
  const router = useRouter()

  function confirm() {
    setError(null)
    startDeleting(async () => {
      try {
        await deleteTeamMember(memberId)
        router.push('/admin/team')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при удалении')
        setOpen(false)
      }
    })
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => { setError(null); setOpen(true) }}>
        Удалить участника
      </Button>

      {error && <p className={styles.modalError}>{error}</p>}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Удалить участника?"
        footer={
          <div className={styles.modalFooter}>
            <Button fullWidth variant="secondary" onClick={() => setOpen(false)}>
              Назад
            </Button>
            <Button fullWidth variant="destructive" onClick={confirm} disabled={isDeleting}>
              {isDeleting ? '…' : 'Удалить'}
            </Button>
          </div>
        }
      >
        <p className={styles.modalText}>
          «{memberName}» будет удалён без возможности восстановления.
        </p>
      </Modal>
    </>
  )
}
