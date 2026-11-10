import { VoronyeGnezdoBanner } from '@/components/VoronyeGnezdoBanner/VoronyeGnezdoBanner'
import styles from './SaveBirds.module.css'

export const SaveBirds = () => (
  <section data-testid="save-birds" className={styles.section}>
    <VoronyeGnezdoBanner />
  </section>
)
