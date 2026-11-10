import type { Metadata } from 'next'
import { CertificatesCTA } from './CertificatesCTA'
import styles from './certificates.module.css'

export const metadata: Metadata = {
  title: 'Подарочные сертификаты | Birdwatching Moscow',
  description: 'Сертификат — удобный подарок для друзей, коллег и близких. Действует 1 год, от 1000 до 15000 рублей.',
}

const EMAIL = 'birdwatching@mail.ru'

const EmailLink = () => (
  <a href={`mailto:${EMAIL}`} className="text-link">{EMAIL}</a>
)

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Сколько действует сертификат?',
    a: '1 год с даты покупки.',
  },
  {
    q: 'Как воспользоваться сертификатом?',
    a: <>{'Нужно написать на '}<EmailLink/>{' и указать:\n• код, указанный на сертификате (или фото)\n• событие, на которое хотите записаться\n• количество билетов\n• наличие бинокля'}</>,
  },
  {
    q: 'Какой номинал сертификата возможен?',
    a: 'От 1000 до 15 000 рублей.',
  },
  {
    q: 'Как получить сертификат?',
    a: <>{'Напишите на '}<EmailLink/>{' и укажите:\n• номинал\n• для кого/от кого, если это нужно указать на сертификате\n\nВ течение 24 часов мы сделаем электронный сертификат и пришлём вам на почту.'}</>,
  },
  {
    q: 'На какие события распространяется сертификат?',
    a: 'Любые события: групповые прогулки, частные, экспедиции.',
  },
]

export default function CertificatesPage() {
  return (
    <main className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={`text-display ${styles.heroTitle}`}>Подарочные сертификаты</h1>
        <p className={`text-body-l ${styles.heroSubtitle}`}>
          Сертификат — удобный подарок для друзей, коллег, родственников и других близких!
        </p>
      </section>

      {/* FAQ */}
      <section className={styles.content}>
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className={styles.faqItem}>
            <h2 className={`text-h2 ${styles.faqQ}`}>{item.q}</h2>
            <p className={styles.faqA}>{item.a}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <CertificatesCTA />
      </section>

    </main>
  )
}
