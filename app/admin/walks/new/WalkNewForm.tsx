'use client'

import { useState, useTransition, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { createWalkFull } from '@/app/admin/walks/_actions'
import { ROUTES } from '@/utils/routes'
import styles from '../[id]/walk-edit.module.css'

type Guide = { id: number; name: string }

type TicketTypeRow = {
  key: string
  name: string
  priceRub: string
  capacity: string
}

interface Props {
  guides: Guide[]
}

function makeKey() {
  return Math.random().toString(36).slice(2)
}

const MAX_TICKETS = 5

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
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody]       = useState('')
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
      emailSubject: emailSubject.trim() || undefined,
      emailBody: emailBody.trim() || undefined,
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
    startCreate(async () => {
      try {
        const id = await createWalkFull(buildPayload())
        router.push(`/admin/walks/${id}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при создании')
      }
    })
  }

  // ── Ticket helpers ──────────────────────────────────────────
  function updateTicket(key: string, patch: Partial<TicketTypeRow>) {
    setTickets(prev => prev.map(t => t.key === key ? { ...t, ...patch } : t))
  }
  function addTicket() {
    if (tickets.length >= MAX_TICKETS) return
    setTickets(prev => [...prev, { key: makeKey(), name: '', priceRub: '', capacity: '' }])
  }
  function removeTicket(key: string) {
    if (tickets.length <= 1) return
    setTickets(prev => prev.filter(t => t.key !== key))
  }

  // ── Guide helpers ───────────────────────────────────────────
  const guide2Options = guides.filter(g => g.id !== Number(guideId))

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
                onChange={e => setTitle(e.target.value)}
                placeholder="Например: Утренний бёрдвотчинг в Коломенском"
                autoFocus
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={styles.label}>Подзаголовок</label>
              <input
                className={styles.input}
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Краткое описание под заголовком"
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={styles.label}>Описание</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={e => setDescription(e.target.value)}
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
              <label className={`${styles.label} ${styles.required}`}>Начало</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Окончание</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={endsAt}
                min={startsAt || undefined}
                onChange={e => setEndsAt(e.target.value)}
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={styles.label}>Локация</label>
              <input
                className={styles.input}
                value={location}
                onChange={e => setLocation(e.target.value)}
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
                }}
                required
              >
                <option value="" disabled>Выберите гида</option>
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
                    onChange={e => setGuideId2(e.target.value)}
                  >
                    {guide2Options.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={styles.removeGuideBtn}
                  onClick={() => setGuideId2('')}
                  aria-label="Убрать второго гида"
                >
                  ×
                </button>
              </>
            ) : (
              guide2Options.length > 0 && (
                <button
                  type="button"
                  className={styles.addGuideBtn}
                  onClick={() => setGuideId2(String(guide2Options[0].id))}
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
              <label className={styles.label}>URL фото</label>
              <input
                className={styles.input}
                type="url"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
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
                  placeholder="Название типа"
                />
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  step="1"
                  value={t.priceRub}
                  onChange={e => updateTicket(t.key, { priceRub: e.target.value })}
                  placeholder="Не указана"
                />
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  step="1"
                  value={t.capacity}
                  onChange={e => updateTicket(t.key, { capacity: e.target.value })}
                  placeholder="0"
                />
                <button
                  type="button"
                  className={styles.removeTicketBtn}
                  onClick={() => removeTicket(t.key)}
                  disabled={tickets.length <= 1}
                  aria-label="Удалить тип билета"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.addTicketBtn}
            onClick={addTicket}
            disabled={tickets.length >= MAX_TICKETS}
          >
            + Добавить тип{tickets.length >= MAX_TICKETS ? ' (максимум 5)' : ''}
          </button>
        </section>

      </div>}

      {formTab === 'email' && <div className={styles.sections}>
        <section className={styles.section}>
          <p className={styles.emailNote}>
            Эти поля используются при отправке уведомлений участникам. Если не заполнены — используется шаблон по умолчанию.
          </p>
          <div className={styles.field}>
            <label className={styles.label}>Тема письма</label>
            <input
              className={styles.input}
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              placeholder="Например: Напоминание о прогулке «Название»"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Текст письма</label>
            <textarea
              className={styles.textarea}
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              rows={12}
              placeholder="Текст письма участникам..."
            />
          </div>
        </section>
      </div>}

    </div>
  )
}
