import styles from './SectionIntro.module.css'

interface SectionIntroProps {
  title: string
  description: string | readonly string[]
}

export const SectionIntro = ({ title, description }: SectionIntroProps) => {
  const paragraphs = typeof description === 'string' ? [description] : description
  return (
    <div className={styles.intro}>
      <h2 className={`text-h1 ${styles.title}`}>{title}</h2>
      <div className={styles.body}>
        {paragraphs.map((p) => (
          <p key={p} className={`text-body-l ${styles.description}`}>{p}</p>
        ))}
      </div>
    </div>
  )
}
