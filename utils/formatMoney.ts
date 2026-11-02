const KOPECKS_PER_RUBLE = 100

const ruFormatter = new Intl.NumberFormat('ru-RU')

export function formatKopecksRu(kopecks: number): string {
  const rubles = Math.trunc(kopecks / KOPECKS_PER_RUBLE)
  const remainder = Math.abs(kopecks % KOPECKS_PER_RUBLE)
  const decimals = remainder.toString().padStart(2, '0')
  return `${ruFormatter.format(rubles)},${decimals} ₽`
}
