'use client'

import { useState, useTransition, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { Modal } from '@/components/ui/modal/Modal'
import { createExpedition } from '@/app/admin/expeditions/_actions'
import { ROUTES } from '@/utils/routes'
import { WalkSectionMain } from '@/app/admin/walks/_sections/WalkSectionMain'
import { WalkSectionDateTime } from '@/app/admin/walks/_sections/WalkSectionDateTime'
import { WalkSectionCover } from '@/app/admin/walks/_sections/WalkSectionCover'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { WalkSectionGuides } from '@/app/admin/walks/_sections/WalkSectionGuides'
import { WalkSectionTickets } from '@/app/admin/walks/_sections/WalkSectionTickets'
import type { TicketTypeRow } from '@/app/admin/walks/_sections/types'
import { makeKey as makeTicketKey } from '@/app/admin/walks/_sections/types'
import styles from '@/app/admin/walks/[id]/walk-edit.module.css'
import type { ChecklistItem, GalleryItem } from '@/app/admin/expeditions/_actions'

interface Guide {
  id: number
  name: string
}

interface Props {
  guides: Guide[]
}

export function ExpeditionNewForm({ guides }: Props) {
  const router = useRouter()

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt]       = useState('')
  const [endsAt, setEndsAt]           = useState('')
  const [coverUrl, setCoverUrl]       = useState('')
  const [guideIds, setGuideIds]       = useState<string[]>([])
  const [galleryItems, setGalleryItems]     = useState<GalleryItem[]>([])
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [durationDays, setDurationDays]   = useState('')
  const [aboutTitle, setAboutTitle]       = useState('')
  const [aboutText, setAboutText]         = useState('')
  const [difficulty, setDifficulty]       = useState<number | null>(null)
  const [includedItems, setIncludedItems] = useState<string[]>([])
  const [excludedItems, setExcludedItems] = useState<string[]>([])
  const [tickets, setTickets]             = useState<TicketTypeRow[]>([
    { key: makeTicketKey(), name: 'Стандартный', priceRub: '', capacity: '', description: '' },
  ])

  const [error, setError]            = useState<string | null>(null)
  const [pending, startCreate]       = useTransition()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const titleId = useId()

  function toggleGuide(id: string) {
    setGuideIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  function addChecklistItem() {
    if (checklistItems.length >= 15) return
    setChecklistItems(prev => [...prev, { title: '', text: '' }])
  }

  function updateChecklistItem(i: number, field: keyof ChecklistItem, value: string) {
    setChecklistItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  function removeChecklistItem(i: number) {
    setChecklistItems(prev => prev.filter((_, idx) => idx !== i))
  }

  function addGalleryItem() {
    setGalleryItems(prev => [...prev, { url: '', info: '' }])
  }

  function updateGalleryItem(i: number, field: keyof GalleryItem, value: string) {
    setGalleryItems(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g))
  }

  function removeGalleryItem(i: number) {
    setGalleryItems(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit() {
    setError(null)
    if (!title.trim()) { setError('Название обязательно'); return }
    if (!startsAt)     { setError('Укажите дату начала'); return }

    if (startsAt && endsAt && endsAt <= startsAt) {
      setError('Дата окончания не может быть раньше даты начала'); return
    }
    const spots = tickets.reduce((sum, t) => sum + (parseInt(t.capacity, 10) || 0), 0)
    startCreate(async () => {
      try {
        const id = await createExpedition({
          type: 'EXPEDITION',
          title: title.trim(),
          description: description.trim(),
          startsAt,
          endsAt: endsAt || undefined,
          coverPhotoUrl: coverUrl.trim(),
          galleryItems:   galleryItems.map(g => ({ url: g.url.trim(), info: g.info.trim() })).filter(g => g.url),
          checklistItems: checklistItems.map(c => ({ title: c.title.trim(), text: c.text.trim() })).filter(c => c.title || c.text),
          durationDays:  durationDays ? parseInt(durationDays, 10) : null,
          aboutTitle:    aboutTitle.trim() || null,
          aboutText:     aboutText.trim() || null,
          difficulty,
          includedItems: includedItems.map(s => s.trim()).filter(Boolean),
          excludedItems: excludedItems.map(s => s.trim()).filter(Boolean),
          ticketTypes: tickets
            .filter(t => t.name.trim())
            .map(t => ({
              name: t.name.trim(),
              priceKopecks: t.priceRub !== '' ? Math.round(parseFloat(t.priceRub) * 100) : null,
              capacity: parseInt(t.capacity, 10) || 0,
            })),
          totalSpots: spots,
          spotsLeft: spots,
          guideIds,
          days: [],
        })
        router.push(`${ROUTES.admin.expeditions}?tab=draft`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при создании')
      }
    })
  }

  return (
    <div className={styles.page}>

      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.push(ROUTES.admin.expeditions)}
        >
          ← Экспедиции
        </button>
        <div className={styles.topBarRight}>
          <span className={[styles.badge, styles.badgeDRAFT].join(' ')}>Новая</span>
        </div>
      </div>

      {error && (
        <div
          className={styles.readonlyBanner}
          style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
        >
          {error}
        </div>
      )}

      <div className={styles.sections}>
        <WalkSectionMain
          titleId={titleId}
          title={title}
          subtitle=""
          description={description}
          onTitle={setTitle}
          onSubtitle={() => {}}
          onDescription={setDescription}
          showSubtitle={false}
          descriptionLabel="Короткое описание"
          titlePlaceholder="Например: Дагестан: горы и каспийский берег"
          autoFocusTitle
        />

        <WalkSectionCover
          coverUrl={coverUrl}
          onCoverUrl={setCoverUrl}
          coverCredit=""
          onCoverCredit={() => {}}
          folder="expeditions"
          showCredit={false}
        />

        <WalkSectionDateTime
          startsAt={startsAt}
          endsAt={endsAt}
          onStartsAt={setStartsAt}
          onEndsAt={setEndsAt}
          durationDays={durationDays}
          onDurationDays={setDurationDays}
          requireStartsAt
          dateOnly
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>О поездке</h2>
          <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={styles.label}>Заголовок</label>
              <input
                className={styles.input}
                value={aboutTitle}
                onChange={e => setAboutTitle(e.target.value)}
                placeholder="Например: Экспедиция в горный Дагестан"
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={styles.label}>Текст</label>
              <textarea
                className={styles.textarea}
                value={aboutText}
                onChange={e => setAboutText(e.target.value)}
                rows={5}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Сложность</label>
              <div className={styles.difficultyPicker}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.difficultyChip}${difficulty === n ? ` ${styles.difficultyChipActive}` : ''}`}
                    onClick={() => setDifficulty(difficulty === n ? null : n)}
                    disabled={pending}
                  >{n}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Будем искать</h2>
          <div className={styles.galleryList}>
            {galleryItems.map((item, i) => (
              <div key={i} className={styles.galleryItemBlock}>
                <div className={styles.checklistItemHeader}>
                  <span className={styles.checklistItemNum}>Фото {i + 1}</span>
                  <button
                    type="button"
                    className={styles.removeGuideBtn}
                    onClick={() => removeGalleryItem(i)}
                    disabled={pending}
                    aria-label="Удалить фото"
                  >✕</button>
                </div>
                <ImageUpload
                  folder="expeditions"
                  value={item.url}
                  onChange={v => updateGalleryItem(i, 'url', v)}
                  disabled={pending}
                  targetWidth={800}
                  targetHeight={600}
                />
                <input
                  className={styles.input}
                  value={item.info}
                  onChange={e => updateGalleryItem(i, 'info', e.target.value)}
                  disabled={pending}
                  placeholder="Вид птицы и автор фото"
                />
              </div>
            ))}
          </div>
          {galleryItems.length < 3 && (
            <button
              type="button"
              className={styles.addGuideBtn}
              onClick={addGalleryItem}
            >+ Добавить фото</button>
          )}
          <p className={styles.photoNote}>До 3 фотографий</p>
        </section>

        <WalkSectionGuides
          multi
          guides={guides}
          guideIds={guideIds}
          onGuideIds={setGuideIds}
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Всё, что важно знать перед поездкой</h2>
          {checklistItems.map((item, i) => (
            <div key={i} className={styles.checklistItem}>
              <div className={styles.checklistItemHeader}>
                <span className={styles.checklistItemNum}>{i + 1}</span>
                <button
                  type="button"
                  className={styles.removeGuideBtn}
                  onClick={() => removeChecklistItem(i)}
                  aria-label="Удалить пункт"
                >
                  ✕
                </button>
              </div>
              <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
                <div className={`${styles.field} ${styles.fieldFullWidth}`}>
                  <label className={styles.label}>Заголовок</label>
                  <input
                    className={styles.input}
                    value={item.title}
                    onChange={e => updateChecklistItem(i, 'title', e.target.value)}
                    placeholder="Например: Что взять с собой"
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFullWidth}`}>
                  <label className={styles.label}>Текст</label>
                  <textarea
                    className={styles.textarea}
                    value={item.text}
                    onChange={e => updateChecklistItem(i, 'text', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
          {checklistItems.length < 15 && (
            <button type="button" className={styles.addGuideBtn} onClick={addChecklistItem}>
              + Добавить пункт
            </button>
          )}
          <p className={styles.photoNote}>До 15 пунктов</p>
        </section>

        <WalkSectionTickets
          tickets={tickets}
          onChange={setTickets}
          disabled={pending}
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Включено в базовую стоимость</h2>
          <div className={styles.galleryList}>
            {includedItems.map((item, i) => (
              <div key={i} className={styles.galleryRow}>
                <input
                  className={styles.input}
                  value={item}
                  onChange={e => { const next = [...includedItems]; next[i] = e.target.value; setIncludedItems(next) }}
                  disabled={pending}
                  placeholder="Например: Трансфер по маршруту"
                />
                <button
                  type="button"
                  className={styles.removeGalleryBtn}
                  onClick={() => setIncludedItems(includedItems.filter((_, j) => j !== i))}
                  disabled={pending}
                  aria-label="Удалить пункт"
                >×</button>
              </div>
            ))}
          </div>
          {!pending && (
            <button
              type="button"
              className={styles.addGuideBtn}
              onClick={() => setIncludedItems([...includedItems, ''])}
            >+ Добавить пункт</button>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Не входит в стоимость</h2>
          <div className={styles.galleryList}>
            {excludedItems.map((item, i) => (
              <div key={i} className={styles.galleryRow}>
                <input
                  className={styles.input}
                  value={item}
                  onChange={e => { const next = [...excludedItems]; next[i] = e.target.value; setExcludedItems(next) }}
                  disabled={pending}
                  placeholder="Например: Авиаперелёт"
                />
                <button
                  type="button"
                  className={styles.removeGalleryBtn}
                  onClick={() => setExcludedItems(excludedItems.filter((_, j) => j !== i))}
                  disabled={pending}
                  aria-label="Удалить пункт"
                >×</button>
              </div>
            ))}
          </div>
          {!pending && (
            <button
              type="button"
              className={styles.addGuideBtn}
              onClick={() => setExcludedItems([...excludedItems, ''])}
            >+ Добавить пункт</button>
          )}
        </section>

      </div>

      <div className={styles.formActions}>
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={pending || !title.trim() || !startsAt}
        >
          {pending ? 'Создание…' : 'Создать черновик'}
        </Button>
      </div>

      <div className={styles.dangerZone}>
        <button
          type="button"
          className={styles.dangerBtn}
          onClick={() => setShowResetConfirm(true)}
          disabled={pending}
        >
          Сбросить черновик
        </button>
      </div>

      <Modal
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Сбросить черновик?"
        footer={
          <div className={styles.leaveModalFooter}>
            <Button fullWidth variant="secondary" onClick={() => setShowResetConfirm(false)}>Назад</Button>
            <Button fullWidth variant="destructive" onClick={() => router.push(`${ROUTES.admin.expeditions}?tab=draft`)}>
              Сбросить
            </Button>
          </div>
        }
      >
        <p className={styles.leaveModalText}>Введённые данные будут потеряны.</p>
      </Modal>

    </div>
  )
}
