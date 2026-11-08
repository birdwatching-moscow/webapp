import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <main className={styles.hero}>
      <div className={styles.content}>
        <h1 className={`text-display ${styles.heading}`}>Улетела из гнезда</h1>
        <p className={`text-body-l ${styles.subheading}`}>
          Этой страницы больше нет — похоже, она сменила маршрут миграции.
          Проверьте адрес или вернитесь на главную.
        </p>
        <Button as="a" href={ROUTES.home} size="lg" fullWidth className={styles.cta}>
          Перейти на главную
        </Button>
      </div>
    </main>
  )
}
