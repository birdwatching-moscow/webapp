'use client'

import { useState, useEffect, useTransition, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { updateWalkFull, publishWalk } from '@/app/admin/walks/_actions'
import { ROUTES } from '@/utils/routes'
import styles from './walk-edit.module.css'

type Guide = { id: number; name: string }

type TicketTypeRow = {
  key: string
  name: string
  priceRub: string
  capacity: string
}

type WalkData = {
  id: string
  title: string
  subtitle: string | null
  description: string
  startsAt: string
  endsAt: string
  location: string
  coverPhotoUrl: string
  guideId: number
  guideId2: number | null
  status: string
  ticketTypes: { name: string; priceKopecks: number | null; capacity: number }[]
}

interface Props {
  walk: WalkData
  guides: Guide[]
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Активна',
  CANCELLED: 'Отменена',
  PAST: 'Прошла',
}

function statusBadgeClass(status: string) {
  if (status === 'DRAFT')     return styles.badgeDRAFT
  if (status === 'ACTIVE')    return styles.badgeACTIVE
  if (status === 'CANCELLED') return styles.badgeCANCELLED
  return styles.badgePAST
}

function makeKey() {
  return Math.random().toString(36).slice(2)
}

function initialTickets(types: WalkData['ticketTypes']): TicketTypeRow[] {
  if (types.length === 0) return [{ key: makeKey(), name: 'Стандартный', priceRub: '', capacity: '' }]
  return types.map(t => ({
    key: makeKey(),
    name: t.name,
    priceRub: t.priceKopecks != null ? String(t.priceKopecks / 100) : '',
    capacity: String(t.capacity),
  }))
}

const MAX_TICKETS = 5
const MAX_GUIDES = 2

export function WalkEditForm({ walk, guides }: Props) {
  const router = useRouter()
  const isEditable = walk.status === 'ACTIVE' || walk.status === 'DRAFT'

  const [title, setTitle]       = useState(walk.title)
  const [subtitle, setSubtitle] = useState(walk.subtitle ?? '')
  const [description, setDescription] = useState(walk.description)
  const [startsAt, setStartsAt] = useState(walk.startsAt)
  const [endsAt, setEndsAt]     = useState(walk.endsAt)
  const [location, setLocation] = useState(walk.location)
  const [coverUrl, setCoverUrl] = useState(walk.coverPhotoUrl)
  const [guideId, setGuideId]   = useState(String(walk.guideId))
  const [guideId2, setGuideId2] = useState(walk.guideId2 ? String(walk.guideId2) : '')
  const [tickets, setTickets]   = useState<TicketTypeRow[]>(() => initialTickets(walk.ticketTypes))

  const [isDirty, setIsDirty]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [saving, startSave]     = useTransition()
  const [publishing, startPublish] = useTransition()

  const titleId = useId()

  function markDirty() { setIsDirty(true) }

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function handleBack() {
    if (isDirty && !window.confirm('Вы внесли изменения, которые ещё не сохранены.\nУйти и потерять их?')) return
    router.push(ROUTES.admin.walks)
  }

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
      ticketTypes: tickets.map(t => ({
        name: t.name.trim() || 'Без названия',
        priceKopecks: t.priceRub !== '' ? Math.round(parseFloat(t.priceRub) * 100) : null,
        capacity: parseInt(t.capacity, 10) || 0,
      })),
    }
  }

  function handleSave() {
    setError(null)
    startSave(async () => {
      try {
        await updateWalkFull(walk.id, buildPayload())
        setIsDirty(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при сохранении')
      }
    })
  }

  function handlePublish() {
    setError(null)
    startPublish(async () => {
      try {
        await publishWalk(walk.id)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при публикации')
      }
    })
  }

  // ── Ticket helpers ──────────────────────────────────────────
  function updateTicket(key: string, patch: Partial<TicketTypeRow>) {
    setTickets(prev => prev.map(t => t.key === key ? { ...t, ...patch } : t))
    markDirty()
  }
  function addTicket() {
    if (tickets.length >= MAX_TICKETS) return
    setTickets(prev => [...prev, { key: makeKey(), name: '', priceRub: '', capacity: '' }])
    markDirty()
  }
  function removeTicket(key: string) {
    if (tickets.length <= 1) return
    setTickets(prev => prev.filter(t => t.key !== key))
    markDirty()
  }

  // ── Guide helpers ───────────────────────────────────────────
  const guide2Options = guides.filter(g => g.id !== Number(guideId))

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          ← Прогулки
        </button>
        <div className={styles.topBarRight}>
          <span className={[styles.badge, statusBadgeClass(walk.status)].join(' ')}>
            {STATUS_LABELS[walk.status] ?? walk.status}
          </span>
          {isDirty && (
            <span className={styles.dirtyHint}>Несохранённые изменения</span>
          )}
          {isEditable && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving ? 'Сохранение…' : 'Сохранить'}
            </Button>
          )}
          {walk.status === 'DRAFT' && (
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

      {!isEditable && (
        <div className={styles.readonlyBanner}>
          Эта прогулка доступна только для просмотра — редактирование возможно только в статусах «Черновик» и «Активна».
        </div>
      )}

      {error && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <div className={styles.sections}>

        {/* ── Основное ───────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основное</h2>

          <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={`${styles.label} ${styles.required}`} htmlFor={titleId}>
                Название
              </label>
              <input
                id={titleId}
                className={styles.input}
                value={title}
                onChange={e => { setTitle(e.target.value); markDirty() }}
                disabled={!isEditable}
                required
              />
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Подзаголовок</label>
              <input
                className={styles.input}
                value={subtitle}
                onChange={e => { setSubtitle(e.target.value); markDirty() }}
                disabled={!isEditable}
                placeholder="Краткое описание под заголовком"
              />
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={`${styles.label} ${styles.required}`}>Описание</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={e => { setDescription(e.target.value); markDirty() }}
                disabled={!isEditable}
                rows={6}
                required
              />
            </div>
          </div>
        </section>

        {/* ── Дата и место ───────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Дата и место</h2>
          <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`}>Начало</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={startsAt}
                onChange={e => { setStartsAt(e.target.value); markDirty() }}
                disabled={!isEditable}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Окончание</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={endsAt}
                min={startsAt || undefined}
                onChange={e => { setEndsAt(e.target.value); markDirty() }}
                disabled={!isEditable}
              />
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={`${styles.label} ${styles.required}`}>Локация</label>
              <input
                className={styles.input}
                value={location}
                onChange={e => { setLocation(e.target.value); markDirty() }}
                disabled={!isEditable}
                required
              />
            </div>
          </div>
        </section>

        {/* ── Гиды ───────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Гиды</h2>
          <div className={styles.guidesRow}>
            <div className={styles.guideField}>
              <label className={`${styles.label} ${styles.required}`}>Гид</label>
              <select
                className={styles.select}
                value={guideId}
                onChange={e => {
                  setGuideId(e.target.value)
                  if (e.target.value === guideId2) setGuideId2('')
                  markDirty()
                }}
                disabled={!isEditable}
                required
              >
                {guides.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {guideId2 ? (
              <>
                <div className={styles.guideField}>
                  <label className={styles.label}>Второй гид</label>
                  <select
                    className={styles.select}
                    value={guideId2}
                    onChange={e => { setGuideId2(e.target.value); markDirty() }}
                    disabled={!isEditable}
                  >
                    {guide2Options.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                {isEditable && (
                  <button
                    type="button"
                    className={styles.removeGuideBtn}
                    onClick={() => { setGuideId2(''); markDirty() }}
                    aria-label="Убрать второго гида"
                    style={{ marginTop: 20 }}
                  >
                    ×
                  </button>
                )}
              </>
            ) : (
              isEditable && guide2Options.length > 0 && (
                <button
                  type="button"
                  className={styles.addGuideBtn}
                  onClick={() => { setGuideId2(String(guide2Options[0].id)); markDirty() }}
                  style={{ marginTop: 20 }}
                >
                  + Второй гид
                </button>
              )
            )}
          </div>
        </section>

        {/* ── Обложка ────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Обложка</h2>
          <div className={styles.photoPlaceholder}>
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Обложка" className={styles.photoThumb} />
            )}
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={`${styles.label} ${styles.required}`}>URL фото</label>
              <input
                className={styles.input}
                type="url"
                value={coverUrl}
                onChange={e => { setCoverUrl(e.target.value); markDirty() }}
                disabled={!isEditable}
                placeholder="https://..."
              />
              <span className={styles.photoNote}>Выбор из медиатеки появится позже</span>
            </div>
          </div>
        </section>

        {/* ── Билеты ─────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Билеты</h2>

          <div className={styles.ticketList}>
            <div className={styles.ticketColLabels}>
              <span className={styles.ticketColLabel}>Тип</span>
              <span className={styles.ticketColLabel}>Цена (₽)</span>
              <span className={styles.ticketColLabel}>Количество</span>
              <span />
            </div>

            {tickets.map((t) => (
              <div key={t.key} className={styles.ticketRow}>
                <input
                  className={`${styles.input} ${styles.ticketName}`}
                  value={t.name}
                  onChange={e => updateTicket(t.key, { name: e.target.value })}
                  disabled={!isEditable}
                  placeholder="Название типа"
                />
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  step="1"
                  value={t.priceRub}
                  onChange={e => updateTicket(t.key, { priceRub: e.target.value })}
                  disabled={!isEditable}
                  placeholder="Не указана"
                />
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  step="1"
                  value={t.capacity}
                  onChange={e => updateTicket(t.key, { capacity: e.target.value })}
                  disabled={!isEditable}
                  placeholder="0"
                />
                <button
                  type="button"
                  className={styles.removeTicketBtn}
                  onClick={() => removeTicket(t.key)}
                  disabled={!isEditable || tickets.length <= 1}
                  aria-label="Удалить тип билета"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {isEditable && (
            <button
              type="button"
              className={styles.addTicketBtn}
              onClick={addTicket}
              disabled={tickets.length >= MAX_TICKETS}
            >
              + Добавить тип{tickets.length >= MAX_TICKETS ? ' (максимум 5)' : ''}
            </button>
          )}
        </section>

      </div>
    </div>
  )
}
