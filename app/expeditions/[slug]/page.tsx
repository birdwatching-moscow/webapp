import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Экспедиция | Birdwatching Moscow',
}

export default async function ExpeditionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await params
  return <main />
}
