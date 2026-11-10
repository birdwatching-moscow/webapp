import { useState } from 'react'
import styles from '../[id]/walk-edit.module.css'
import emailStyles from './walk-email-tab.module.css'

const REMINDER_DAYS_OPTIONS = [1, 2, 3, 4, 5]

interface Props {
  purchaseEmailSubject: string
  purchaseEmailBody: string
  emailSubject: string
  emailBody: string
  reminderDaysBefore: number
  onPurchaseEmailSubject: (v: string) => void
  onPurchaseEmailBody: (v: string) => void
  onEmailSubject: (v: string) => void
  onEmailBody: (v: string) => void
  onReminderDaysBefore: (v: number) => void
  disabled?: boolean
  requireAll?: boolean
}

type EmailSubTab = 'purchase' | 'reminder'

export function WalkEmailTab({
  purchaseEmailSubject, purchaseEmailBody,
  emailSubject, emailBody, reminderDaysBefore,
  onPurchaseEmailSubject, onPurchaseEmailBody,
  onEmailSubject, onEmailBody, onReminderDaysBefore,
  disabled, requireAll,
}: Props) {
  const [subTab, setSubTab] = useState<EmailSubTab>('purchase')

  return (
    <div className={styles.sections}>
      <nav className={emailStyles.subTabs}>
        <button
          type="button"
          className={[emailStyles.subTab, subTab === 'purchase' ? emailStyles.subTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setSubTab('purchase')}
        >
          При покупке
        </button>
        <button
          type="button"
          className={[emailStyles.subTab, subTab === 'reminder' ? emailStyles.subTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setSubTab('reminder')}
        >
          Напоминание
        </button>
      </nav>

      {subTab === 'purchase' && (
        <section className={styles.section}>
          <p className={styles.emailNote}>
            Письмо отправляется участнику сразу после покупки билета.
          </p>
          <div className={styles.field}>
            <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Тема письма</label>
            <input
              className={styles.input}
              value={purchaseEmailSubject}
              onChange={e => onPurchaseEmailSubject(e.target.value)}
              disabled={disabled}
              placeholder="Например: Вы записаны на прогулку «Название»"
            />
          </div>
          <div className={styles.field}>
            <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Текст письма</label>
            <textarea
              className={styles.textarea}
              value={purchaseEmailBody}
              onChange={e => onPurchaseEmailBody(e.target.value)}
              disabled={disabled}
              rows={12}
              placeholder="Текст письма-подтверждения..."
            />
          </div>
        </section>
      )}

      {subTab === 'reminder' && (
        <section className={styles.section}>
          <p className={styles.emailNote}>
            Письмо-напоминание отправляется участникам за N дней до начала прогулки. Если не заполнено — не отправляется.
          </p>
          <div className={emailStyles.reminderDaysRow}>
            <label className={styles.label}>За сколько дней до прогулки</label>
            <div className={emailStyles.reminderDaysOptions}>
              {REMINDER_DAYS_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  className={[
                    emailStyles.reminderDayBtn,
                    reminderDaysBefore === n ? emailStyles.reminderDayBtnActive : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => !disabled && onReminderDaysBefore(n)}
                  disabled={disabled}
                  aria-pressed={reminderDaysBefore === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Тема письма</label>
            <input
              className={styles.input}
              value={emailSubject}
              onChange={e => onEmailSubject(e.target.value)}
              disabled={disabled}
              placeholder="Например: Напоминание о прогулке «Название»"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Текст письма</label>
            <textarea
              className={styles.textarea}
              value={emailBody}
              onChange={e => onEmailBody(e.target.value)}
              disabled={disabled}
              rows={12}
              placeholder="Текст письма-напоминания..."
            />
          </div>
        </section>
      )}
    </div>
  )
}
