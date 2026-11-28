'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { ContactModal } from '@/components/ContactModal/ContactModal'
import styles from './ExpeditionPricing.module.css'

type Props = {
  expeditionId: string
}

export const ExpeditionContactTrigger = ({ expeditionId }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="lg" className={styles.cta} onClick={() => setOpen(true)}>
        Оставить заявку
      </Button>
      <ContactModal
        open={open}
        onClose={() => setOpen(false)}
        defaultType="EXPEDITION"
        expeditionId={expeditionId}
        messagePlaceholder="Укажите, сколько вас, и задайте вопросы — если они есть"
      />
    </>
  )
}
