'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input/Input'
import { PasswordVisibilityButton } from '@/components/auth/PasswordVisibilityButton'
import { AUTH_LABELS } from '@/lib/auth-labels'
import type { NewPasswordFieldsState } from '@/hooks/useNewPasswordFields'

const ASP = AUTH_LABELS.adminSetPassword

type Props = {
  fields: NewPasswordFieldsState
  disabled?: boolean
  inputClassName?: string
}

/**
 * "Новый пароль" + "Подтвердите пароль" with show/hide buttons. Shared by the
 * first admin password (/login) and the reset-link page so both behave the same.
 */
export const NewPasswordFields = ({ fields, disabled, inputClassName }: Props) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <Input
        id="newPassword"
        name="newPassword"
        type={showPassword ? 'text' : 'password'}
        label={ASP.passwordField}
        value={fields.password}
        onChange={e => fields.onPasswordChange(e.target.value)}
        autoComplete="new-password"
        disabled={disabled}
        error={fields.passwordError || undefined}
        invalid={Boolean(fields.confirmError)}
        className={inputClassName}
        trailing={<PasswordVisibilityButton visible={showPassword} onToggle={() => setShowPassword(v => !v)} />}
      />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type={showConfirm ? 'text' : 'password'}
        label={ASP.confirmField}
        value={fields.confirm}
        onChange={e => fields.onConfirmChange(e.target.value)}
        autoComplete="new-password"
        disabled={disabled}
        error={fields.confirmError || undefined}
        invalid={Boolean(fields.passwordError)}
        className={inputClassName}
        trailing={<PasswordVisibilityButton visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
      />
    </>
  )
}
