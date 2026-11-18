import { CTABand } from '@/components/CTABand/CTABand'
import { ROUTES } from '@/utils/routes'

export const BirdIDCTABand = () => (
  <CTABand
    title="BirdID — курс идентификации птиц"
    description="Углублённый курс с апреля по середину июля, по выходным и в поле. После экзаменов — сертификат и возможность проводить учёты, волонтёрить и работать в заповедниках."
    buttonLabel="Узнать о курсе"
    href={ROUTES.birdid}
  />
)
