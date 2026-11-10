'use client'

import { useState, useEffect, useTransition, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { Modal } from '@/components/ui/modal/Modal'
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
  emailSubject: string | null
  emailBody: string | null
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

export function WalkEditForm({ walk, guides }: Props) {
  const router = useRouter()
  const isEditable = walk.status === 'ACTIVE' || walk.status === 'DRAFT'

  const [title, setTitle]       = useState(walk.title)
  const [subtitle, setSubtitle] = useState(walk.subtitle ?? '')
  const [description, setDescription] = useState(walk.description)
  const [startsAt, setStartsAt] = useState(walk.startsAt)
  const [endsAt, setEndsAt]     = useState(walk.endsAt)
  const [location, setLocation] = useState(walk.location)
  const [coverUrl, setCoverUrl]         = useState(walk.coverPhotoUrl)
  const [guideId, setGuideId]           = useState(String(walk.guideId))
  const [guideId2, setGuideId2]         = useState(walk.guideId2 ? String(walk.guideId2) : '')
  const [tickets, setTickets]           = useState<TicketTypeRow[]>(() => initialTickets(walk.ticketTypes))
  const [emailSubject, setEmailSubject] = useState(walk.emailSubject ?? '')
  const [emailBody, setEmailBody]       = useState(walk.emailBody ?? '')
  const [formTab, setFormTab]           = useState<'walk' | 'email'>('walk')

  const [isDirty, setIsDirty]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [saving, startSave]     = useTransition()
  const [publishing, startPublish] = useTransition()

  const titleId = useId()

  const requireAll = walk.status === 'ACTIVE'

  function markDirty() { setIsDirty(true) }

  function getPublishErrors(): string[] {
    const errors: string[] = []
    if (!subtitle.trim()) errors.push('Подзаголовок')
    if (!description.trim()) errors.push('Описание')
    if (!startsAt) errors.push('Дата начала')
    if (!endsAt) errors.push('Дата окончания')
    if (!location.trim()) errors.push('Локация')
    if (!guideId) errors.push('Гид')
    if (!coverUrl.trim()) errors.push('URL фото')
    if (!tickets.some(t => t.name.trim() !== '' && t.priceRub !== '' && t.capacity !== '')) errors.push('хотя бы один билет с названием, ценой и количеством')
    if (!emailSubject.trim()) errors.push('Тема письма')
    if (!emailBody.trim()) errors.push('Текст письма')
    return errors
  }

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function walksListHref() {
    if (walk.status === 'DRAFT') return `${ROUTES.admin.walks}?tab=draft`
    if (walk.status === 'ACTIVE') return ROUTES.admin.walks
    return `${ROUTES.admin.walks}?tab=all`
  }

  function handleBack() {
    if (isDirty) { setShowLeaveConfirm(true); return }
    router.push(walksListHref())
  }

  function confirmLeave() {
    setShowLeaveConfirm(false)
    router.push(walksListHref())
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
      emailSubject: emailSubject.trim() || undefined,
      emailBody: emailBody.trim() || undefined,
      ticketTypes: tickets.map(t => ({
        name: t.name.trim() || 'Без названия',
        priceKopecks: t.priceRub !== '' ? Math.round(parseFloat(t.priceRub) * 100) : null,
        capacity: parseInt(t.capacity, 10) || 0,
      })),
    }
  }

  function handleSave() {
    setError(null)
    if (walk.status === 'ACTIVE') {
      const errors = getPublishErrors()
      if (errors.length > 0) {
        setError(`Не заполнены обязательные поля: ${errors.join(', ')}`)
        return
      }
    } else {
      if (!title.trim()) {
        setError('Название обязательно')
        return
      }
    }
    startSave(async () => {
      try {
        await updateWalkFull(walk.id, buildPayload())
        setIsDirty(false)
        router.push(walksListHref())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при сохранении')
      }
    })
  }

  function handlePublish() {
    setError(null)
    if (!title.trim()) {
      setError('Название обязательно')
      return
    }
    const errors = getPublishErrors()
    if (errors.length > 0) {
      setError(`Нельзя опубликовать: не заполнены — ${errors.join(', ')}`)
      return
    }
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

      {formTab === 'walk' && <div className={styles.sections}>

        {/* ── Основное ───────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основное</h2>

          <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={`${styles.label} ${styles.required}`} htmlFor={titleId}>
                Название
              </label>
              <input
                id={titleId}
                className={styles.input}
                value={title}
                onChange={e => { setTitle(e.target.value); markDirty() }}
                disabled={!isEditable}
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Подзаголовок</label>
              <input
                className={styles.input}
                value={subtitle}
                onChange={e => { setSubtitle(e.target.value); markDirty() }}
                disabled={!isEditable}
                placeholder="Краткое описание под заголовком"
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Описание</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={e => { setDescription(e.target.value); markDirty() }}
                disabled={!isEditable}
                rows={6}
              />
            </div>
          </div>
        </section>

        {/* ── Дата и место ───────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Дата и место</h2>
          <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
            <div className={styles.field}>
              <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Начало</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={startsAt}
                onChange={e => { setStartsAt(e.target.value); markDirty() }}
                disabled={!isEditable}
              />
            </div>
            <div className={styles.field}>
              <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Окончание</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={endsAt}
                min={startsAt || undefined}
                onChange={e => { setEndsAt(e.target.value); markDirty() }}
                disabled={!isEditable}
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Локация</label>
              <input
                className={styles.input}
                value={location}
                onChange={e => { setLocation(e.target.value); markDirty() }}
                disabled={!isEditable}
              />
            </div>
          </div>
        </section>

        {/* ── Гиды ───────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Гиды</h2>
          <div className={styles.guidesRow}>
            <div className={styles.guideField}>
              <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Гид</label>
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
            <div className={`${styles.field} ${styles.photoUrlField}`}>
              <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>URL фото</label>
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
          <h2 className={styles.sectionTitle}>
            Билеты
            {requireAll && !tickets.some(t => t.name.trim() !== '' && t.priceRub !== '' && t.capacity !== '') && (
              <span className={styles.sectionHint}> — хотя бы один с названием, ценой и количеством *</span>
            )}
          </h2>

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

      </div>}

      {formTab === 'email' && <div className={styles.sections}>
        <section className={styles.section}>
          <p className={styles.emailNote}>
            Эти поля используются при отправке уведомлений участникам. Если не заполнены — используется шаблон по умолчанию.
          </p>
          <div className={styles.field}>
            <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Тема письма</label>
            <input
              className={styles.input}
              value={emailSubject}
              onChange={e => { setEmailSubject(e.target.value); markDirty() }}
              disabled={!isEditable}
              placeholder="Например: Напоминание о прогулке «Название»"
            />
          </div>
          <div className={styles.field}>
            <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Текст письма</label>
            <textarea
              className={styles.textarea}
              value={emailBody}
              onChange={e => { setEmailBody(e.target.value); markDirty() }}
              disabled={!isEditable}
              rows={12}
              placeholder="Текст письма участникам..."
            />
          </div>
        </section>
      </div>}

      <Modal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        title="Несохранённые изменения"
        footer={
          <div className={styles.leaveModalFooter}>
            <Button fullWidth variant="secondary" onClick={() => setShowLeaveConfirm(false)}>
              Отмена
            </Button>
            <Button fullWidth variant="destructive" onClick={confirmLeave}>
              Уйти без сохранения
            </Button>
          </div>
        }
      >
        <p className={styles.leaveModalText}>
          Вы внесли изменения, которые ещё не сохранены. Если уйти сейчас — они потеряются.
        </p>
      </Modal>
    </div>
  )
}
