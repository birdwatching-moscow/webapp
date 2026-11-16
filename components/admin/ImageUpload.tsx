'use client'

import { useRef, useState } from 'react'
import styles from './ImageUpload.module.css'

type Folder = 'walks' | 'expeditions' | 'team'

interface Props {
  folder: Folder
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  required?: boolean
  targetWidth?: number
  targetHeight?: number
}

export function ImageUpload({ folder, value, onChange, disabled, required, targetWidth = 600, targetHeight = 450 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function resizeToTarget(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight
        const ctx = canvas.getContext('2d')!
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
        const sw = targetWidth / scale
        const sh = targetHeight / scale
        const sx = (img.width - sw) / 2
        const sy = (img.height - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight)
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('canvas toBlob failed')), 'image/jpeg', 0.9)
      }
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('image load failed')) }
      img.src = objectUrl
    })
  }

  async function upload(file: File) {
    setError(null)
    setUploading(true)
    try {
      const blob = await resizeToTarget(file)
      const form = new FormData()
      form.append('file', new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      const res = await fetch(`/api/admin/upload?folder=${folder}`, { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Ошибка загрузки')
      onChange(json.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return
    upload(files[0])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (!disabled) handleFiles(e.dataTransfer.files)
  }

  const zoneClass = [
    styles.zone,
    dragOver ? styles.dragOver : '',
    disabled ? styles.zoneDisabled : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.root}>
      <div
        className={zoneClass}
        style={{ aspectRatio: `${targetWidth} / ${targetHeight}` }}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
        aria-label="Загрузить фото"
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className={styles.preview} />
            {!disabled && (
              <div className={styles.overlay}>
                <span className={styles.overlayLabel}>
                  {uploading ? 'Загрузка…' : 'Изменить'}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5zM12.75 6.75h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className={styles.emptyLabel}>
              {uploading ? 'Загрузка…' : 'Перетащите фото или нажмите для выбора'}
            </span>
            <span className={styles.emptyHint}>JPEG, PNG, WebP · до 5 МБ</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={styles.fileInput}
        onChange={e => handleFiles(e.target.files)}
        disabled={disabled || uploading}
      />

      <div className={styles.urlRow}>
        <span className={styles.urlLabel}>или вставьте ссылку</span>
        <input
          type="url"
          className={styles.urlInput}
          value={value}
          onChange={e => { setError(null); onChange(e.target.value) }}
          disabled={disabled}
          placeholder="https://..."
          required={required && !value}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
