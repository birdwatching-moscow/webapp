import Link from 'next/link'
import styles from './Hero.module.css'

const HEADING_DESKTOP = 'Помогаем природе через образование людей'
const HEADING_MOBILE  = 'Помогаем природе через образование'
const SUBHEADING = 'Знакомим людей с птицами. Организуем бердвотчерские прогулки в Москве и поездки по миру. Повышаем квалификацию через BirdID'

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.content}>
      <div className={styles.textBlock}>
        {/* Desktop heading (hidden on mobile via CSS) */}
        <h1 className={`text-display ${styles.headingDesktop}`}>{HEADING_DESKTOP}</h1>
        {/* Mobile heading (hidden on desktop via CSS) */}
        <h1 className={`text-display ${styles.headingMobile}`} aria-hidden="true">{HEADING_MOBILE}</h1>
        <p className={`text-body-l ${styles.subheading}`}>{SUBHEADING}</p>
      </div>
      <Link href="/walks" className={styles.cta}>
        Выбрать прогулку
      </Link>
    </div>
    <div className={styles.mediaWrapper}>
      <div data-testid="hero-media" className={styles.heroMedia} />
    </div>
  </section>
)
