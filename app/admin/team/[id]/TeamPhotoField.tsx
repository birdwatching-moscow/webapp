'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/admin/ImageUpload'

export function TeamPhotoField({ defaultValue, onDirty }: { defaultValue: string; onDirty?: () => void }) {
  const [url, setUrl] = useState(defaultValue)
  return (
    <>
      <ImageUpload
        folder="team"
        value={url}
        onChange={v => { setUrl(v); onDirty?.() }}
        targetWidth={200}
        targetHeight={200}
      />
      <input type="hidden" name="photoUrl" value={url} readOnly />
    </>
  )
}
