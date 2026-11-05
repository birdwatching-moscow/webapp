import type { Metadata } from 'next'

const TITLE = 'СМИ и материалы о бердвотчинге'

export const metadata: Metadata = {
  title: `${TITLE} | Birdwatching Moscow`,
}

export default function MediaPage() {
  return (
    <main>
      <h1 className="text-display">{TITLE}</h1>
    </main>
  )
}
