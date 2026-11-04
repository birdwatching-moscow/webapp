import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import styles from './HomeWalks.module.css'

const HEADING = 'Прогулки по Москве'
const BODY = 'Прогулки в Москве проходят каждые выходные и длятся 1,5–2 часа. Такой лёгкий формат идеален для первого знакомства с птицами, а многие приходят регулярно, потому что им нравится отдыхать от городской суеты и проводить время на природе в хорошей компании.'

export const HomeWalks = () => (
  <section data-testid="home-walks" className={styles.section}>
    <div className={styles.intro}>
      <h2 className={`text-h1 ${styles.heading}`}>{HEADING}</h2>
      <p className={`text-body-l ${styles.body}`}>{BODY}</p>
    </div>
    <PhotoCard src="/images/home-walks.jpg" alt="Участники прогулки по Москве" className={styles.photo} />
  </section>
)
