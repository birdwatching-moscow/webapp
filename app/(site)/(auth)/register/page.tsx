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
import { validateEmail, validateName } from '@/utils/validateAuthFields'
import styles from '../auth-page.module.css'

const L = AUTH_LABELS.register
const C = AUTH_LABELS.common

type RegisterStep = 'form' | 'code'

export default function RegisterPage() {
  const router = useRouter()
  const { error, setError, loading, run } = useAuthForm()
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [step, setStep] = useState<RegisterStep>('form')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [canResend, setCanResend] = useState(false)
  const otp = useOtpInput(submitCode)

  useEffect(() => {
    if (step === 'code') otp.digitRefs.current[0]?.focus()
  }, [step, otp.digitRefs])

  async function handleFormSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextNameError = validateName(nameInput)
    const nextEmailError = validateEmail(emailInput)
    setNameError(nextNameError ?? '')
    setEmailError(nextEmailError ?? '')
    if (nextNameError || nextEmailError) return

    const trimmedName = nameInput.trim()
    const trimmedEmail = emailInput.trim()

    await run(async () => {
      const res = await fetch('/api/auth/register', {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({ email: trimmedEmail, name: trimmedName }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null) as
          { error?: string; issues?: Partial<Record<'name' | 'email', string[]>> } | null
        if (data?.error === 'code_rate_limited') {
          setEmailError(AUTH_ERRORS.tooManyAttempts)
        } else if (data?.issues) {
          setNameError(data.issues.name?.join(', ') ?? '')
          setEmailError(data.issues.email?.join(', ') ?? '')
        } else {
          setError(AUTH_ERRORS.generic)
        }
        return
      }

      const data = await res.json()
      setCsrfToken(data.csrfToken ?? '')
      setEmail(trimmedEmail)
      setName(trimmedName)
      otp.reset()
      setStep('code')
    })
  }

  /** Wrong/expired code: show the error, clear the boxes and offer a resend. */
  function rejectCode(message: string) {
    setError(message)
    setCanResend(true)
    otp.reset({ focus: true })
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
        rejectCode(mapOtpVerifyError(verifyData.error))
        return
      }

      const result = await signIn(LOGIN_CODE_PROVIDER_ID, { email, code, redirect: false })
      if (result?.error) {
        rejectCode(AUTH_ERRORS.invalidCode)
      } else {
        router.push('/profile')
        router.refresh()
      }
    })
  }

  async function resendCode() {
    await run(async () => {
      const res = await fetch('/api/auth/register', {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json().catch(() => ({})) as { csrfToken?: string; error?: string }
      if (!res.ok) {
        setError(data.error === 'code_rate_limited' ? AUTH_ERRORS.codeTooFrequent : AUTH_ERRORS.generic)
        return
      }
      setCsrfToken(data.csrfToken ?? '')
      setCanResend(false)
      otp.reset({ focus: true })
    })
  }

  function goBackToForm() {
    setStep('form')
    otp.reset()
    setError(null)
    setCanResend(false)
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

          <form onSubmit={handleFormSubmit} className={styles.form} noValidate>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Имя"
              aria-label={L.nameField}
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); setNameError('') }}
              autoComplete="name"
              required
              error={nameError}
              className={styles.fieldInput}
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ваш email"
              aria-label={C.emailField}
              value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setEmailError('') }}
              autoComplete="email"
              required
              error={emailError}
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
          onResend={canResend ? resendCode : undefined}
        />
      )}

    </main>
  )
}
