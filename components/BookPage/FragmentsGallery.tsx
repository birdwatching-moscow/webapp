'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CloseIcon } from '@/components/icons/CloseIcon'
import { ChevronIcon } from '@/components/icons/ChevronIcon'
import type { BookFragment } from '@/types/book'
import styles from './FragmentsGallery.module.css'

// Preview PNGs are rendered from the PDF pages (scripts/gen-pdf-previews.mjs).
const PAGE_WIDTH = 1224
const PAGE_HEIGHT = 1584
const CARD_SIZES = '(min-width: 1248px) 33vw, 272px'
const LIGHTBOX_SIZES = '(min-width: 1248px) 720px, 100vw'

type Props = { fragments: BookFragment[] }

/**
 * Fragment cards + an in-page lightbox. Cards stay real links to the PDFs,
 * so without JS they still open the file; with JS a click opens a native
 * <dialog> (Esc, backdrop and focus return are handled by the browser).
 */
export const FragmentsGallery = ({ fragments }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (index !== null && dialog && !dialog.open) dialog.showModal()
  }, [index])

  const close = () => dialogRef.current?.close()
  const lastIndex = fragments.length - 1
  const go = (delta: number) =>
    setIndex(current => (current === null ? current : Math.min(lastIndex, Math.max(0, current + delta))))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }

  // A click that lands on the <dialog> itself (not its content) is the backdrop.
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close()
  }

  const current = index === null ? null : fragments[index]

  return (
    <>
      <div className={styles.scroll}>
        {fragments.map(({ img, pdf, label }, i) => (
          <a
            key={pdf}
            href={pdf}
            className={styles.card}
            aria-label={label}
            onClick={e => {
              e.preventDefault()
              setIndex(i)
            }}
          >
            <Image src={img} alt={label} fill sizes={CARD_SIZES} className={styles.cardImage} />
          </a>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={current?.label}
        onClose={() => setIndex(null)}
        onClick={handleDialogClick}
        onKeyDown={handleKeyDown}
      >
        {current && index !== null && (
          <div className={styles.content}>
            <button type="button" className={styles.close} onClick={close} aria-label="Закрыть">
              <CloseIcon />
            </button>

            <div className={styles.stage}>
              <button
                type="button"
                className={`${styles.nav} ${styles.prev}`}
                onClick={() => go(-1)}
                disabled={index === 0}
                aria-label="Предыдущий фрагмент"
              >
                <ChevronIcon direction="left" />
              </button>

              <Image
                key={current.img}
                src={current.img}
                alt={current.label}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                sizes={LIGHTBOX_SIZES}
                className={styles.page}
              />

              <button
                type="button"
                className={`${styles.nav} ${styles.next}`}
                onClick={() => go(1)}
                disabled={index === lastIndex}
                aria-label="Следующий фрагмент"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>

            <p className={styles.footer}>
              <span>{`Фрагмент ${index + 1} из ${fragments.length}`}</span>
              <a href={current.pdf} download className={styles.download}>
                Скачать PDF
              </a>
            </p>
          </div>
        )}
      </dialog>
    </>
  )
}
