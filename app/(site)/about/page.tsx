import { Team } from '@/components/team/Team'
import type { Metadata } from 'next'

export const revalidate = 3600 // ISR: rebuild at most once per hour

export const metadata: Metadata = {
  title: 'О проекте | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default function AboutPage() {
  return <Team />
}