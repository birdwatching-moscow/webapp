import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { FragmentsGallery } from '@/components/BookPage/FragmentsGallery'
import type { BookFragment } from '@/types/book'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

// jsdom has no showModal(); mimic the browser: toggle `open` and fire "close".
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

const FRAGMENTS: BookFragment[] = [
  { img: '/book/f1.png', pdf: '/book/f1.pdf', label: 'Фрагмент 1' },
  { img: '/book/f2.png', pdf: '/book/f2.pdf', label: 'Фрагмент 2' },
  { img: '/book/f3.png', pdf: '/book/f3.pdf', label: 'Фрагмент 3' },
]

const dialog = () => document.querySelector('dialog') as HTMLDialogElement
const isOpen = () => dialog().hasAttribute('open')

function openFragment(n: number) {
  const card = screen.getAllByRole('link', { name: /Фрагмент/ })[n - 1]
  const notPrevented = fireEvent.click(card)
  return notPrevented
}

describe('FragmentsGallery — cards', () => {
  it('renders a card per fragment linking to its PDF (works without JS)', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    const cards = screen.getAllByRole('link', { name: /Фрагмент/ })
    expect(cards.map(c => c.getAttribute('href'))).toEqual(['/book/f1.pdf', '/book/f2.pdf', '/book/f3.pdf'])
  })

  it('cards no longer open a new tab', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    screen.getAllByRole('link', { name: /Фрагмент/ }).forEach(card => {
      expect(card).not.toHaveAttribute('target', '_blank')
    })
  })

  it('the lightbox is closed initially', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    expect(isOpen()).toBe(false)
  })
})

describe('FragmentsGallery — opening', () => {
  it('clicking a card opens the lightbox in the current tab instead of navigating', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    const notPrevented = openFragment(2)
    expect(notPrevented).toBe(false) // default navigation was prevented
    expect(isOpen()).toBe(true)
  })

  it('shows the clicked fragment and its position', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(2)
    const box = within(dialog())
    expect(box.getByRole('img', { name: 'Фрагмент 2' })).toHaveAttribute('src', '/book/f2.png')
    expect(box.getByText('Фрагмент 2 из 3')).toBeInTheDocument()
  })

  it('offers the current fragment as a PDF download', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(3)
    const download = within(dialog()).getByRole('link', { name: 'Скачать PDF' })
    expect(download).toHaveAttribute('href', '/book/f3.pdf')
    expect(download).toHaveAttribute('download')
  })
})

describe('FragmentsGallery — navigation', () => {
  it('next / previous buttons switch fragments', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(1)
    const box = within(dialog())
    fireEvent.click(box.getByRole('button', { name: 'Следующий фрагмент' }))
    expect(box.getByText('Фрагмент 2 из 3')).toBeInTheDocument()
    fireEvent.click(box.getByRole('button', { name: 'Предыдущий фрагмент' }))
    expect(box.getByText('Фрагмент 1 из 3')).toBeInTheDocument()
  })

  it('previous is disabled on the first fragment, next on the last', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(1)
    expect(within(dialog()).getByRole('button', { name: 'Предыдущий фрагмент' })).toBeDisabled()
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Следующий фрагмент' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Следующий фрагмент' }))
    expect(within(dialog()).getByRole('button', { name: 'Следующий фрагмент' })).toBeDisabled()
  })

  it('arrow keys switch fragments and stop at the ends', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(3)
    fireEvent.keyDown(dialog(), { key: 'ArrowRight' })
    expect(within(dialog()).getByText('Фрагмент 3 из 3')).toBeInTheDocument()
    fireEvent.keyDown(dialog(), { key: 'ArrowLeft' })
    expect(within(dialog()).getByText('Фрагмент 2 из 3')).toBeInTheDocument()
  })
})

describe('FragmentsGallery — closing', () => {
  it('the close button closes the lightbox', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(1)
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Закрыть' }))
    expect(isOpen()).toBe(false)
  })

  it('clicking the backdrop (the dialog itself) closes the lightbox', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(1)
    fireEvent.click(dialog())
    expect(isOpen()).toBe(false)
  })

  it('clicking the page image does not close the lightbox', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(1)
    fireEvent.click(within(dialog()).getByRole('img', { name: 'Фрагмент 1' }))
    expect(isOpen()).toBe(true)
  })

  it('can be reopened on another fragment after closing (Esc fires "close")', () => {
    render(<FragmentsGallery fragments={FRAGMENTS} />)
    openFragment(1)
    dialog().close()
    expect(isOpen()).toBe(false)
    openFragment(3)
    expect(isOpen()).toBe(true)
    expect(within(dialog()).getByText('Фрагмент 3 из 3')).toBeInTheDocument()
  })
})
