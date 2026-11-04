const MOS_TZ = 'Europe/Moscow'

export function formatWalkDate(startsAt: Date, endsAt: Date | null): string {
  const date = startsAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: MOS_TZ,
  })
  const startTime = startsAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MOS_TZ,
  })

  if (!endsAt) return `${date} · ${startTime}`

  const endTime = endsAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MOS_TZ,
  })
  return `${date} · ${startTime}–${endTime}`
}
