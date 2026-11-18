'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { ContactModal, type ContactFormType } from '@/components/ContactModal/ContactModal'

type PrivateRequestButtonProps = {
  className?: string
  /** Which form texts to show; both are stored as a private event request */
  formType?: Extract<ContactFormType, 'PRIVATE_EVENT' | 'PRIVATE_LECTURE'>
}

/** «Оставить заявку» — opens the contact form preset to a private event. */
export const PrivateRequestButton = ({ className, formType = 'PRIVATE_EVENT' }: PrivateRequestButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="lg" fullWidth className={className} onClick={() => setOpen(true)}>
        Оставить заявку
      </Button>
      <ContactModal open={open} onClose={() => setOpen(false)} defaultType={formType} />
    </>
  )
}
