import Image from 'next/image'
import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './HomePartners.module.css'

const TITLE = 'Друзья и партнёры проекта'

const PARTNERS = [
  { src: '/images/partners/biofak.png',   alt: 'Биологический факультет МГУ' },
  { src: '/images/partners/leica.png',    alt: 'Leica' },
  { src: '/images/partners/pg.png',       alt: 'Парк Горького' },
  { src: '/images/partners/birdid.png',   alt: 'Bird ID' },
  { src: '/images/partners/macaulay.png', alt: 'Macaulay Library' },
  { src: '/images/partners/monticola.png',alt: 'Monticola' },
  { src: '/images/partners/elements.png', alt: 'Элементы' },
  { src: '/images/partners/sopr.png',     alt: 'Союз охраны птиц России' },
] as const

export const HomePartners = () => (
  <section data-testid="home-partners" className={styles.section}>
    <h2 className={`text-h1 ${styles.title}`}>{TITLE}</h2>

    <ul className={styles.grid}>
      {PARTNERS.map((p) => (
        <li key={p.src} className={styles.cell}>
          <a href="#" target="_blank" rel="noopener noreferrer" className={styles.logoLink}>
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1248px) 306px, 50vw" className={styles.logo} placeholder="empty" />
          </a>
        </li>
      ))}
    </ul>

    <Button as="a" variant="secondary" size="lg" fullWidth href={ROUTES.partners} className={styles.moreButton}>
      Посмотреть все
    </Button>
  </section>
)
