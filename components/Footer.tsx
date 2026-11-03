import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo/Logo'
import { getRandomBirdSrc } from '@/lib/footer-birds'
import styles from './Footer.module.css'

const EVENTS_LINKS = [
  { label: 'Прогулки',    href: '/walks' },
  { label: 'Экспедиции',  href: '/expeditions' },
  { label: 'Частные',     href: '/private-events' },
] as const

const OTHER_LINKS = [
  { label: 'О проекте',   href: '/about' },
  { label: 'FAQ',         href: '/faq' },
  { label: 'Книга',       href: '/book' },
  { label: 'Сертификаты', href: '/certificates' },
  { label: 'BirdID',      href: '/birdid' },
] as const

const CONTACT_LINKS = [
  { label: 'Почта',      href: '#' },
  { label: 'ВКонтакте', href: '#' },
  { label: 'Телеграм',  href: '#' },
] as const

export const Footer = () => {
  const year = new Date().getFullYear()
  const birdSrc = getRandomBirdSrc()

  return (
    <footer className={styles.footer}>
      <div className={styles.mainRow}>
        <div className={styles.logoBlock}>
          <Logo />
          <p className={styles.tagline}>
            Знакомим людей с птицами и помогаем природе через образование.
          </p>
        </div>

        <div className={styles.birdPhoto}>
          {birdSrc && (
            <Image
              src={birdSrc}
              alt="Зимородок"
              width={355}
              height={187}
              placeholder="empty"
            />
          )}
        </div>

        <div className={styles.navSection}>
          <div className={styles.navRow}>
            <div className={styles.column}>
              <span className={styles.columnLabel}>события</span>
              {EVENTS_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} className={styles.link}>{label}</Link>
              ))}
            </div>

            <div className={styles.column}>
              <span className={styles.columnLabel}>прочее</span>
              {OTHER_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} className={styles.link}>{label}</Link>
              ))}
            </div>
          </div>

          <div className={styles.column}>
            <span className={styles.columnLabel}>Контакты</span>
            {CONTACT_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className={styles.link}>{label}</a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <span>© {year}</span>
        <Link href="/oferta">Оферта</Link>
      </div>
    </footer>
  )
}
