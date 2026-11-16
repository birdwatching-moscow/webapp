import { CTABand } from '@/components/CTABand/CTABand'
import { ROUTES } from '@/utils/routes'
import styles from './HomeBirdID.module.css'

export const HomeBirdID = () => (
  <section data-testid="home-birdid" className={styles.section}>
    <CTABand
      title="BirdID — курс идентификации птиц"
      description="Углублённый курс с апреля по середину июля, по выходным и в поле. После экзаменов — сертификат и возможность проводить учёты, волонтёрить и работать в заповедниках."
      buttonLabel="Узнать о курсе"
      href={ROUTES.birdid}
    />
    <CTABand
      title="Сертификат"
      description="Удобный подарок для друзей, коллег, родственников и других близких!"
      buttonLabel="Подробнее"
      href={ROUTES.certificates}
    />
  </section>
)
