import Link from 'next/link'
import styles from './Hero.module.css'

const HEADING_DESKTOP = 'Помогаем природе через образование людей'
// Shorter heading for mobile — intentional per Figma (fits 3 lines at 40px)
const HEADING_MOBILE  = 'Помогаем природе через образование'
const SUBHEADING = 'Знакомим людей с птицами. Организуем бердвотчерские прогулки в Москве и поездки по миру. Повышаем квалификацию через BirdID'

export const Hero = () => (
  <section className={styles.hero}>
    {/* Desktop heading — hidden on mobile */}
    <h1 className={`text-display ${styles.headingDesktop}`}>{HEADING_DESKTOP}</h1>
    {/* Mobile heading — aria-hidden so only the desktop h1 is in the a11y tree */}
    <h1 className={`text-display ${styles.headingMobile}`} aria-hidden="true">{HEADING_MOBILE}</h1>

    {/* Image: between heading and subtext on mobile; right column on desktop */}
    <div data-testid="hero-media" className={styles.heroMedia} />

    <p className={`text-body-l ${styles.subheading}`}>{SUBHEADING}</p>

    <Link href="/walks" className={styles.cta}>
      Выбрать прогулку
    </Link>
  </section>
)
