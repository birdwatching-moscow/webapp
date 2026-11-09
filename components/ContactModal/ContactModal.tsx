'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal/Modal'
import { Input } from '@/components/ui/input/Input'
import { Button } from '@/components/ui/buttons/Button'
import { submitContactRequest } from '@/lib/api/requests'
import { ROUTES } from '@/utils/routes'
import styles from './ContactModal.module.css'

export type ContactRequestType = 'EXPEDITION' | 'CERTIFICATE' | 'QUESTION' | 'PRIVATE_EVENT'

type TypeConfig = { label: string; subtitle: string }

const TYPE_CONFIG: Record<ContactRequestType, TypeConfig> = {
  EXPEDITION:    { label: 'Заявка на экспедицию',         subtitle: 'Оставьте контакты — координатор уточнит детали.' },
  CERTIFICATE:   { label: 'Заявка на сертификат',         subtitle: 'Оставьте контакты — мы свяжемся в течение 24 часов.' },
  QUESTION:      { label: 'Задать вопрос',                subtitle: 'Напишите вопрос — мы ответим в ближайшее время.' },
  PRIVATE_EVENT: { label: 'Заявка на частное мероприятие', subtitle: 'Оставьте контакты — мы подберём формат под вас.' },
}


type ContactModalProps = {
  open: boolean
  onClose: () => void
  defaultType?: ContactRequestType
}

export const ContactModal = ({ open, onClose, defaultType = 'QUESTION' }: ContactModalProps) => {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [message, setMessage]     = useState('')
  const [hp, setHp]               = useState('')
  const [consent, setConsent]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const config = TYPE_CONFIG[defaultType]

  const handleClose = () => {
    if (submitted) {
      setName('')
      setEmail('')
      setMessage('')
      setHp('')
      setConsent(false)
      setSubmitted(false)
      setServerError(null)
    }
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setServerError(null)
    try {
      await submitContactRequest({ type: defaultType, name, email, message, _hp: hp })
      setSubmitted(true)
    } catch {
      setServerError('Не удалось отправить заявку. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose}>
      {submitted ? (
        <div className={styles.success}>
          <p className={`text-body-l ${styles.successText}`}>
            Спасибо! Мы получили вашу заявку и скоро свяжемся с вами.
          </p>
          <Button onClick={handleClose} fullWidth>Закрыть</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Honeypot: visible to bots, hidden from humans */}
          <input
            type="text"
            name="_hp"
            value={hp}
            onChange={e => setHp(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className={styles.honeypot}
          />
          <div className={styles.formHeader}>
            <h2 className={`text-h2 ${styles.formTitle}`}>{config.label}</h2>
            <p className={styles.subtitle}>{config.subtitle}</p>
          </div>

          <div className={styles.fields}>
            <Input
              id="contact-name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Имя"
              required
              autoComplete="name"
            />
            <Input
              id="contact-email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
            />
            <textarea
              id="contact-message"
              name="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Комментарий"
              rows={4}
              required
              className={styles.textarea}
            />
          </div>

          <label className={styles.consent}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className={styles.checkbox}
              required
            />
            <span className={`text-body-m ${styles.consentText}`}>
              Соглашаюсь на обработку{' '}
              <a href={ROUTES.oferta} target="_blank" rel="noopener noreferrer" className={styles.consentLink}>
                персональных данных
              </a>
            </span>
          </label>

          {serverError && (
            <p role="alert" className={`text-body-m ${styles.error}`}>{serverError}</p>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            className={styles.submitBtn}
          >
            Отправить
          </Button>
        </form>
      )}
    </Modal>
  )
}
