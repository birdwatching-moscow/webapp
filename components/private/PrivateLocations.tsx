import { SectionIntro } from '@/components/SectionIntro/SectionIntro'
import { LocationCard } from '@/components/cards/LocationCard'
import type { PrivatePark } from '@/lib/private/parks'
import styles from './PrivateLocations.module.css'

type PrivateLocationsProps = {
  title: string
  description: string
  locations: readonly PrivatePark[]
}

/** Horizontal swipe list on mobile, 3-column grid on desktop. */
export const PrivateLocations = ({ title, description, locations }: PrivateLocationsProps) => (
  <section className={styles.section} aria-label={title}>
    <SectionIntro title={title} description={description} />
    <ul className={styles.list}>
      {locations.map((location) => (
        <li key={location.name} className={styles.item}>
          <LocationCard
            name={location.name}
            description={location.description}
            species={location.species}
            imageUrl={location.imageUrl}
            photoCredit={location.photoCredit}
            imageAlt={location.name}
          />
        </li>
      ))}
    </ul>
  </section>
)
