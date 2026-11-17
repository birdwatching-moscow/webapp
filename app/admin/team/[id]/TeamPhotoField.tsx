'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/admin/ImageUpload'

export function TeamPhotoField({ defaultValue }: { defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue)
  return (
    <>
      <ImageUpload folder="team" value={url} onChange={setUrl} targetWidth={200} targetHeight={200} />
      <input type="hidden" name="photoUrl" value={url} readOnly />
    </>
  )
}
