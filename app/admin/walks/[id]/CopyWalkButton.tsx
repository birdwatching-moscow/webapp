'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { copyWalk } from '@/app/admin/walks/_actions'

interface Props {
  walkId: string
  disabled?: boolean
  onError: (msg: string) => void
  onSuccess: () => void
}

export function CopyWalkButton({ walkId, disabled, onError, onSuccess }: Props) {
  const [pending, start] = useTransition()

  function handleCopy() {
    start(async () => {
      try {
        await copyWalk(walkId)
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
