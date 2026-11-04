import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Сертификаты | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default function CertificatesPage() {
  return (
    <main className="container">
      <h1>Сертификаты</h1>
    </main>
  )
}
