import Image from 'next/image'
import { Button } from '@/components/ui/buttons/Button'
import { getRandomBirdSrc } from '@/lib/footer-birds'
import { ROUTES } from '@/utils/routes'
import styles from './Hero.module.css'

const HEADING = 'Помогаем природе через образование людей'
const SUBHEADING = 'Знакомим людей с птицами. Организуем бердвотчерские прогулки в Москве и поездки по миру. Повышаем квалификацию через BirdID'

export const Hero = () => {
  const bird = getRandomBirdSrc()

  return (
  <section className={styles.hero}>
    <h1 className={`text-display ${styles.heading}`}>{HEADING}</h1>

    {/* Image: between heading and subtext on mobile; right column on desktop */}
    <div data-testid="hero-media" className={styles.heroMedia}>
      {bird && (
        <Image src={bird.src} alt={bird.name} width={600} height={317} placeholder="empty" />
      )}
    </div>

    <p className={`text-body-l ${styles.subheading}`}>{SUBHEADING}</p>

    <Button as="a" href={ROUTES.walks} size="lg" fullWidth className={styles.cta}>
      Выбрать прогулку
    </Button>
  </section>
  )
}
