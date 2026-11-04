import { NearestSection } from '@/components/NearestSection/NearestSection'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { ExpeditionCard } from '@/components/ExpeditionCard/ExpeditionCard'
import { ROUTES } from '@/utils/routes'
import type { ExpeditionCardRow } from '@/lib/expeditions'
import styles from './HomeExpeditions.module.css'

interface HomeExpeditionsProps {
  expeditions: ExpeditionCardRow[]
}

const SECTION_DESCRIPTION =
  'Мы собираем поездки по России и миру, чтобы видеть редкие виды, узнавать новые территории и проживать маршрут не спеша — в компании людей, которым так же важно быть внимательными к природе.'

export const HomeExpeditions = ({ expeditions }: HomeExpeditionsProps) => {
  if (expeditions.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <h2 className={styles.introTitle}>Экспедиции</h2>
        <p className={styles.introDesc}>{SECTION_DESCRIPTION}</p>
      </div>

      <PhotoCard src="/images/home-expeditions.png" alt="Участники экспедиции" />

      <NearestSection moreHref={ROUTES.expeditions} showMoreButton>
        <div className={styles.cards}>
          {expeditions.map((exp) => (
            <ExpeditionCard key={exp.id} expedition={exp} />
          ))}
        </div>
      </NearestSection>
    </section>
  )
}
