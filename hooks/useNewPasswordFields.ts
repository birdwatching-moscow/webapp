'use client'

import { useState } from 'react'
import { latinOnlyError, validateNewPasswordPair } from '@/utils/validateAuthFields'

/**
 * State and rules for the "new password + confirm" pair used when an admin
 * sets a password (first login on /login, and the reset link page).
 */
export function useNewPasswordFields() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const onPasswordChange = (value: string) => {
    setPassword(value)
    setPasswordError(latinOnlyError(value))
  }

  const onConfirmChange = (value: string) => {
    setConfirm(value)
    setConfirmError(latinOnlyError(value))
  }

  /** Runs all rules, shows the errors and returns true when the pair is valid. */
  const validate = (): boolean => {
    const result = validateNewPasswordPair(password, confirm)
    setPasswordError(result.passwordError)
    setConfirmError(result.confirmError)
    return !result.passwordError && !result.confirmError
  }

  return {
    password,
    confirm,
    passwordError,
    confirmError,
    onPasswordChange,
    onConfirmChange,
    setPasswordError,
    validate,
  }
}

export type NewPasswordFieldsState = ReturnType<typeof useNewPasswordFields>
