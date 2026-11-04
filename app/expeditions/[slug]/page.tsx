import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getExpeditionTitle } from '@/lib/expeditions'

type Props = { params: Promise<{ slug: string }> }

const getTitle = cache(getExpeditionTitle)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const title = await getTitle(slug)
  return { title: `${title ?? 'Экспедиция'} | Birdwatching Moscow` }
}

export default async function ExpeditionPage({ params }: Props) {
  const { slug } = await params
  const title = await getTitle(slug)
  if (!title) notFound()
  return <main />
}
