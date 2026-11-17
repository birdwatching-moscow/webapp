'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthForm } from '@/hooks/useAuthForm'
import { ROUTES, API_ROUTES } from '@/utils/routes'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'
import { useNewPasswordFields } from '@/hooks/useNewPasswordFields'
import { NewPasswordFields } from '@/components/auth/NewPasswordFields'
import { Button } from '@/components/ui/buttons/Button'
import { FormError } from '@/components/ui/form-error/FormError'
import styles from '../../../auth-page.module.css'

const L = AUTH_LABELS.resetConfirm
const C = AUTH_LABELS.common

const INVALID_LINK_CODE = 'invalid_link'

type ResetErrorBody = {
  error?: string
  code?: string
  issues?: { newPassword?: string[] }
}

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
  const fields = useNewPasswordFields()
  const [linkInvalid, setLinkInvalid] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!fields.validate()) return

    await run(async () => {
      const res = await fetch(API_ROUTES.resetPassword, {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          token: params.token,
          newPassword: fields.password,
        }),
      })

      if (res.ok) {
        router.push('/login?passwordReset=1')
        return
      }

      // Never show the server's own (English) text — map it to our messages.
      const data = await safeJsonParse<ResetErrorBody>(res)

      if (data?.code === INVALID_LINK_CODE) {
        setLinkInvalid(true)
        setError(AUTH_ERRORS.resetLinkInvalid)
      } else if (data?.issues?.newPassword) {
        // Server rules match the client ones; this only happens if they drift.
        fields.setPasswordError(AUTH_LABELS.adminSetPassword.tooShort)
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

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <NewPasswordFields fields={fields} disabled={loading} inputClassName={styles.fieldInput} />
        <div className={styles.actions}>
          {linkInvalid ? (
            <Button as="a" href={ROUTES.resetPassword} size="lg" fullWidth>
              {L.requestNewLink}
            </Button>
          ) : (
            <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
              {loading ? L.submitting : L.submit}
            </Button>
          )}
          <Button as="a" href={ROUTES.login} variant="outline" size="lg" fullWidth>
            {C.backToLogin}
          </Button>
        </div>
      </form>
    </main>
  )
}
