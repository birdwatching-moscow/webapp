import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import styles from './SaveBirds.module.css'

const TEXT =
  'За медицинской помощью для птиц обращайтесь, пожалуйста в проект Воронье гнездо'

const CORVIDSNEST_URL = 'https://corvidsnest.ru/'

export const SaveBirds = () => (
  <section data-testid="save-birds" className={styles.section}>
    <NoticeBanner
      text={TEXT}
      buttons={[{ label: 'Воронье Гнездо', href: CORVIDSNEST_URL }]}
    />
  </section>
)
