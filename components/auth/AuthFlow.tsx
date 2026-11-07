'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/input/Input'
import { Button } from '@/components/ui/buttons/Button'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { requestLoginCode, register } from '@/lib/api/auth'
import styles from './AuthFlow.module.css'

export type AuthFlowStep = 'sign-in' | 'sign-up' | 'otp'
export type AuthFlowContext = 'purchase' | 'screen'

export type AuthFlowProps = {
  flow: AuthFlowStep
  context: AuthFlowContext
  email?: string
  onFlowChange: (step: AuthFlowStep, email: string) => void
  onSuccess: () => void
}

type OtpError = 'idle' | 'wrong' | 'limit'

const MAX_OTP_ATTEMPTS = 5

export const AuthFlow = ({ flow, email, onFlowChange, onSuccess }: AuthFlowProps) => {
  const [emailInput, setEmailInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<OtpError>('idle')
  const [attempts, setAttempts] = useState(0)

  const handleSignIn = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    try {
      await requestLoginCode({ email: emailInput })
      onFlowChange('otp', emailInput)
    } catch {
      setFormError(AUTH_ERRORS.network)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    try {
      await register({ name: nameInput, email: emailInput })
    } catch (err: unknown) {
      setFormError(AUTH_ERRORS.network)
      setLoading(false)
      return
    }
    try {
      await requestLoginCode({ email: emailInput })
      onFlowChange('otp', emailInput)
    } catch {
      setFormError(AUTH_ERRORS.network)
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('login-code', { email, code: codeInput, redirect: false })
      if (result?.error) {
        const next = attempts + 1
        setAttempts(next)
        setOtpError(next >= MAX_OTP_ATTEMPTS ? 'limit' : 'wrong')
      } else {
        onSuccess()
      }
    } catch {
      setFormError(AUTH_ERRORS.generic)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setOtpError('idle')
    setAttempts(0)
    await requestLoginCode({ email: email! })
  }

  const handleBack = () => {
    onFlowChange('sign-in', email ?? '')
  }

  if (flow === 'sign-in') {
    return (
      <div className={styles.card}>
        <form onSubmit={handleSignIn}>
          <Input
            id="sign-in-email"
            label={AUTH_LABELS.common.emailField}
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            type="email"
            disabled={loading}
            error={formError ?? undefined}
          />
          <Button type="submit" loading={loading}>
            {AUTH_LABELS.loginCode.requestCode}
          </Button>
        </form>
      </div>
    )
  }

  if (flow === 'sign-up') {
    return (
      <div className={styles.card}>
        <form onSubmit={handleSignUp}>
          <Input
            id="sign-up-name"
            label={AUTH_LABELS.register.nameField}
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            disabled={loading}
          />
          <Input
            id="sign-up-email"
            label={AUTH_LABELS.common.emailField}
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            type="email"
            disabled={loading}
            error={formError ?? undefined}
          />
          <Button type="submit" loading={loading}>
            {AUTH_LABELS.register.submit}
          </Button>
        </form>
      </div>
    )
  }

  const isLimitReached = otpError === 'limit'

  return (
    <div className={styles.card}>
      <p>{email}</p>
      <form onSubmit={handleOtp}>
        <Input
          id="otp-code"
          label={AUTH_LABELS.loginCode.codeField}
          value={codeInput}
          onChange={e => setCodeInput(e.target.value)}
          maxLength={6}
          inputMode="text"
          autoComplete="one-time-code"
          disabled={loading || isLimitReached}
          error={otpError === 'wrong' ? AUTH_ERRORS.invalidCode : undefined}
        />
        {isLimitReached && (
          <p>Превышено количество попыток. Запросите новый код.</p>
        )}
        <Button type="submit" loading={loading} disabled={isLimitReached}>
          {AUTH_LABELS.loginCode.verify}
        </Button>
      </form>
      {!isLimitReached && (
        <button type="button" onClick={handleResend} disabled={loading}>
          {AUTH_LABELS.loginCode.resendCode}
        </button>
      )}
      <button type="button" onClick={handleBack}>
        {AUTH_LABELS.loginCode.changeEmail}
      </button>
    </div>
  )
}
