'use client'

import { useState } from 'react'
import {
  type ProfileLinkPlatform,
  PROFILE_LINK_PLATFORMS,
  detectProfileLinkPlatform,
} from '@/utils/profileLink'
import styles from './member-edit.module.css'

export function ProfileLinkField({ defaultValue }: { defaultValue: string }) {
  const [platform, setPlatform] = useState<ProfileLinkPlatform>(
    () => detectProfileLinkPlatform(defaultValue)
  )

  const placeholder = PROFILE_LINK_PLATFORMS.find((p) => p.value === platform)!.placeholder

  return (
    <div className={styles.profileLinkRow}>
      <select
        className={styles.select}
        value={platform}
        onChange={(e) => setPlatform(e.target.value as ProfileLinkPlatform)}
      >
        {PROFILE_LINK_PLATFORMS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <input
        type="url"
        name="profileLink"
        className={styles.input}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  )
}
