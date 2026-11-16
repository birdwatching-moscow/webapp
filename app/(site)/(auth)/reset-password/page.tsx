'use client'

import { useState } from 'react'
import { useAuthForm } from '@/hooks/useAuthForm'
import { ROUTES } from '@/utils/routes'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'
import { Button } from '@/components/ui/buttons/Button'
import { Input } from '@/components/ui/input/Input'
import { FormError } from '@/components/ui/form-error/FormError'
import styles from '../auth-page.module.css'

const L = AUTH_LABELS.resetRequest
const C = AUTH_LABELS.common

export default function RequestResetPage() {
  const { error, setError, loading, run } = useAuthForm()
  const [success, setSuccess] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    await run(async () => {
      const res = await fetch('/api/auth/request-password-reset', {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({ email: emailInput }),
      })

      if (res.ok) {
        setSuccess(true)
        return
      }

      setError(AUTH_ERRORS.generic)
    })
  }

  if (success) {
    return (
      <main className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.title}>{L.successTitle}</h1>
          <p className={styles.subtitle}>{L.successText}</p>
        </div>
        <Button as="a" href={ROUTES.login} variant="outline" size="lg" fullWidth>
          {C.backToLogin}
        </Button>
      </main>
    )
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>{L.title}</h1>
        <p className={styles.subtitle}>{L.description}</p>
      </div>

      <FormError message={error} />

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={C.emailField}
          aria-label={C.emailField}
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          autoComplete="email"
          required
          className={styles.fieldInput}
        />
        <div className={styles.actions}>
          <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
            {loading ? L.submitting : L.submit}
          </Button>
          <Button as="a" href={ROUTES.login} variant="outline" size="lg" fullWidth>
            {C.backToLogin}
          </Button>
        </div>
      </form>
    </main>
  )
}
