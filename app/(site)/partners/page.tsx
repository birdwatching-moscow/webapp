import type { Metadata } from 'next'

const TITLE = 'Друзья и партнёры проекта'

export const metadata: Metadata = {
  title: `${TITLE} | Birdwatching Moscow`,
}

export default function PartnersPage() {
  return (
    <main>
      <h1 className="text-display">{TITLE}</h1>
    </main>
  )
}
