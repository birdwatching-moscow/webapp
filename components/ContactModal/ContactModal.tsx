'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Modal } from '@/components/ui/modal/Modal'
import { Button } from '@/components/ui/buttons/Button'
import { ContactForm, TYPE_CONFIG, type ContactFormType } from './ContactForm'
import styles from './ContactModal.module.css'

export type { ContactRequestType, ContactFormType } from './ContactForm'

type ContactModalProps = {
  open: boolean
  onClose: () => void
  defaultType?: ContactFormType
}

export const ContactModal = ({ open, onClose, defaultType = 'QUESTION' }: ContactModalProps) => {
  const { data: session } = useSession()
  const config = TYPE_CONFIG[defaultType]

  const footer = (
    <div className={styles.footer}>
      {config.formNote && <p className={styles.formNote}>{config.formNote}</p>}
      <Button onClick={onClose} variant="outline" size="lg" fullWidth className={styles.closeBtn}>
        Закрыть
      </Button>
    </div>
  )

  const header = (
    <>
      <p className={styles.formTitle}>{config.label}</p>
      <div className={styles.subtitle}>{config.subtitle}</div>
    </>
  )

  return (
    <Modal open={open} onClose={onClose} title="Оставить заявку" footer={footer}>
      {/* key resets form state when modal reopens */}
      <ContactForm
        key={open ? 'open' : 'closed'}
        type={defaultType}
        initialName={session?.user?.name ?? ''}
        initialEmail={session?.user?.email ?? ''}
        header={header}
      />
    </Modal>
  )
}
