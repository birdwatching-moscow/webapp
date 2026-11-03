import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { useSessionMock, signOutMock, usePathnameMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
  signOutMock: vi.fn(),
  usePathnameMock: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
  signOut: signOutMock,
}))

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}))

import { Header } from '@/components/Header'

const SESSION_UNAUTH = { status: 'unauthenticated', data: null } as const
const SESSION_AUTH   = { status: 'authenticated', data: { user: { name: 'Test', email: 'test@test.com' } } } as const
const SESSION_LOAD   = { status: 'loading', data: null } as const

function renderHeader() {
  return render(<Header />)
}

// ─── Structure ───────────────────────────────────────────────────────────────

describe('Header — structure', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_UNAUTH)
    usePathnameMock.mockReturnValue('/')
  })

  it('renders a <header> element', () => {
    const { container } = renderHeader()
    expect(container.querySelector('header')).not.toBeNull()
  })

  it('renders the Logo with aria-label "Birdwatching Moscow"', () => {
    renderHeader()
    expect(screen.getByRole('img', { name: 'Birdwatching Moscow' })).toBeDefined()
  })
})

// ─── Nav links ───────────────────────────────────────────────────────────────

describe('Header — nav links', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_UNAUTH)
    usePathnameMock.mockReturnValue('/')
  })

  it.each([
    ['Прогулки',    '/walks'],
    ['Экспедиции',  '/expeditions'],
    ['Частные',     '/private-events'],
    ['Книга',       '/book'],
    ['О проекте',   '/about'],
  ])('renders nav link "%s" with href "%s"', (label, href) => {
    const { container } = renderHeader()
    const link = container.querySelector(`a[href="${href}"]`)
    expect(link, `expected link with href="${href}"`).not.toBeNull()
    expect(link?.textContent).toBe(label)
  })
})

// ─── CTA — unauthenticated ───────────────────────────────────────────────────

describe('Header — CTA (unauthenticated)', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_UNAUTH)
    usePathnameMock.mockReturnValue('/')
  })

  it('renders a "Войти" link pointing to /login', () => {
    const { container } = renderHeader()
    const link = container.querySelector('a[href="/login"]')
    expect(link).not.toBeNull()
    expect(link?.textContent).toBe('Войти')
  })

  it('does not render "Личный кабинет"', () => {
    renderHeader()
    expect(screen.queryByText('Личный кабинет')).toBeNull()
  })

  it('does not render a "Выйти" button', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: 'Выйти' })).toBeNull()
  })
})

// ─── CTA — authenticated, not on /profile ────────────────────────────────────

describe('Header — CTA (authenticated, not on /profile)', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_AUTH)
    usePathnameMock.mockReturnValue('/')
  })

  it('renders "Личный кабинет" link pointing to /profile', () => {
    const { container } = renderHeader()
    const link = container.querySelector('a[href="/profile"]')
    expect(link).not.toBeNull()
    expect(link?.textContent).toBe('Личный кабинет')
  })

  it('does not render "Войти"', () => {
    renderHeader()
    expect(screen.queryByText('Войти')).toBeNull()
  })

  it('does not render a "Выйти" button', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: 'Выйти' })).toBeNull()
  })
})

// ─── CTA — authenticated, on /profile ────────────────────────────────────────

describe('Header — CTA (authenticated, on /profile)', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_AUTH)
    usePathnameMock.mockReturnValue('/profile')
  })

  it('renders a "Выйти" button', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeDefined()
  })

  it('does not render "Личный кабинет"', () => {
    renderHeader()
    expect(screen.queryByText('Личный кабинет')).toBeNull()
  })

  it('does not render a "Войти" link', () => {
    const { container } = renderHeader()
    expect(container.querySelector('a[href="/login"]')).toBeNull()
  })

  it('calls signOut({ redirectTo: "/" }) when "Выйти" is clicked', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Выйти' }))
    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: '/' })
  })
})

// ─── CTA — loading ───────────────────────────────────────────────────────────

describe('Header — CTA (loading)', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_LOAD)
    usePathnameMock.mockReturnValue('/')
  })

  it('renders no "Войти" link', () => {
    const { container } = renderHeader()
    expect(container.querySelector('a[href="/login"]')).toBeNull()
  })

  it('renders no "Личный кабинет" link', () => {
    renderHeader()
    expect(screen.queryByText('Личный кабинет')).toBeNull()
  })

  it('renders no "Выйти" button', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: 'Выйти' })).toBeNull()
  })
})

// ─── Mobile overlay ───────────────────────────────────────────────────────────

describe('Header — mobile overlay', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_UNAUTH)
    usePathnameMock.mockReturnValue('/')
  })

  afterEach(() => {
    // Clean up any body classes left by the component
    document.body.classList.remove('no-scroll')
  })

  it('hamburger button is present with aria-label "Открыть меню"', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Открыть меню' })).toBeDefined()
  })

  it('overlay is not visible before hamburger is clicked', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: 'Закрыть меню' })).toBeNull()
  })

  it('clicking hamburger opens the overlay', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    expect(screen.getByRole('button', { name: 'Закрыть меню' })).toBeDefined()
  })

  it('overlay contains all five nav links', () => {
    const { container } = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    expect(container.querySelector('a[href="/walks"]')).not.toBeNull()
    expect(container.querySelector('a[href="/expeditions"]')).not.toBeNull()
    expect(container.querySelector('a[href="/private-events"]')).not.toBeNull()
    expect(container.querySelector('a[href="/book"]')).not.toBeNull()
    expect(container.querySelector('a[href="/about"]')).not.toBeNull()
  })

  it('overlay contains the CTA link', () => {
    const { container } = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    expect(container.querySelector('a[href="/login"]')).not.toBeNull()
  })

  it('clicking the close button closes the overlay', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть меню' }))
    expect(screen.queryByRole('button', { name: 'Закрыть меню' })).toBeNull()
  })

  it('clicking a nav link inside the overlay closes the overlay', () => {
    const { container } = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    // Find a nav link and click it — after opening overlay there are multiple, grab one
    const walksLinks = container.querySelectorAll('a[href="/walks"]')
    fireEvent.click(walksLinks[walksLinks.length - 1]) // click the one inside the overlay
    expect(screen.queryByRole('button', { name: 'Закрыть меню' })).toBeNull()
  })

  it('adds "no-scroll" class to document.body when overlay is open', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    expect(document.body.classList.contains('no-scroll')).toBe(true)
  })

  it('removes "no-scroll" class from document.body when overlay is closed', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть меню' }))
    expect(document.body.classList.contains('no-scroll')).toBe(false)
  })
})

// ─── Mobile overlay — edge cases ─────────────────────────────────────────────

describe('Header — mobile overlay edge cases', () => {
  beforeEach(() => {
    useSessionMock.mockReturnValue(SESSION_UNAUTH)
    usePathnameMock.mockReturnValue('/')
  })

  afterEach(() => {
    document.body.classList.remove('no-scroll')
  })

  it('pressing Escape closes the overlay', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    expect(screen.getByRole('button', { name: 'Закрыть меню' })).toBeDefined()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: 'Закрыть меню' })).toBeNull()
  })

  it('changing pathname closes the overlay', () => {
    const { rerender } = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }))
    expect(screen.getByRole('button', { name: 'Закрыть меню' })).toBeDefined()

    usePathnameMock.mockReturnValue('/walks')
    rerender(<Header />)

    expect(screen.queryByRole('button', { name: 'Закрыть меню' })).toBeNull()
  })
})
