import Link from 'next/link'
import styles from './Hero.module.css'

const HEADING = 'Помогаем природе через образование людей'
const SUBHEADING = 'Знакомим людей с птицами. Организуем бердвотчерские прогулки в Москве и поездки по миру. Повышаем квалификацию через BirdID'

export const Hero = () => (
  <section className={styles.hero}>
    <h1 className={`text-display ${styles.heading}`}>{HEADING}</h1>

    {/* Image: between heading and subtext on mobile; right column on desktop */}
    <div data-testid="hero-media" className={styles.heroMedia} />

    <p className={`text-body-l ${styles.subheading}`}>{SUBHEADING}</p>

    <Link href="/walks" className={styles.cta}>
      Выбрать прогулку
    </Link>
  </section>
)
