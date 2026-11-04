const END_TIME_RE = /^\d{2}:\d{2}$/

export function formatWalkDate(startsAt: Date, duration: string | null): string {
  const date = startsAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  })
  const time = startsAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })

  if (!duration) return `${date} · ${time}`
  if (END_TIME_RE.test(duration)) return `${date} · ${time}–${duration}`
  return `${date} · ${time} (${duration})`
}
