'use client'

import { useState } from 'react'
import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import { ContactModal } from '@/components/ContactModal/ContactModal'

export const CertificatesCTA = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <NoticeBanner
        text="Если остались вопросы или вы хотите заказать сертификат"
        buttons={[{ label: 'Написать', onClick: () => setOpen(true) }]}
      />
      <ContactModal
        open={open}
        onClose={() => setOpen(false)}
        defaultType="CERTIFICATE"
      />
    </>
  )
}
