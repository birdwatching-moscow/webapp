const MOS_TZ = 'Europe/Moscow'

function fmt(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: MOS_TZ })
}

function year(d: Date): number {
  return new Date(d.toLocaleString('en-US', { timeZone: MOS_TZ })).getFullYear()
}

export function formatExpeditionDate(startsAt: Date, endsAt: Date | null): string {
  const startFull = fmt(startsAt)
  if (!endsAt) return `${startFull} ${year(startsAt)}`

  const endFull = fmt(endsAt)
  const endYear = year(endsAt)

  const sameMonth =
    startsAt.getFullYear() === endsAt.getFullYear() &&
    startsAt.getMonth() === endsAt.getMonth()

  if (sameMonth) {
    const startDay = startFull.split(' ')[0]
    return `${startDay}–${endFull} ${endYear}`
  }
  return `${startFull} – ${endFull} ${endYear}`
}
