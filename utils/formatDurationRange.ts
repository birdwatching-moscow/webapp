export function formatDurationRange(startsAt: Date, endsAt: Date): string {
  const durationHours = (endsAt.getTime() - startsAt.getTime()) / (1000 * 60 * 60)
  const upper = Math.ceil(durationHours * 2) / 2
  const lower = upper - 0.5

  const fmtNum = (h: number) => (h % 1 === 0 ? String(h) : String(h))

  let word: string
  if (upper % 1 !== 0) {
    word = 'часа'
  } else {
    const mod10 = upper % 10
    const mod100 = upper % 100
    if (mod10 === 1 && mod100 !== 11) word = 'час'
    else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) word = 'часа'
    else word = 'часов'
  }

  return `${fmtNum(lower)}–${fmtNum(upper)} ${word}`
}
