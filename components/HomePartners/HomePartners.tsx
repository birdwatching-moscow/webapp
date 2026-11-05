import Image from 'next/image'
import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './HomePartners.module.css'

const TITLE = 'Друзья и партнёры проекта'

type Partner = { src: string; alt: string; padClass?: string }

// padClass mirrors Figma insets within the 306×172 cell (see HomePartners.module.css)
const PARTNERS: Partner[] = [
  { src: '/images/partners/biofak.png',    alt: 'Биологический факультет МГУ' },
  { src: '/images/partners/leica.png',     alt: 'Leica',                       padClass: 'padLeica' },
  { src: '/images/partners/pg.png',        alt: 'Парк Горького' },
  { src: '/images/partners/birdid.png',    alt: 'Bird ID',                     padClass: 'padBirdid' },
  { src: '/images/partners/macaulay.png',  alt: 'Macaulay Library' },
  { src: '/images/partners/monticola.png', alt: 'Monticola' },
  { src: '/images/partners/elements.png',  alt: 'Элементы' },
  { src: '/images/partners/sopr.png',      alt: 'Союз охраны птиц России',     padClass: 'padSopr' },
]

export const HomePartners = () => (
  <section data-testid="home-partners" className={styles.section}>
    <h2 className={`text-h1 ${styles.title}`}>{TITLE}</h2>

    <ul className={styles.grid}>
      {PARTNERS.map((p) => (
        <li key={p.src} className={styles.cell}>
          <a href="#" target="_blank" rel="noopener noreferrer" className={styles.logoLink}>
            <span className={[styles.imgFrame, p.padClass ? styles[p.padClass] : ''].filter(Boolean).join(' ')}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1248px) 306px, 228px" className={styles.logo} placeholder="empty" />
            </span>
          </a>
        </li>
      ))}
    </ul>

    <Button as="a" variant="secondary" size="lg" fullWidth href={ROUTES.partners} className={styles.moreButton}>
      Посмотреть все
    </Button>
  </section>
)
