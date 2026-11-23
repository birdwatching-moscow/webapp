'use client'

import { useState, useEffect, useTransition, useId, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { Modal } from '@/components/ui/modal/Modal'
import { updateExpedition, publishExpedition, cancelExpedition, deleteExpedition, reactivateExpedition } from '@/app/admin/expeditions/_actions'
import { CopyExpeditionButton } from './CopyExpeditionButton'
import { ROUTES } from '@/utils/routes'
import type { Guide, TicketTypeRow } from '@/app/admin/walks/_sections/types'
import { makeKey } from '@/app/admin/walks/_sections/types'
import { WalkSectionMain } from '@/app/admin/walks/_sections/WalkSectionMain'
import { WalkSectionDateTime } from '@/app/admin/walks/_sections/WalkSectionDateTime'
import { WalkSectionCover } from '@/app/admin/walks/_sections/WalkSectionCover'
import { WalkSectionGuides } from '@/app/admin/walks/_sections/WalkSectionGuides'
import { WalkSectionTickets } from '@/app/admin/walks/_sections/WalkSectionTickets'
import { ImageUpload } from '@/components/admin/ImageUpload'
import styles from '@/app/admin/walks/[id]/walk-edit.module.css'
import { EventStatus } from '@/lib/enums'
import type { ChecklistItem, GalleryItem } from '@/app/admin/expeditions/_actions'

type DayRow = { clientId: string; dayNumber: number; title: string; description: string }

type ExpeditionData = {
  id: string
  title: string
  description: string
  startsAt: string
  endsAt: string
  coverPhotoUrl: string
  galleryItems: GalleryItem[]
  checklistItems: ChecklistItem[]
  durationDays: number | null
  aboutTitle: string | null
  aboutText: string | null
  difficulty: number | null
  includedItems: string[]
  excludedItems: string[]
  ticketTypes: TicketTypeRow[]
  totalSpots: number
  spotsLeft: number
  status: string
  guideIds: string[]
  days: DayRow[]
}

interface Props {
  expedition: ExpeditionData
  guides: Guide[]
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT:     'Черновик',
  ACTIVE:    'Активна',
  CANCELLED: 'Отменена',
  PAST:      'Завершена',
}

function statusBadgeClass(status: string) {
  if (status === EventStatus.DRAFT)     return styles.badgeDRAFT
  if (status === EventStatus.ACTIVE)    return styles.badgeACTIVE
  if (status === EventStatus.CANCELLED) return styles.badgeCANCELLED
  return styles.badgePAST
}

export function ExpeditionEditForm({ expedition, guides }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditable = expedition.status === EventStatus.ACTIVE || expedition.status === EventStatus.DRAFT

  const [title, setTitle]             = useState(expedition.title)
  const [description, setDescription] = useState(expedition.description)
  const [startsAt, setStartsAt]       = useState(expedition.startsAt)
  const [endsAt, setEndsAt]           = useState(expedition.endsAt)
  const [coverUrl, setCoverUrl]       = useState(expedition.coverPhotoUrl)
  const [galleryItems, setGalleryItems]     = useState<GalleryItem[]>(expedition.galleryItems)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(expedition.checklistItems)
  const [durationDays, setDurationDays] = useState(expedition.durationDays != null ? String(expedition.durationDays) : '')
  const [aboutTitle, setAboutTitle]         = useState(expedition.aboutTitle ?? '')
  const [aboutText, setAboutText]           = useState(expedition.aboutText ?? '')
  const [difficulty, setDifficulty]         = useState<number | null>(expedition.difficulty)
  const [includedItems, setIncludedItems]   = useState<string[]>(expedition.includedItems)
  const [excludedItems, setExcludedItems]   = useState<string[]>(expedition.excludedItems)
  const [tickets, setTickets]               = useState<TicketTypeRow[]>(
    expedition.ticketTypes.length > 0
      ? expedition.ticketTypes
      : [{ key: makeKey(), name: 'Стандартный', priceRub: '', capacity: '' }]
  )
  const [totalSpots, setTotalSpots]         = useState(String(expedition.totalSpots))
  const [spotsLeft, setSpotsLeft]     = useState(String(expedition.spotsLeft))
  const [guideIds, setGuideIds]       = useState<string[]>(expedition.guideIds)
  const [days, setDays]               = useState<DayRow[]>(() => [...expedition.days].sort((a, b) => a.dayNumber - b.dayNumber))
  const [formTab, setFormTab]         = useState<'main' | 'days'>('main')
  const [dragOverId, setDragOverId]   = useState<string | null>(null)
  const [draggingId, setDraggingId]   = useState<string | null>(null)
  const draggedIdRef                  = useRef<string | null>(null)

  const [isDirty, setIsDirty]               = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm]   = useState(false)
  const [showDangerConfirm, setShowDangerConfirm] = useState<'cancel' | 'delete' | null>(null)
  const [saving, startSave]           = useTransition()
  const [publishing, startPublish]    = useTransition()
  const [danger, startDanger]         = useTransition()
  const [reactivating, startReactivate] = useTransition()

  const titleId    = useId()
  const requireAll = expedition.status === EventStatus.DRAFT || expedition.status === EventStatus.ACTIVE

  function showError(msg: string) {
    setError(msg)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function markDirty() { setIsDirty(true) }

  function getPublishErrors(): string[] {
    const errors: string[] = []
    if (!description.trim())                                   errors.push('Описание')
    if (!startsAt)                                             errors.push('Дата начала')
    if (!endsAt)                                               errors.push('Дата окончания')
    if (!durationDays || parseInt(durationDays) < 1)           errors.push('Длительность')
    if (!coverUrl.trim())                                      errors.push('Фото обложки')
    if (guideIds.length === 0)                                 errors.push('Хотя бы один гид')
    if (!aboutTitle.trim())                                    errors.push('Заголовок «О поездке»')
    if (!aboutText.trim())                                     errors.push('Текст «О поездке»')
    if (difficulty == null)                                    errors.push('Сложность')
    if (!galleryItems.some(g => g.url.trim()))                 errors.push('Хотя бы одно фото в «Будем искать»')
    if (!checklistItems.some(c => c.title.trim()))             errors.push('Хотя бы один пункт «Важно знать»')
    if (!tickets.some(t => t.name.trim() && t.priceRub !== '' && t.capacity !== '')) errors.push('Хотя бы один тип билета')
    if (!totalSpots || parseInt(totalSpots) < 1)               errors.push('Количество мест')
    if (!includedItems.some(s => s.trim()))                    errors.push('Хотя бы один пункт «Включено в стоимость»')
    if (!excludedItems.some(s => s.trim()))                    errors.push('Хотя бы один пункт «Не входит в стоимость»')
    if (days.length === 0)                                     errors.push('Хотя бы один день программы')
    return errors
  }

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function expeditionsListHref() {
    const from = searchParams.get('from')
    if (from === 'draft') return `${ROUTES.admin.expeditions}?tab=draft`
    if (from === 'all')   return `${ROUTES.admin.expeditions}?tab=all`
    if (from != null)     return ROUTES.admin.expeditions
    if (expedition.status === EventStatus.DRAFT)  return `${ROUTES.admin.expeditions}?tab=draft`
    if (expedition.status === EventStatus.ACTIVE) return ROUTES.admin.expeditions
    return `${ROUTES.admin.expeditions}?tab=all`
  }

  function handleBack() {
    if (isDirty) { setShowLeaveConfirm(true); return }
    router.push(expeditionsListHref())
  }

  function confirmLeave() {
    setShowLeaveConfirm(false)
    router.push(expeditionsListHref())
  }

  function buildPayload() {
    return {
      type: 'EXPEDITION' as const,
      title: title.trim(),
      description: description.trim(),
      startsAt,
      endsAt: endsAt || undefined,
      coverPhotoUrl: coverUrl.trim(),
      galleryItems:   galleryItems.map(g => ({ url: g.url.trim(), info: g.info.trim() })).filter(g => g.url),
      checklistItems: checklistItems.map(c => ({ title: c.title.trim(), text: c.text.trim() })).filter(c => c.title || c.text),
      durationDays: durationDays ? parseInt(durationDays, 10) : null,
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
      totalSpots: parseInt(totalSpots, 10) || 0,
      spotsLeft: parseInt(spotsLeft, 10) || 0,
      guideIds,
      days: days.map(d => ({
        clientId: d.clientId,
        dayNumber: d.dayNumber,
        title: d.title.trim(),
        description: d.description.trim(),
      })),
    }
  }

  function handleSave() {
    setError(null)
    if (!title.trim()) { showError('Название обязательно'); return }
    if (startsAt && endsAt && endsAt <= startsAt) { showError('Дата окончания не может быть раньше даты начала'); setFormTab('main'); return }
    if (expedition.status === EventStatus.ACTIVE) {
      const errors = getPublishErrors()
      if (errors.length > 0) { showError(`Не заполнены обязательные поля: ${errors.join(', ')}`); return }
    }
    startSave(async () => {
      try {
        await updateExpedition(expedition.id, buildPayload())
        setIsDirty(false)
        router.push(expeditionsListHref())
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Ошибка при сохранении')
      }
    })
  }

  function handlePublish() {
    setError(null)
    if (!title.trim()) { showError('Название обязательно'); return }
    if (startsAt && endsAt && endsAt <= startsAt) { showError('Дата окончания не может быть раньше даты начала'); setFormTab('main'); return }
    const errors = getPublishErrors()
    if (errors.length > 0) {
      showError(`Нельзя опубликовать: не заполнены — ${errors.join(', ')}`)
      return
    }
    startPublish(async () => {
      try {
        await publishExpedition(expedition.id)
        setPublishSuccess(true)
        router.refresh()
      } catch (e) {
        showError('Экспедиция не опубликована: ' + (e instanceof Error ? e.message : 'неизвестная ошибка'))
      }
    })
  }

  function confirmDanger() {
    const action = showDangerConfirm
    setShowDangerConfirm(null)
    startDanger(async () => {
      try {
        if (action === 'cancel') await cancelExpedition(expedition.id)
        else await deleteExpedition(expedition.id)
        router.push(ROUTES.admin.expeditions)
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Ошибка')
      }
    })
  }

  function toggleGuide(id: string) {
    setGuideIds(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
    markDirty()
  }

  function addChecklistItem() {
    if (checklistItems.length >= 15) return
    setChecklistItems(prev => [...prev, { title: '', text: '' }])
    markDirty()
  }

  function updateChecklistItem(i: number, field: keyof ChecklistItem, value: string) {
    setChecklistItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
    markDirty()
  }

  function removeChecklistItem(i: number) {
    setChecklistItems(prev => prev.filter((_, idx) => idx !== i))
    markDirty()
  }

  function addGalleryItem() {
    setGalleryItems(prev => [...prev, { url: '', info: '' }])
    markDirty()
  }

  function updateGalleryItem(i: number, field: keyof GalleryItem, value: string) {
    setGalleryItems(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g))
    markDirty()
  }

  function removeGalleryItem(i: number) {
    setGalleryItems(prev => prev.filter((_, idx) => idx !== i))
    markDirty()
  }

  function sortedDays(list: DayRow[]) {
    return [...list].sort((a, b) => a.dayNumber - b.dayNumber)
  }

  function addDay() {
    setDays(prev => {
      const sorted = sortedDays(prev)
      const maxNum = sorted.length > 0 ? sorted[sorted.length - 1].dayNumber : 0
      return sortedDays([...prev, { clientId: makeKey(), dayNumber: maxNum + 1, title: '', description: '' }])
    })
    markDirty()
  }

  function addDayZero() {
    setDays(prev => sortedDays([...prev, { clientId: makeKey(), dayNumber: 0, title: '', description: '' }]))
    markDirty()
  }

  function updateDay(clientId: string, field: 'title' | 'description', value: string) {
    setDays(prev => prev.map(d => d.clientId === clientId ? { ...d, [field]: value } : d))
    markDirty()
  }

  function removeDay(clientId: string) {
    setDays(prev => {
      const remaining = sortedDays(prev.filter(d => d.clientId !== clientId))
      if (remaining.length === 0) return remaining
      const startNum = remaining[0].dayNumber === 0 ? 0 : 1
      return remaining.map((d, i) => ({ ...d, dayNumber: startNum + i }))
    })
    markDirty()
  }

  function handleDragStart(clientId: string) {
    draggedIdRef.current = clientId
    setDraggingId(clientId)
  }

  function handleDragOver(e: React.DragEvent, clientId: string) {
    e.preventDefault()
    setDragOverId(clientId)
  }

  function handleDrop(targetClientId: string) {
    const draggedId = draggedIdRef.current
    setDragOverId(null)
    setDraggingId(null)
    draggedIdRef.current = null
    if (!draggedId || draggedId === targetClientId) return
    setDays(prev => {
      const sorted = sortedDays(prev)
      const hasZero = sorted[0]?.dayNumber === 0
      const fromIdx = sorted.findIndex(d => d.clientId === draggedId)
      const toIdx   = sorted.findIndex(d => d.clientId === targetClientId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const reordered = [...sorted]
      const [item] = reordered.splice(fromIdx, 1)
      reordered.splice(toIdx, 0, item)
      const startNum = hasZero ? 0 : 1
      return reordered.map((d, i) => ({ ...d, dayNumber: startNum + i }))
    })
    markDirty()
  }

  function handleDragEnd() {
    draggedIdRef.current = null
    setDraggingId(null)
    setDragOverId(null)
  }

  function handleReactivate() {
    setError(null)
    startReactivate(async () => {
      try {
        await reactivateExpedition(expedition.id)
        router.refresh()
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Ошибка')
      }
    })
  }

  const canReactivate = expedition.status === EventStatus.CANCELLED && new Date(expedition.startsAt) > new Date()

  return (
    <div className={styles.page}>

      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          ← Экспедиции
        </button>
        <div className={styles.topBarRight}>
          <span className={[styles.badge, statusBadgeClass(expedition.status)].join(' ')}>
            {STATUS_LABELS[expedition.status] ?? expedition.status}
          </span>
          {isDirty && <span className={styles.dirtyHint}>Несохранённые изменения</span>}
          <CopyExpeditionButton expeditionId={expedition.id} disabled={saving} onError={showError} onSuccess={() => router.push(`${ROUTES.admin.expeditions}?tab=draft`)} />
          {canReactivate && (
            <Button size="sm" variant="outline" onClick={handleReactivate} disabled={reactivating}>
              {reactivating ? 'Возврат…' : 'Вернуть в активные'}
            </Button>
          )}
          {expedition.status === EventStatus.DRAFT && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishing || isDirty}
              title={isDirty ? 'Сначала сохраните изменения' : undefined}
            >
              {publishing ? 'Публикация…' : 'Опубликовать'}
            </Button>
          )}
        </div>
      </div>

      {publishSuccess && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-success, #1f7a3b)', borderColor: 'var(--color-success, #1f7a3b)' }}>
          Экспедиция успешно опубликована
        </div>
      )}

      {!isEditable && (
        <div className={styles.readonlyBanner}>
          Эта экспедиция доступна только для просмотра — редактирование возможно только в статусах «Черновик» и «Активна».
        </div>
      )}

      {error && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <nav className={styles.formTabs}>
        <button
          type="button"
          className={[styles.formTab, formTab === 'main' ? styles.formTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setFormTab('main')}
        >
          Описание экспедиции
        </button>
        <button
          type="button"
          className={[styles.formTab, formTab === 'days' ? styles.formTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setFormTab('days')}
        >
          Программа{days.length > 0 && ` (${days.length})`}
        </button>
      </nav>

      {formTab === 'main' && (
        <div className={styles.sections}>
          <WalkSectionMain
            titleId={titleId}
            title={title} subtitle="" description={description}
            onTitle={v => { setTitle(v); markDirty() }}
            onSubtitle={() => {}}
            onDescription={v => { setDescription(v); markDirty() }}
            showSubtitle={false}
            descriptionLabel="Короткое описание"
            disabled={!isEditable}
            requireAll={requireAll}
          />

          <WalkSectionCover
            coverUrl={coverUrl}
            onCoverUrl={v => { setCoverUrl(v); markDirty() }}
            coverCredit=""
            onCoverCredit={() => {}}
            folder="expeditions"
            showCredit={false}
            disabled={!isEditable}
            requireAll={requireAll}
          />

          <WalkSectionDateTime
            startsAt={startsAt} endsAt={endsAt}
            onStartsAt={v => { setStartsAt(v); markDirty() }}
            onEndsAt={v => { setEndsAt(v); markDirty() }}
            durationDays={durationDays}
            onDurationDays={v => { setDurationDays(v); markDirty() }}
            disabled={!isEditable}
            requireAll={requireAll}
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
                  onChange={e => { setAboutTitle(e.target.value); markDirty() }}
                  disabled={!isEditable}
                  placeholder="Например: Экспедиция в горный Дагестан"
                />
              </div>
              <div className={`${styles.field} ${styles.fieldFullWidth}`}>
                <label className={styles.label}>Текст</label>
                <textarea
                  className={styles.textarea}
                  value={aboutText}
                  onChange={e => { setAboutText(e.target.value); markDirty() }}
                  disabled={!isEditable}
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
                      onClick={() => { setDifficulty(difficulty === n ? null : n); markDirty() }}
                      disabled={!isEditable}
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
                      disabled={!isEditable}
                      aria-label="Удалить фото"
                    >✕</button>
                  </div>
                  <ImageUpload
                    folder="expeditions"
                    value={item.url}
                    onChange={v => { updateGalleryItem(i, 'url', v); markDirty() }}
                    disabled={!isEditable}
                    targetWidth={800}
                    targetHeight={600}
                  />
                  <input
                    className={styles.input}
                    value={item.info}
                    onChange={e => { updateGalleryItem(i, 'info', e.target.value); markDirty() }}
                    disabled={!isEditable}
                    placeholder="Вид птицы и автор фото"
                  />
                </div>
              ))}
            </div>
            {isEditable && galleryItems.length < 3 && (
              <button type="button" className={styles.addGuideBtn} onClick={addGalleryItem}>
                + Добавить фото
              </button>
            )}
            <p className={styles.photoNote}>До 3 фотографий</p>
          </section>

          <WalkSectionGuides
            multi
            guides={guides}
            guideIds={guideIds}
            onGuideIds={ids => { setGuideIds(ids); markDirty() }}
            disabled={!isEditable}
            requireAll={requireAll}
          />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Всё, что важно знать перед поездкой</h2>
            {checklistItems.map((item, i) => (
              <div key={i} className={styles.checklistItem}>
                <div className={styles.checklistItemHeader}>
                  <span className={styles.checklistItemNum}>{i + 1}</span>
                  {isEditable && (
                    <button
                      type="button"
                      className={styles.removeGuideBtn}
                      onClick={() => removeChecklistItem(i)}
                      aria-label="Удалить пункт"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
                  <div className={`${styles.field} ${styles.fieldFullWidth}`}>
                    <label className={styles.label}>Заголовок</label>
                    <input
                      className={styles.input}
                      value={item.title}
                      onChange={e => updateChecklistItem(i, 'title', e.target.value)}
                      disabled={!isEditable}
                      placeholder="Например: Что взять с собой"
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFullWidth}`}>
                    <label className={styles.label}>Текст</label>
                    <textarea
                      className={styles.textarea}
                      value={item.text}
                      onChange={e => updateChecklistItem(i, 'text', e.target.value)}
                      disabled={!isEditable}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
            {isEditable && checklistItems.length < 15 && (
              <button type="button" className={styles.addGuideBtn} onClick={addChecklistItem}>
                + Добавить пункт
              </button>
            )}
            <p className={styles.photoNote}>До 15 пунктов</p>
          </section>

          <WalkSectionTickets
            tickets={tickets}
            onChange={t => { setTickets(t); markDirty() }}
            disabled={saving}
            requireAll={requireAll}
          />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Включено в базовую стоимость</h2>
            <div className={styles.galleryList}>
              {includedItems.map((item, i) => (
                <div key={i} className={styles.galleryRow}>
                  <input
                    className={styles.input}
                    value={item}
                    onChange={e => { const next = [...includedItems]; next[i] = e.target.value; setIncludedItems(next); markDirty() }}
                    disabled={saving}
                    placeholder="Например: Трансфер по маршруту"
                  />
                  <button
                    type="button"
                    className={styles.removeGalleryBtn}
                    onClick={() => { setIncludedItems(includedItems.filter((_, j) => j !== i)); markDirty() }}
                    disabled={saving}
                    aria-label="Удалить пункт"
                  >×</button>
                </div>
              ))}
            </div>
            {!saving && (
              <button
                type="button"
                className={styles.addGuideBtn}
                onClick={() => { setIncludedItems([...includedItems, '']); markDirty() }}
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
                    onChange={e => { const next = [...excludedItems]; next[i] = e.target.value; setExcludedItems(next); markDirty() }}
                    disabled={saving}
                    placeholder="Например: Авиаперелёт"
                  />
                  <button
                    type="button"
                    className={styles.removeGalleryBtn}
                    onClick={() => { setExcludedItems(excludedItems.filter((_, j) => j !== i)); markDirty() }}
                    disabled={saving}
                    aria-label="Удалить пункт"
                  >×</button>
                </div>
              ))}
            </div>
            {!saving && (
              <button
                type="button"
                className={styles.addGuideBtn}
                onClick={() => { setExcludedItems([...excludedItems, '']); markDirty() }}
              >+ Добавить пункт</button>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Места</h2>
            <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
              <div className={styles.field}>
                <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>
                  Мест всего
                </label>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  value={totalSpots}
                  onChange={e => { setTotalSpots(e.target.value); markDirty() }}
                  disabled={!isEditable}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Мест осталось</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  value={spotsLeft}
                  onChange={e => { setSpotsLeft(e.target.value); markDirty() }}
                  disabled={!isEditable}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {formTab === 'days' && (
        <div className={styles.sections}>
          {days.length === 0 && (
            <p className={styles.emailNote}>Программа не добавлена</p>
          )}
          {days.map(day => (
            <section
              key={day.clientId}
              className={[
                styles.section,
                styles.dayCard,
                draggingId === day.clientId ? styles.dayDragging : '',
                dragOverId === day.clientId ? styles.dayDragOver : '',
              ].filter(Boolean).join(' ')}
              draggable={isEditable}
              onDragStart={() => handleDragStart(day.clientId)}
              onDragOver={e => handleDragOver(e, day.clientId)}
              onDrop={() => handleDrop(day.clientId)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.topBar} style={{ marginBottom: 0 }}>
                <div className={styles.dayHeaderLeft}>
                  {isEditable && (
                    <span className={styles.dayHandle} aria-hidden>⠿</span>
                  )}
                  <h2 className={styles.sectionTitle}>День {day.dayNumber}</h2>
                </div>
                {isEditable && (
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => removeDay(day.clientId)}
                  >
                    Удалить день
                  </button>
                )}
              </div>
              <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
                <div className={`${styles.field} ${styles.fieldFullWidth}`}>
                  <label className={styles.label}>Название дня</label>
                  <input
                    className={styles.input}
                    value={day.title}
                    onChange={e => updateDay(day.clientId, 'title', e.target.value)}
                    disabled={!isEditable}
                    placeholder="Например: Перелёт и заселение"
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFullWidth}`}>
                  <label className={styles.label}>Описание</label>
                  <textarea
                    className={styles.textarea}
                    value={day.description}
                    onChange={e => updateDay(day.clientId, 'description', e.target.value)}
                    disabled={!isEditable}
                    rows={4}
                  />
                </div>
              </div>
            </section>
          ))}
          {isEditable && (
            <div className={styles.dayAddButtons}>
              {!days.some(d => d.dayNumber === 0) && (
                <button type="button" className={styles.addGuideBtn} onClick={addDayZero}>
                  + Добавить день 0
                </button>
              )}
              <button type="button" className={styles.addGuideBtn} onClick={addDay}>
                + Добавить день
              </button>
            </div>
          )}
        </div>
      )}

      {isEditable && (
        <div className={styles.formActions}>
          <Button fullWidth onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </div>
      )}

      {(expedition.status === EventStatus.ACTIVE || expedition.status === EventStatus.DRAFT) && (
        <div className={styles.dangerZone}>
          {expedition.status === EventStatus.ACTIVE && (
            <button type="button" className={styles.dangerBtn} onClick={() => setShowDangerConfirm('cancel')} disabled={danger}>
              Отменить экспедицию
            </button>
          )}
          {expedition.status === EventStatus.DRAFT && (
            <button type="button" className={styles.dangerBtn} onClick={() => setShowDangerConfirm('delete')} disabled={danger}>
              Удалить черновик
            </button>
          )}
        </div>
      )}

      <Modal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        title="Несохранённые изменения"
        footer={
          <div className={styles.leaveModalFooter}>
            <Button fullWidth variant="secondary" onClick={() => setShowLeaveConfirm(false)}>Отмена</Button>
            <Button fullWidth variant="destructive" onClick={confirmLeave}>Уйти без сохранения</Button>
          </div>
        }
      >
        <p className={styles.leaveModalText}>
          Вы внесли изменения, которые ещё не сохранены. Если уйти сейчас — они потеряются.
        </p>
      </Modal>

      <Modal
        open={showDangerConfirm !== null}
        onClose={() => setShowDangerConfirm(null)}
        title={showDangerConfirm === 'cancel' ? 'Отменить экспедицию?' : 'Удалить черновик?'}
        footer={
          <div className={styles.leaveModalFooter}>
            <Button fullWidth variant="secondary" onClick={() => setShowDangerConfirm(null)}>Назад</Button>
            <Button fullWidth variant="destructive" onClick={confirmDanger} disabled={danger}>
              {showDangerConfirm === 'cancel' ? 'Отменить экспедицию' : 'Удалить'}
            </Button>
          </div>
        }
      >
        <p className={styles.leaveModalText}>
          {showDangerConfirm === 'cancel'
            ? 'Экспедиция перейдёт в статус «Отменена». Участники не будут уведомлены автоматически.'
            : 'Черновик будет удалён без возможности восстановления.'}
        </p>
      </Modal>
    </div>
  )
}
