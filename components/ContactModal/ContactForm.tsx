'use client'

import { useState } from 'react'
import axios from 'axios'
import { Input } from '@/components/ui/input/Input'
import { Button } from '@/components/ui/buttons/Button'
import { ConsentCheckbox } from '@/components/ui/consent-checkbox/ConsentCheckbox'
import { submitContactRequest } from '@/lib/api/requests'
import { MAX_REQUEST_NAME, MAX_REQUEST_MESSAGE } from '@/lib/validation/requests'
import { MAX_EMAIL } from '@/lib/constants'
import { pluralRu } from '@/utils/pluralRu'
import { validateEmail, validateName } from '@/utils/validateAuthFields'
import { CONTACT_FORM_LABELS } from '@/lib/contact-form-labels'
import styles from './ContactForm.module.css'

export type ContactRequestType = 'EXPEDITION' | 'CERTIFICATE' | 'QUESTION' | 'PRIVATE_EVENT'
export type ContactFormType = ContactRequestType | 'PRIVATE_LECTURE'

export const REQUEST_TYPE: Record<ContactFormType, ContactRequestType> = {
  EXPEDITION:      'EXPEDITION',
  CERTIFICATE:     'CERTIFICATE',
  QUESTION:        'QUESTION',
  PRIVATE_EVENT:   'PRIVATE_EVENT',
  PRIVATE_LECTURE: 'PRIVATE_EVENT',
}

export type TypeConfig = {
  label: string
  subtitle: React.ReactNode
  successText: string
  formNote?: string
}

export const TYPE_CONFIG: Record<ContactFormType, TypeConfig> = {
  EXPEDITION: {
    label: 'Заявка на экспедицию',
    subtitle: 'Оставьте контакты — координатор уточнит детали.',
    successText: 'Спасибо, что написали. Мы свяжемся с вами в течение 24 часов, чтобы уточнить детали участия.',
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
    label: 'Заявка на частное событие',
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
    formNote: 'Желательно дать нам вводные данные для вашей прогулки за неделю до нужной даты, а в апреле - июне - за 2-3 недели, так как график у гидов плотный.',
  },
  PRIVATE_LECTURE: {
    label: 'Заявка на лекцию',
    subtitle: (
      <ul>
        <li>желаемую дату или диапазон дат,</li>
        <li>место проведения или онлайн-формат,</li>
        <li>аудиторию и примерное количество слушателей,</li>
        <li>тему лекции или задачу, которую она должна решить.</li>
      </ul>
    ),
    successText: 'Спасибо, что написали. Обычно мы отвечаем в течение дня, чтобы обсудить тему, формат и дату лекции.',
  },
}

const MINUTE_FORMS: [string, string, string] = ['минуту', 'минуты', 'минут']
const SECONDS_PER_MINUTE = 60
const DEFAULT_RETRY_MINUTES = 10

type Props = {
  type: ContactFormType
  initialName?: string
  initialEmail?: string
  expeditionId?: string
  /** Rendered above the fields when the form is open — use for label/subtitle */
  header?: React.ReactNode
  messagePlaceholder?: string
  successText?: string
  hideFallbackEmail?: boolean
  isWaitlist?: boolean
}

export const ContactForm = ({ type, initialName = '', initialEmail = '', expeditionId, header, messagePlaceholder = 'Комментарий', successText, hideFallbackEmail, isWaitlist }: Props) => {
  const config = TYPE_CONFIG[type]

  const [name, setName]       = useState(initialName)
  const [email, setEmail]     = useState(initialEmail)
  const [message, setMessage] = useState('')
  const [hp, setHp]           = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [submitted, setSubmitted]       = useState(false)
  const [rateLimited, setRateLimited]   = useState(false)
  const [retryMinutes, setRetryMinutes] = useState(DEFAULT_RETRY_MINUTES)
  const [serverError, setServerError]   = useState<string | null>(null)
  const [fieldErrors, setFieldErrors]   = useState({ name: '', email: '', message: '', consent: '' })

  const validate = () => {
    const errors = {
      name:    validateName(name)    ?? '',
      email:   validateEmail(email)  ?? '',
      message: message.trim() ? '' : CONTACT_FORM_LABELS.messageRequired,
      consent: consent ? '' : CONTACT_FORM_LABELS.consentRequired,
    }
    setFieldErrors(errors)
    return !errors.name && !errors.email && !errors.message && !errors.consent
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)
    setServerError(null)
    try {
      await submitContactRequest({ type: REQUEST_TYPE[type], expeditionId, name, email, message, isWaitlist, _hp: hp })
      setSubmitted(true)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        const retryAfterSec = Number(err.response.headers['retry-after'])
        setRetryMinutes(retryAfterSec > 0 ? Math.ceil(retryAfterSec / SECONDS_PER_MINUTE) : DEFAULT_RETRY_MINUTES)
        setRateLimited(true)
      } else {
        setServerError(CONTACT_FORM_LABELS.serverError)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (rateLimited) {
    return (
      <div className={styles.stateBox}>
        <p className={`text-h3 ${styles.stateTitle}`}>{CONTACT_FORM_LABELS.rateLimitTitle}</p>
        <p className={`text-body ${styles.stateText}`}>
          {CONTACT_FORM_LABELS.rateLimitText(pluralRu(retryMinutes, MINUTE_FORMS))}
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={styles.stateBox}>
        <p className={`text-h3 ${styles.stateTitle}`}>{CONTACT_FORM_LABELS.submittedTitle}</p>
        <p className={`text-body ${styles.stateText}`}>{successText ?? config.successText}</p>
        {!hideFallbackEmail && (
          <p className={`text-body ${styles.stateText}`}>
            Если мы не связались — напишите нам на{' '}
            <a href={`mailto:${CONTACT_FORM_LABELS.fallbackEmail}`} className={styles.fallbackLink}>
              {CONTACT_FORM_LABELS.fallbackEmail}
            </a>
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
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

      {header}

      <div className={styles.fields}>
        <Input
          id="contact-name"
          name="name"
          value={name}
          onChange={e => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })) }}
          placeholder="Имя"
          autoComplete="name"
          maxLength={MAX_REQUEST_NAME}
          error={fieldErrors.name}
        />
        <Input
          id="contact-email"
          name="email"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })) }}
          placeholder="Email"
          autoComplete="email"
          maxLength={MAX_EMAIL}
          error={fieldErrors.email}
        />
        <div className={styles.textareaWrap}>
          <textarea
            id="contact-message"
            name="message"
            value={message}
            onChange={e => { setMessage(e.target.value); setFieldErrors(prev => ({ ...prev, message: '' })) }}
            placeholder={messagePlaceholder}
            rows={4}
            className={[styles.textarea, fieldErrors.message ? styles.textareaInvalid : ''].filter(Boolean).join(' ')}
            maxLength={MAX_REQUEST_MESSAGE}
          />
          {fieldErrors.message && (
            <p id="contact-message-error" role="alert" className={styles.textareaError}>
              {fieldErrors.message}
            </p>
          )}
        </div>
      </div>

      <ConsentCheckbox
        checked={consent}
        onChange={v => { setConsent(v); setFieldErrors(prev => ({ ...prev, consent: '' })) }}
        error={fieldErrors.consent}
      />

      {serverError && (
        <p role="alert" className={`text-body-m ${styles.error}`}>{serverError}</p>
      )}

      <Button type="submit" size="lg" fullWidth loading={submitting} className={styles.submitBtn}>
        Отправить
      </Button>
    </form>
  )
}
