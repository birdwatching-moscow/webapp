import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './HomeAbout.module.css'

const BODY_TEXT = 'Помогать природе через образование людей. К нам приходят, чтобы узнать больше о птицах, научиться их различать, найти новое увлечение или просто провести время на природе в хорошей компании.'

export const HomeAbout = () => (
  <section className={styles.section}>
    <div className={styles.content}>
      <div className={styles.textBlock}>
        <h2 className={`text-h1 ${styles.heading}`}>О проекте</h2>
        <p className={`text-body-l ${styles.body}`}>{BODY_TEXT}</p>
      </div>
      <Button as="a" href={ROUTES.about} variant="secondary" size="lg" className={styles.cta}>
        Подробнее
      </Button>
    </div>
  </section>
)
