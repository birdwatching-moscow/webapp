'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthForm } from '@/hooks/useAuthForm'
import { ROUTES } from '@/utils/routes'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { PASSWORD_MIN_LENGTH, HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'
import { Button } from '@/components/ui/buttons/Button'
import { Input } from '@/components/ui/input/Input'
import { FormError } from '@/components/ui/form-error/FormError'
import styles from '../../auth-page.module.css'

const L = AUTH_LABELS.resetConfirm
const C = AUTH_LABELS.common

async function safeJsonParse<T = unknown>(res: Response): Promise<T | null> {
  try {
    const text = await res.text()
    return text ? (JSON.parse(text) as T) : null
  } catch {
    return null
  }
}

export default function ConfirmResetPage() {
  const router = useRouter()
  const params = useParams<{ token: string }>()
  const { error, setError, loading, run } = useAuthForm()
  const [passwordInput, setPasswordInput] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    await run(async () => {
      const res = await fetch('/api/auth/reset-password', {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          token: params.token,
          newPassword: passwordInput,
        }),
      })

      if (res.ok) {
        router.push('/login?passwordReset=1')
        return
      }

      const data = await safeJsonParse<{ error?: string }>(res)

      if (data?.error) {
        setError(data.error)
      } else {
        setError(AUTH_ERRORS.generic)
      }
    })
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>{L.title}</h1>
      </div>

      <FormError message={error} />

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={L.newPasswordField}
          aria-label={L.newPasswordField}
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
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
