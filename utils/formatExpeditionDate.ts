const MOS_TZ = 'Europe/Moscow'

function fmt(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: MOS_TZ })
}

export function formatExpeditionDate(startsAt: Date, endsAt: Date | null): string {
  const startFull = fmt(startsAt)
  if (!endsAt) return startFull

  const endFull = fmt(endsAt)

  const sameMonth =
    startsAt.getFullYear() === endsAt.getFullYear() &&
    startsAt.getMonth() === endsAt.getMonth()

  if (sameMonth) {
    const startDay = startFull.split(' ')[0]
    return `${startDay}–${endFull}`
  }
  return `${startFull} – ${endFull}`
}
