import type { Metadata } from 'next'
import { BookPage } from '@/components/BookPage/BookPage'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Книга | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default function Page() {
  return <BookPage />
}
