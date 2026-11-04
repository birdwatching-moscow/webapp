import { NearestSection } from '@/components/NearestSection/NearestSection'
import { ExpeditionCard } from '@/components/ExpeditionCard/ExpeditionCard'
import { ROUTES } from '@/utils/routes'
import type { ExpeditionCardRow } from '@/lib/expeditions'
import styles from './HomeExpeditions.module.css'

interface HomeExpeditionsProps {
  expeditions: ExpeditionCardRow[]
}

const SECTION_DESCRIPTION =
  'Многодневные экспедиции в дальние места — от арктических тундр до субтропических лесов Колхиды.'

export const HomeExpeditions = ({ expeditions }: HomeExpeditionsProps) => {
  if (expeditions.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <h2 className={styles.introTitle}>Экспедиции</h2>
        <p className={styles.introDesc}>{SECTION_DESCRIPTION}</p>
      </div>

      <div className={styles.coverWrap} aria-hidden="true" />

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
