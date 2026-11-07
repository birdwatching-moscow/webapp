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
  LOGIN_CODE_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/lib/constants'
import { AUTH_ERROR_ACCOUNT_BLOCKED, AUTH_ERROR_PASSWORD_RESET_REQUIRED } from '@/lib/auth/errors'
import { useAuthForm } from '@/hooks/useAuthForm'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { Button } from '@/components/ui/buttons/Button'
import { Input } from '@/components/ui/input/Input'
import { AUTH_LABELS } from '@/lib/auth-labels'
import styles from './login.module.css'

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
  const [csrfToken, setCsrfToken] = useState('')
  const [digits, setDigits] = useState<string[]>(Array(LOGIN_CODE_LENGTH).fill(''))
  const digitRefs = useRef<Array<HTMLInputElement | null>>(Array(LOGIN_CODE_LENGTH).fill(null))
  const [challengeToken, setChallengeToken] = useState('')
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const newPasswordInputRef = useRef<HTMLInputElement>(null)

  const isRegistered = searchParams.get(REGISTERED_PARAM) === '1'

  useEffect(() => {
    if (step === 'code') digitRefs.current[0]?.focus()
  }, [step])

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
      let csrfData: { csrfToken?: string } = {}
      try { csrfData = await res.json() } catch { /* no body */ }
      setCsrfToken(csrfData.csrfToken ?? '')
      setEmail(address)
      setDigits(Array(LOGIN_CODE_LENGTH).fill(''))
      setStep('code')
    })
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
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
        setError(AUTH_ERRORS.invalidCode)
        setDigits(Array(LOGIN_CODE_LENGTH).fill(''))
        setTimeout(() => digitRefs.current[0]?.focus(), 0)
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

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length > 1) {
      const newDigits = [...digits]
      for (let i = 0; i < cleaned.length && index + i < LOGIN_CODE_LENGTH; i++) {
        newDigits[index + i] = cleaned[i]
      }
      setDigits(newDigits)
      const nextFocus = Math.min(index + cleaned.length, LOGIN_CODE_LENGTH - 1)
      digitRefs.current[nextFocus]?.focus()
      if (newDigits.every(d => d !== '')) {
        submitCode(newDigits.join(''))
      }
      return
    }

    const digit = cleaned.slice(0, 1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)

    if (digit && index < LOGIN_CODE_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus()
    }

    if (newDigits.every(d => d !== '') && digit) {
      submitCode(newDigits.join(''))
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      digitRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < LOGIN_CODE_LENGTH - 1) {
      e.preventDefault()
      digitRefs.current[index + 1]?.focus()
    }
  }

  function handleDigitPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LOGIN_CODE_LENGTH)
    if (!pasted) return
    const newDigits = Array(LOGIN_CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)
    const nextFocus = Math.min(pasted.length, LOGIN_CODE_LENGTH - 1)
    digitRefs.current[nextFocus]?.focus()
    if (newDigits.every(d => d !== '')) {
      submitCode(newDigits.join(''))
    }
  }

  function goBackToEmail() {
    setStep('email')
    setDigits(Array(LOGIN_CODE_LENGTH).fill(''))
    setError(null)
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleSetPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
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
                : 'Введите почту, чтобы получить код для входа'}
            </p>
          </div>

          {error && <p role="alert" className={styles.errorMsg}>{error}</p>}

          <form onSubmit={handleEmailSubmit} className={styles.form}>
            <Input
              id="email"
              name="email"
              type="email"
              label={C.emailField}
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              autoComplete="email"
              required
            />
            <div className={styles.actions}>
              <Button type="submit" fullWidth loading={loading} disabled={loading}>
                Получить код
              </Button>
              <Button as="a" href={ROUTES.register} variant="secondary" fullWidth>
                Зарегистрироваться
              </Button>
            </div>
          </form>
        </>
      )}

      {step === 'code' && (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Введите код</h1>
            <p className={styles.subtitle}>
              Если вы зарегистрированы, на {email} придёт код
            </p>
          </div>

          {error && <p role="alert" className={styles.errorMsg}>{error}</p>}

          <div className={styles.otpRow} role="group" aria-label="Код подтверждения">
            {Array.from({ length: LOGIN_CODE_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={el => { digitRefs.current[i] = el }}
                className={[styles.otpBox, error ? styles.otpBoxError : ''].filter(Boolean).join(' ')}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={LOGIN_CODE_LENGTH}
                value={digits[i]}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleDigitKeyDown(i, e)}
                onPaste={handleDigitPaste}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                disabled={loading}
                aria-label={`Цифра ${i + 1} из ${LOGIN_CODE_LENGTH}`}
              />
            ))}
          </div>

          <p className={styles.hint}>
            Код действует ограниченное время. Проверьте «Спам» и «Промоакции».
          </p>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              type="button"
              fullWidth
              onClick={goBackToEmail}
              disabled={loading}
            >
              Назад
            </Button>
          </div>
        </>
      )}

      {step === 'password' && (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>{LA.title}</h1>
          </div>

          {error && <p role="alert" className={styles.errorMsg}>{error}</p>}

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

          {error && <p role="alert" className={styles.errorMsg}>{error}</p>}

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
