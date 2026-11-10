'use client'

import { useState } from 'react'
import styles from './member-edit.module.css'

type Platform = 'ebird' | 'rubirds'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'ebird',   label: 'eBird' },
  { value: 'rubirds', label: 'RU-BIRDS' },
]

const PLACEHOLDERS: Record<Platform, string> = {
  ebird:   'https://ebird.org/profile/...',
  rubirds: 'https://ru-birds.ru/users/...',
}

function detectPlatform(url: string): Platform {
  if (url.includes('ru-birds.ru')) return 'rubirds'
  return 'ebird'
}

export function ProfileLinkField({ defaultValue }: { defaultValue: string }) {
  const [platform, setPlatform] = useState<Platform>(() => detectPlatform(defaultValue))

  return (
    <div className={styles.profileLinkRow}>
      <select
        className={styles.select}
        value={platform}
        onChange={e => setPlatform(e.target.value as Platform)}
      >
        {PLATFORMS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <input
        type="url"
        name="profileLink"
        className={styles.input}
        defaultValue={defaultValue}
        placeholder={PLACEHOLDERS[platform]}
      />
    </div>
  )
}
