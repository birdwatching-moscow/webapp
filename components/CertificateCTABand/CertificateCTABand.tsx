import { CTABand } from '@/components/CTABand/CTABand'
import { ROUTES } from '@/utils/routes'

export const CertificateCTABand = () => (
  <CTABand
    title="Сертификат"
    description="Удобный подарок для друзей, коллег, родственников и других близких!"
    buttonLabel="Подробнее"
    href={ROUTES.certificates}
  />
)
