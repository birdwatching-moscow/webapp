import styles from './SectionIntro.module.css'

interface SectionIntroProps {
  title: string
  description: string
}

export const SectionIntro = ({ title, description }: SectionIntroProps) => (
  <div className={styles.intro}>
    <h2 className={`text-h1 ${styles.title}`}>{title}</h2>
    <p className={styles.description}>{description}</p>
  </div>
)
