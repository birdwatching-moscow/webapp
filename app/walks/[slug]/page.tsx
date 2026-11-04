import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Прогулка | Birdwatching Moscow',
}

export default async function WalkPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <main>
      <p>Прогулка: {slug}</p>
    </main>
  )
}
