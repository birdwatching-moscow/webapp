import { ConsultationCaseCard } from '@/components/private/ConsultationCaseCard'
import type { ConsultationTopic } from '@/lib/private/consultations'
import styles from './PrivateConsultations.module.css'

type PrivateConsultationsProps = {
  topics: readonly ConsultationTopic[]
}

export const PrivateConsultations = ({ topics }: PrivateConsultationsProps) => (
  <>
    {topics.map((topic) => {
      const paragraphs = typeof topic.description === 'string' ? [topic.description] : topic.description
      return (
        <section key={topic.title} className={styles.section} aria-label={topic.title}>
          <h2 className={`text-display ${styles.title}`}>{topic.title}</h2>
          <div className={styles.paragraphs}>
            {paragraphs.map((p) => (
              <p key={p} className={`text-body-l ${styles.description}`}>
                {p}
              </p>
            ))}
          </div>
          {topic.cases && topic.cases.length > 0 && (
            <ul className={styles.grid}>
              {topic.cases.map((c) => (
                <li key={c.client}>
                  <ConsultationCaseCard client={c.client} description={c.description} imageUrl={c.imageUrl} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )
    })}
  </>
)
