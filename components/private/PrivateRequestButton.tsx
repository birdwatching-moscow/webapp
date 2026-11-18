'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { ContactModal } from '@/components/ContactModal/ContactModal'

type PrivateRequestButtonProps = {
  className?: string
}

/** «Оставить заявку» — opens the contact form preset to a private event. */
export const PrivateRequestButton = ({ className }: PrivateRequestButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="lg" fullWidth className={className} onClick={() => setOpen(true)}>
        Оставить заявку
      </Button>
      <ContactModal open={open} onClose={() => setOpen(false)} defaultType="PRIVATE_EVENT" />
    </>
  )
}
