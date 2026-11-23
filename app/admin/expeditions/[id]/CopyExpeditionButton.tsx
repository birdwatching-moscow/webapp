'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { copyExpedition } from '@/app/admin/expeditions/_actions'

interface Props {
  expeditionId: string
  disabled?: boolean
  onError: (msg: string) => void
  onSuccess: () => void
}

export function CopyExpeditionButton({ expeditionId, disabled, onError, onSuccess }: Props) {
  const [pending, start] = useTransition()

  function handleCopy() {
    start(async () => {
      try {
        await copyExpedition(expeditionId)
        onSuccess()
      } catch (e) {
        onError(e instanceof Error ? e.message : 'Ошибка при копировании')
      }
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={handleCopy} disabled={disabled || pending}>
      {pending ? 'Копирование…' : 'Копировать'}
    </Button>
  )
}
