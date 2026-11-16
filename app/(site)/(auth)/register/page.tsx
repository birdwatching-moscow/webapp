'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  HTTP_METHOD,
  JSON_HEADERS,
  LOGIN_CODE_PROVIDER_ID,
} from '@/lib/constants'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useOtpInput } from '@/hooks/useOtpInput'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { Button } from '@/components/ui/buttons/Button'
import { Input } from '@/components/ui/input/Input'
import { OtpStep } from '@/components/auth/OtpStep'
import { FormError } from '@/components/ui/form-error/FormError'
import { mapOtpVerifyError } from '@/lib/auth/mapOtpVerifyError'
import styles from '../auth-page.module.css'

const L = AUTH_LABELS.register
const C = AUTH_LABELS.common

type RegisterStep = 'form' | 'code'

export default function RegisterPage() {
  const router = useRouter()
  const { error, setError, loading, run } = useAuthForm()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [step, setStep] = useState<RegisterStep>('form')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const otp = useOtpInput(submitCode)

  useEffect(() => {
    if (step === 'code') otp.digitRefs.current[0]?.focus()
  }, [step, otp.digitRefs])

  async function handleFormSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    await run(async () => {
      const res = await fetch('/api/auth/register', {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({ email: emailInput, name: nameInput }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.error === 'code_rate_limited') {
          setError(AUTH_ERRORS.codeTooFrequent)
        } else if (data?.issues) {
          setFieldErrors(data.issues)
        } else {
          setError(AUTH_ERRORS.generic)
        }
        return
      }

      const data = await res.json()
      setCsrfToken(data.csrfToken ?? '')
      setEmail(emailInput)
      setName(nameInput)
      otp.reset()
      setStep('code')
    })
  }

  async function submitCode(code: string) {
    await run(async () => {
      const verifyRes = await fetch('/api/auth/verify-registration-code', {
        method: HTTP_METHOD.POST,
        headers: { ...JSON_HEADERS, 'x-csrf-token': csrfToken },
        body: JSON.stringify({ email, code, name }),
      })

      const verifyData = await verifyRes.json().catch(() => ({})) as { error?: string }

      if (!verifyRes.ok) {
        setError(mapOtpVerifyError(verifyData.error))
        otp.reset({ focus: true })
        return
      }

      const result = await signIn(LOGIN_CODE_PROVIDER_ID, { email, code, redirect: false })
      if (result?.error) {
        setError(AUTH_ERRORS.invalidCode)
        otp.reset({ focus: true })
      } else {
        router.push('/profile')
        router.refresh()
      }
    })
  }

  function goBackToForm() {
    setStep('form')
    otp.reset()
    setError(null)
  }

  return (
    <main className={styles.wrap}>

      {step === 'form' && (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Регистрация</h1>
            <p className={styles.subtitle}>
              Создайте аккаунт, чтобы иметь доступ к купленным прогулкам
            </p>
          </div>

          <FormError message={error} />

          <form onSubmit={handleFormSubmit} className={styles.form}>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Имя"
              aria-label={L.nameField}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoComplete="name"
              required
              error={fieldErrors.name?.join(', ')}
              className={styles.fieldInput}
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ваш email"
              aria-label={C.emailField}
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              autoComplete="email"
              required
              error={fieldErrors.email?.join(', ')}
              className={styles.fieldInput}
            />
            <div className={styles.actions}>
              <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
                Получить код
              </Button>
            </div>
          </form>
        </>
      )}

      {step === 'code' && (
        <OtpStep
          title={L.confirmTitle}
          subtitle={`Код подтверждения отправлен на ${email}`}
          otp={otp}
          error={error}
          loading={loading}
          onBack={goBackToForm}
        />
      )}

    </main>
  )
}
