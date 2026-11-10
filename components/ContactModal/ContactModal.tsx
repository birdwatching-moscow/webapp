'use client'

import { useState } from 'react'
import axios from 'axios'
import { Modal } from '@/components/ui/modal/Modal'
import { Input } from '@/components/ui/input/Input'
import { Button } from '@/components/ui/buttons/Button'
import { submitContactRequest } from '@/lib/api/requests'
import { MAX_REQUEST_NAME, MAX_REQUEST_MESSAGE } from '@/lib/validation/requests'
import { MAX_EMAIL } from '@/lib/constants'
import { ROUTES } from '@/utils/routes'
import styles from './ContactModal.module.css'

export type ContactRequestType = 'EXPEDITION' | 'CERTIFICATE' | 'QUESTION' | 'PRIVATE_EVENT'

type TypeConfig = {
  label: string
  subtitle: React.ReactNode
  successText: string
}

const TYPE_CONFIG: Record<ContactRequestType, TypeConfig> = {
  EXPEDITION: {
    label: 'Заявка на экспедицию',
    subtitle: 'Оставьте контакты — координатор уточнит детали.',
    successText: 'Спасибо, что написали. Мы свяжемся с вами в течение дня, чтобы уточнить детали участия.',
  },
  CERTIFICATE: {
    label: 'Заявка на сертификат',
    subtitle: 'Оставьте контакты — мы свяжемся в течение 24 часов.',
    successText: 'Спасибо! Мы свяжемся с вами в течение 24 часов.',
  },
  QUESTION: {
    label: 'Задать вопрос',
    subtitle: 'Напишите вопрос — мы ответим в течение 24 часов.',
    successText: 'Спасибо, что написали. Мы ответим в течение 24 часов.',
  },
  PRIVATE_EVENT: {
    label: 'Заявка на частное мероприятие',
    subtitle: (
      <ul>
        <li>желаемый диапазон дат для прогулки,</li>
        <li>желаемое время начала</li>
        <li>локацию,</li>
        <li>количество участников,</li>
        <li>какой вид прогулки нужен: наблюдение за птицами или натуралистика.</li>
      </ul>
    ),
    successText: 'Спасибо, что написали. Мы отвечаем обычно в течение дня после предоставления данных и отвечаем в зависимости от: есть ли свободный гид для ваших критериев или что мы можем предложить, если нет.',
  },
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
  const [rateLimited, setRateLimited] = useState(false)
  const [retryMinutes, setRetryMinutes] = useState(10)
  const [serverError, setServerError] = useState<string | null>(null)

  const config = TYPE_CONFIG[defaultType]

  const handleClose = () => {
    if (submitted) {
      setName('')
      setEmail('')
      setMessage('')
      setHp('')
      setConsent(false)
    }
    setSubmitted(false)
    setRateLimited(false)
    setServerError(null)
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
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        const retryAfterSec = Number(err.response.headers['retry-after']) || 600
        setRetryMinutes(Math.ceil(retryAfterSec / 60))
        setRateLimited(true)
      } else {
        setServerError('Не удалось отправить заявку. Попробуйте ещё раз.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const closeFooter = (rateLimited || submitted)
    ? <Button onClick={handleClose} variant="outline" size="lg" fullWidth>Закрыть</Button>
    : undefined

  return (
    <Modal open={open} onClose={handleClose} title="Оставить заявку" footer={closeFooter}>
      {rateLimited ? (
        <div className={styles.rateLimitBox}>
          <p className={`text-h3 ${styles.rateLimitTitle}`}>Нужно немного передохнуть</p>
          <p className={`text-body ${styles.rateLimitText}`}>
            Вы исчерпали лимит обращений на данный момент. Мы сможем принять ваш следующий запрос через {retryMinutes} минут.
          </p>
        </div>
      ) : submitted ? (
        <div className={styles.rateLimitBox}>
          <p className={`text-h3 ${styles.rateLimitTitle}`}>Заявка отправлена</p>
          <p className={`text-body ${styles.rateLimitText}`}>{config.successText}</p>
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

          <p className={`text-h3 ${styles.formTitle}`}>{config.label}</p>
          <div className={styles.subtitle}>{config.subtitle}</div>

          <div className={styles.fields}>
            <div className={styles.fieldWrapper}>
              <Input
                id="contact-name"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Имя"
                required
                autoComplete="name"
                maxLength={MAX_REQUEST_NAME}
              />
              {name.length > 0 && (
                <span className={[styles.charCount, name.length >= MAX_REQUEST_NAME ? styles.charCountError : ''].filter(Boolean).join(' ')}>
                  {name.length >= MAX_REQUEST_NAME
                    ? `Максимум ${MAX_REQUEST_NAME} символов`
                    : `${name.length} / ${MAX_REQUEST_NAME}`}
                </span>
              )}
            </div>
            <Input
              id="contact-email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              maxLength={MAX_EMAIL}
            />
            <div className={styles.fieldWrapper}>
              <textarea
                id="contact-message"
                name="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Комментарий"
                rows={4}
                required
                className={styles.textarea}
                maxLength={MAX_REQUEST_MESSAGE}
              />
              {message.length > 0 && (
                <span className={[styles.charCount, message.length >= MAX_REQUEST_MESSAGE ? styles.charCountError : ''].filter(Boolean).join(' ')}>
                  {message.length >= MAX_REQUEST_MESSAGE
                    ? `Максимум ${MAX_REQUEST_MESSAGE} символов`
                    : `${message.length} / ${MAX_REQUEST_MESSAGE}`}
                </span>
              )}
            </div>
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
