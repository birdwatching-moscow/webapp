import { ContactForm } from '@/components/ContactModal/ContactForm'
import styles from './ExpeditionContactForm.module.css'

type Props = {
  expeditionId: string
  initialName?: string
  initialEmail?: string
}

export const ExpeditionContactForm = ({ expeditionId, initialName, initialEmail }: Props) => {
  const header = (
    <div className={styles.heading}>
      <h2 className={styles.title}>Хотите записаться в эту экспедицию?</h2>
      <p className={styles.subtitle}>Оставьте email и мы ответим на все ваши вопросы</p>
    </div>
  )

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <ContactForm
          type="EXPEDITION"
          expeditionId={expeditionId}
          initialName={initialName}
          initialEmail={initialEmail}
          header={header}
          messagePlaceholder="Укажите, сколько вас, и задайте вопросы — если они есть"
        />
      </div>
    </section>
  )
}
