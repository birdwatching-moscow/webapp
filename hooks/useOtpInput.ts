import { useState, useRef } from 'react'
import { LOGIN_CODE_LENGTH } from '@/lib/constants'

export function useOtpInput(onComplete: (code: string) => void) {
  const [digits, setDigits] = useState<string[]>(Array(LOGIN_CODE_LENGTH).fill(''))
  const digitRefs = useRef<Array<HTMLInputElement | null>>(Array(LOGIN_CODE_LENGTH).fill(null))

  function reset({ focus = false }: { focus?: boolean } = {}) {
    setDigits(Array(LOGIN_CODE_LENGTH).fill(''))
    if (focus) setTimeout(() => digitRefs.current[0]?.focus(), 0)
  }

  function handleChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length > 1) {
      const newDigits = [...digits]
      for (let i = 0; i < cleaned.length && index + i < LOGIN_CODE_LENGTH; i++) {
        newDigits[index + i] = cleaned[i]
      }
      setDigits(newDigits)
      digitRefs.current[Math.min(index + cleaned.length, LOGIN_CODE_LENGTH - 1)]?.focus()
      if (newDigits.every(d => d !== '')) onComplete(newDigits.join(''))
      return
    }

    const digit = cleaned.slice(0, 1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)

    if (digit && index < LOGIN_CODE_LENGTH - 1) digitRefs.current[index + 1]?.focus()
    if (newDigits.every(d => d !== '') && digit) onComplete(newDigits.join(''))
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
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

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LOGIN_CODE_LENGTH)
    if (!pasted) return
    const newDigits = Array(LOGIN_CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i]
    setDigits(newDigits)
    digitRefs.current[Math.min(pasted.length, LOGIN_CODE_LENGTH - 1)]?.focus()
    if (newDigits.every(d => d !== '')) onComplete(newDigits.join(''))
  }

  return { digits, digitRefs, reset, handleChange, handleKeyDown, handlePaste }
}
