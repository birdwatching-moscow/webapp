export type PrivateLecture = {
  title: string
  /** Format and venue */
  subtitle: string
  /** Recording page, opened in a new tab; no URL — the card shows a placeholder */
  videoUrl?: string
  /** Shown larger than the rest — desktop only */
  featured?: boolean
}

// Content from the Figma design; videos are not wired up yet — cards show a placeholder.
const AI_DISCUSSION: PrivateLecture = {
  title: 'Искусство нечеловеческих агентов: как подружить нейросети и птиц',
  subtitle: 'Дискуссия, Garage MCA',
}

export const PRIVATE_LECTURES: readonly PrivateLecture[] = [
  { title: 'Природа на остановке!', subtitle: 'Поп-ап-инсталляция, Северный речной вокзал, МТМ' },
  AI_DISCUSSION,
  AI_DISCUSSION,
  AI_DISCUSSION,
  AI_DISCUSSION,
  AI_DISCUSSION,
  {
    title: 'Как стать бердвотчером',
    subtitle: 'Лекция и утренняя прогулка, Республиканская детская библиотека, Ташкент',
    featured: true,
  },
]
