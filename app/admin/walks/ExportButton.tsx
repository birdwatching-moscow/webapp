'use client'

import { useState } from 'react'

interface Props {
  href: string
  className: string
}

const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function ExportButton({ href, className }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const res  = await fetch(href)
      const { b64, filename } = await res.json() as { b64: string; filename: string }
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
      const blob  = new Blob([bytes], { type: MIME })
      const url   = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      a.href     = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Загрузка…' : 'Скачать Excel'}
    </button>
  )
}
