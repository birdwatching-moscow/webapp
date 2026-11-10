'use client'

import { useState, useTransition, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { createWalkFull } from '@/app/admin/walks/_actions'
import { ROUTES } from '@/utils/routes'
import type { Guide, TicketTypeRow } from '@/app/admin/walks/_sections/types'
import { makeKey } from '@/app/admin/walks/_sections/types'
import { WalkSectionMain } from '@/app/admin/walks/_sections/WalkSectionMain'
import { WalkSectionDateTime } from '@/app/admin/walks/_sections/WalkSectionDateTime'
import { WalkSectionGuides } from '@/app/admin/walks/_sections/WalkSectionGuides'
import { WalkSectionCover } from '@/app/admin/walks/_sections/WalkSectionCover'
import { WalkSectionTickets } from '@/app/admin/walks/_sections/WalkSectionTickets'
import { WalkEmailTab } from '@/app/admin/walks/_sections/WalkEmailTab'
import styles from '../[id]/walk-edit.module.css'

interface Props {
  guides: Guide[]
}

export function WalkNewForm({ guides }: Props) {
  const router = useRouter()

  const [title, setTitle]       = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt]     = useState('')
  const [location, setLocation] = useState('')
  const [coverUrl, setCoverUrl]         = useState('')
  const [guideId, setGuideId]           = useState('')
  const [guideId2, setGuideId2]         = useState('')
  const [tickets, setTickets]           = useState<TicketTypeRow[]>([
    { key: makeKey(), name: 'Стандартный', priceRub: '', capacity: '' },
  ])
  const [purchaseEmailSubject, setPurchaseEmailSubject] = useState('')
  const [purchaseEmailBody, setPurchaseEmailBody]       = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody]       = useState('')
  const [reminderDaysBefore, setReminderDaysBefore] = useState(1)
  const [formTab, setFormTab]           = useState<'walk' | 'email'>('walk')

  const [error, setError]       = useState<string | null>(null)
  const [pending, startCreate]  = useTransition()

  const titleId = useId()

  function buildPayload() {
    return {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim(),
      startsAt,
      endsAt: endsAt || undefined,
      location: location.trim(),
      coverPhotoUrl: coverUrl.trim(),
      guideId: Number(guideId),
      guideId2: guideId2 ? Number(guideId2) : undefined,
      purchaseEmailSubject: purchaseEmailSubject.trim() || undefined,
      purchaseEmailBody: purchaseEmailBody.trim() || undefined,
      emailSubject: emailSubject.trim() || undefined,
      emailBody: emailBody.trim() || undefined,
      reminderDaysBefore,
      ticketTypes: tickets.map(t => ({
        name: t.name.trim() || 'Без названия',
        priceKopecks: t.priceRub !== '' ? Math.round(parseFloat(t.priceRub) * 100) : null,
        capacity: parseInt(t.capacity, 10) || 0,
      })),
    }
  }

  function handleSubmit() {
    setError(null)
    if (!title.trim()) { setError('Название обязательно'); return }
    if (!startsAt) { setError('Укажите дату начала'); return }
    if (!guideId) { setError('Выберите гида'); return }
    if (purchaseEmailSubject.trim() && !purchaseEmailBody.trim()) { setError('Заполните текст письма при покупке'); setFormTab('email'); return }
    if (!purchaseEmailSubject.trim() && purchaseEmailBody.trim()) { setError('Заполните тему письма при покупке'); setFormTab('email'); return }
    if (emailSubject.trim() && !emailBody.trim()) { setError('Заполните текст письма-напоминания'); setFormTab('email'); return }
    if (!emailSubject.trim() && emailBody.trim()) { setError('Заполните тему письма-напоминания'); setFormTab('email'); return }
    startCreate(async () => {
      try {
        const id = await createWalkFull(buildPayload())
        router.push(`/admin/walks/${id}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при создании')
      }
    })
  }

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={() => router.push(ROUTES.admin.walks)}>
          ← Прогулки
        </button>
        <div className={styles.topBarRight}>
          <span className={[styles.badge, styles.badgeDRAFT].join(' ')}>Новая</span>
          <Button size="sm" onClick={handleSubmit} disabled={pending || !title.trim() || !startsAt || !guideId}>
            {pending ? 'Создание…' : 'Создать черновик'}
          </Button>
        </div>
      </div>

      {error && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <nav className={styles.formTabs}>
        <button
          type="button"
          className={[styles.formTab, formTab === 'walk' ? styles.formTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setFormTab('walk')}
        >
          Описание прогулки
        </button>
        <button
          type="button"
          className={[styles.formTab, formTab === 'email' ? styles.formTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setFormTab('email')}
        >
          Email
        </button>
      </nav>

      {formTab === 'walk' && (
        <div className={styles.sections}>
          <WalkSectionMain
            titleId={titleId}
            title={title} subtitle={subtitle} description={description}
            onTitle={setTitle}
            onSubtitle={setSubtitle}
            onDescription={setDescription}
            autoFocusTitle
          />
          <WalkSectionDateTime
            startsAt={startsAt} endsAt={endsAt} location={location}
            onStartsAt={setStartsAt}
            onEndsAt={setEndsAt}
            onLocation={setLocation}
            requireStartsAt
          />
          <WalkSectionGuides
            guides={guides} guideId={guideId} guideId2={guideId2}
            onGuideId={setGuideId}
            onGuideId2={setGuideId2}
            requireGuide
            placeholderOption
          />
          <WalkSectionCover
            coverUrl={coverUrl}
            onCoverUrl={setCoverUrl}
          />
          <WalkSectionTickets
            tickets={tickets}
            onChange={setTickets}
          />
        </div>
      )}

      {formTab === 'email' && (
        <WalkEmailTab
          purchaseEmailSubject={purchaseEmailSubject}
          purchaseEmailBody={purchaseEmailBody}
          emailSubject={emailSubject}
          emailBody={emailBody}
          reminderDaysBefore={reminderDaysBefore}
          onPurchaseEmailSubject={setPurchaseEmailSubject}
          onPurchaseEmailBody={setPurchaseEmailBody}
          onEmailSubject={setEmailSubject}
          onEmailBody={setEmailBody}
          onReminderDaysBefore={setReminderDaysBefore}
        />
      )}

    </div>
  )
}
