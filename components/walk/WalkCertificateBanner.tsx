import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './WalkCertificateBanner.module.css'

export const WalkCertificateBanner = () => (
  <div className={styles.banner}>
    <div className={styles.text}>
      <p className={`text-h2 ${styles.title}`}>Сертификат</p>
      <p className={`text-body-l ${styles.description}`}>
        Удобный подарок для друзей, коллег, родственников и других близких!
      </p>
    </div>
    <Button as="a" href={ROUTES.certificates} variant="secondary" size="lg" fullWidth className={styles.cta}>
      Подробнее
    </Button>
  </div>
)
