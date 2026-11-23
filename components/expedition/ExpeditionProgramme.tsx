'use client'

import { useState } from 'react'
import type { ExpeditionDayRow } from '@/lib/expeditions'
import { PhotoWithTextCredit } from '@/components/PhotoWithTextCredit/PhotoWithTextCredit'
import styles from './ExpeditionProgramme.module.css'

type Props = {
  days: ExpeditionDayRow[]
  coverPhotoUrl: string
  title: string
  startsAt: Date
}

function getDayLabel(startsAt: Date, dayNumber: number): string {
  const offset = dayNumber === 0 ? -1 : dayNumber - 1
  const d = new Date(startsAt.getTime() + offset * 86400000)
  const date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }).replace(' ', ' ')
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'long' })
  return `${date}, ${weekday}`.toUpperCase()
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
            {getDayLabel(startsAt, activeDay.dayNumber)}
          </p>
          <h3 className="text-h2">{activeDay.title}</h3>
          <p className={`text-body-l ${styles.dayDescription}`}>{activeDay.description}</p>
        </div>

        <div className={styles.photo}>
          <PhotoWithTextCredit
            src={activeDay.photoUrl ?? coverPhotoUrl}
            alt={activeDay.title || title}
            credit={activeDay.photoCredit ?? ''}
            sizes="(min-width: 1248px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  )
}
