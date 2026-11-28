import { type ReactNode } from 'react'
import styles from './BirdIdTextSection.module.css'

type Props = {
  title: string
  paragraphs: ReactNode[]
}

export const BirdIdTextSection = ({ title, paragraphs }: Props) => (
  <section className={styles.section}>
    <h2 className={`text-display ${styles.title}`}>{title}</h2>
    <div className={styles.body}>
      {paragraphs.map((p, i) => (
        <p key={i} className={`text-body-l ${styles.paragraph}`}>{p}</p>
      ))}
    </div>
  </section>
)
