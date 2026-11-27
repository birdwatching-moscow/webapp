'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ExpeditionDayRow } from '@/lib/expeditions'
import styles from './ExpeditionProgramme.module.css'

type Props = {
  days: ExpeditionDayRow[]
  coverPhotoUrl: string
  title: string
  startsAt: Date
}

const RU_LOCALE = 'ru-RU'

function formatDayLabel(startsAt: Date, dayNumber: number): string {
  const date = new Date(startsAt)
  date.setDate(date.getDate() + dayNumber - 1)
  const datePart = date.toLocaleDateString(RU_LOCALE, { day: 'numeric', month: 'long' })
  const weekday = date.toLocaleDateString(RU_LOCALE, { weekday: 'long' })
  return `${datePart}, ${weekday}`
}

export const ExpeditionProgramme = ({ days, coverPhotoUrl, title, startsAt }: Props) => {
  const [activeIdx, setActiveIdx] = useState(0)

  if (days.length === 0) return null

  const activeDay = days[activeIdx]

  return (
    <section className={styles.section} aria-label="Программа">
      <h2 className={`text-h1 ${styles.heading}`}>Программа</h2>

      <div className={styles.tabs} role="tablist">
        {days.map((day, i) => (
          <button
            key={day.id}
            role="tab"
            aria-selected={i === activeIdx}
            className={[styles.tab, i === activeIdx && styles.tabActive].filter(Boolean).join(' ')}
            onClick={() => setActiveIdx(i)}
          >
            {`${day.dayNumber} день`}
          </button>
        ))}
      </div>

      <div className={styles.content} role="tabpanel">
        <div className={styles.dayText}>
          <p className={`text-label ${styles.dayNumber}`}>
            {formatDayLabel(startsAt, activeDay.dayNumber)}
          </p>
          <h3 className={`text-h2 ${styles.dayTitle}`}>{activeDay.title}</h3>
          <p className={`text-body-l ${styles.dayDescription}`}>{activeDay.description}</p>
        </div>

        <div className={styles.photo}>
          <Image
            src={coverPhotoUrl}
            alt={title}
            fill
            className={styles.photoImg}
            sizes="(min-width: 1248px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  )
}
