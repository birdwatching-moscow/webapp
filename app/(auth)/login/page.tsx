'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { ROUTES } from '@/utils/routes'
import { useRouter, useSearchParams } from 'next/navigation'
import { safeRedirect } from '@/utils/safeRedirect'
import {
  RETURN_URL_PARAM,
  CALLBACK_URL_PARAM,
  REGISTERED_PARAM,
  HTTP_METHOD,
  JSON_HEADERS,
  LOGIN_CODE_PROVIDER_ID,
  ADMIN_2FA_PROVIDER_ID,
  PASSWORD_MIN_LENGTH,
} from '@/lib/constants'
import { AUTH_ERROR_ACCOUNT_BLOCKED, AUTH_ERROR_PASSWORD_RESET_REQUIRED } from '@/lib/auth/errors'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useOtpInput } from '@/hooks/useOtpInput'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { Button } from '@/components/ui/buttons/Button'
import { Input } from '@/components/ui/input/Input'
import { FormError } from '@/components/ui/form-error/FormError'
import { OtpStep } from '@/components/auth/OtpStep'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { mapOtpVerifyError } from '@/lib/auth/mapOtpVerifyError'
import styles from '../auth-page.module.css'

const LA = AUTH_LABELS.adminPassword
const ASP = AUTH_LABELS.adminSetPassword
const C = AUTH_LABELS.common

type LoginStep = 'email' | 'code' | 'password' | 'set-password'

function LoginCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = safeRedirect(
    searchParams.get(RETURN_URL_PARAM) ?? searchParams.get(CALLBACK_URL_PARAM)
  )
  const { error, setError, loading, run } = useAuthForm()
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [challengeToken, setChallengeToken] = useState('')
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const newPasswordInputRef = useRef<HTMLInputElement>(null)
  const otp = useOtpInput(submitCode)

  const isRegistered = searchParams.get(REGISTERED_PARAM) === '1'

  useEffect(() => {
    if (step === 'code') otp.digitRefs.current[0]?.focus()
  }, [step, otp.digitRefs])

  useEffect(() => {
    if (step === 'password') passwordInputRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (step === 'set-password') newPasswordInputRef.current?.focus()
  }, [step])

  async function requestCode(address: string) {
    await run(async () => {
      const res = await fetch('/api/auth/request-login-code', {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({ email: address }),
      })
      let resData: { csrfToken?: string; error?: string } = {}
      try { resData = await res.json() } catch { /* no body */ }
      if (!res.ok) {
        setError(resData.error === 'code_rate_limited' ? AUTH_ERRORS.codeTooFrequent : AUTH_ERRORS.generic)
        return
      }
      setCsrfToken(resData.csrfToken ?? '')
      setEmail(address)
      otp.reset()
      setStep('code')
    })
  }

  async function handleEmailSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailInput.trim()) {
      setEmailError('Введите почту, чтобы продолжить')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      setEmailError('Введите почту в формате name@example.ru')
      return
    }
    setEmailError('')
    await requestCode(emailInput)
  }

  async function submitCode(code: string) {
    await run(async () => {
      const verifyRes = await fetch('/api/auth/verify-login-code', {
        method: HTTP_METHOD.POST,
        headers: { ...JSON_HEADERS, 'x-csrf-token': csrfToken },
        body: JSON.stringify({ email, code }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setError(mapOtpVerifyError(verifyData.error))
        otp.reset({ focus: true })
        return
      }

      if (verifyData.next === 'password') {
        setChallengeToken(verifyData.challengeToken)
        setStep('password')
        return
      }

      if (verifyData.next === 'set-password') {
        setChallengeToken(verifyData.challengeToken)
        setStep('set-password')
        return
      }

      const result = await signIn(LOGIN_CODE_PROVIDER_ID, { email, code, redirect: false })
      if (result?.code === AUTH_ERROR_ACCOUNT_BLOCKED) {
        setError(AUTH_ERRORS.accountBlocked)
      } else if (result?.error) {
        setError(AUTH_ERRORS.invalidCode)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    })
  }

  function goBackToEmail() {
    setStep('email')
    otp.reset()
    setError(null)
  }

  async function handlePasswordSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password') ?? '')

    await run(async () => {
      const result = await signIn(ADMIN_2FA_PROVIDER_ID, {
        email,
        challengeToken,
        password,
        redirect: false,
      })
      if (result?.code === AUTH_ERROR_ACCOUNT_BLOCKED) {
        setError(AUTH_ERRORS.accountBlocked)
      } else if (result?.code === AUTH_ERROR_PASSWORD_RESET_REQUIRED) {
        setError(AUTH_ERRORS.passwordResetRequired)
      } else if (result?.error) {
        setError(AUTH_ERRORS.wrongCredentials)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    })
  }

  async function handleSetPasswordSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = String(form.get('newPassword') ?? '')
    const confirm = String(form.get('confirmPassword') ?? '')

    if (password !== confirm) {
      setError(ASP.mismatch)
      return
    }

    await run(async () => {
      const setRes = await fetch('/api/auth/set-initial-password', {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, challengeToken, password }),
      })
      if (!setRes.ok) {
        setError(AUTH_ERRORS.network)
        return
      }
      const setData = await setRes.json()

      const result = await signIn(ADMIN_2FA_PROVIDER_ID, {
        email,
        challengeToken: setData.challengeToken,
        password,
        redirect: false,
      })
      if (result?.code === AUTH_ERROR_ACCOUNT_BLOCKED) {
        setError(AUTH_ERRORS.accountBlocked)
      } else if (result?.code === AUTH_ERROR_PASSWORD_RESET_REQUIRED) {
        setError(AUTH_ERRORS.passwordResetRequired)
      } else if (result?.error) {
        setError(AUTH_ERRORS.wrongCredentials)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    })
  }

  return (
    <main className={styles.wrap}>

      {step === 'email' && (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Войти</h1>
            <p className={styles.subtitle}>
              {isRegistered
                ? 'Регистрация прошла успешно. Войдите в аккаунт.'
                : 'Введите почту, чтобы получить код для входа.'}
            </p>
          </div>

          <FormError message={error} />

          <form onSubmit={handleEmailSubmit} className={styles.form} noValidate>
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
              <Button as="a" href={ROUTES.register} variant="secondary" size="lg" fullWidth>
                Зарегистрироваться
              </Button>
            </div>
          </form>
        </>
      )}

      {step === 'code' && (
        <OtpStep
          title="Введите код"
          subtitle={`Если вы зарегистрированы, на ${email} придёт код`}
          otp={otp}
          error={error}
          loading={loading}
          onBack={goBackToEmail}
        />
      )}

      {step === 'password' && (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>{LA.title}</h1>
          </div>

          <FormError message={error} />

          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div>
              <label htmlFor="password">{C.passwordField}</label>
              <input
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <div className={styles.actions}>
              <Button type="submit" fullWidth loading={loading} disabled={loading}>
                {loading ? LA.submitting : LA.submit}
              </Button>
            </div>
          </form>
          <Link href={ROUTES.resetPassword}>Забыли пароль?</Link>
        </>
      )}

      {step === 'set-password' && (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>{ASP.title}</h1>
          </div>

          <FormError message={error} />

          <form onSubmit={handleSetPasswordSubmit} className={styles.form}>
            <div>
              <label htmlFor="newPassword">{ASP.passwordField}</label>
              <input
                ref={newPasswordInputRef}
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">{ASP.confirmField}</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
              />
            </div>
            <div className={styles.actions}>
              <Button type="submit" fullWidth loading={loading} disabled={loading}>
                {loading ? ASP.submitting : ASP.submit}
              </Button>
            </div>
          </form>
        </>
      )}

    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginCodeForm />
    </Suspense>
  )
}
