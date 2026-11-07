import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/(auth)/register/page'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import {
  HTTP_METHOD,
  JSON_HEADERS,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  LOGIN_CODE_LENGTH,
} from '@/lib/constants'

const pushMock = vi.fn()
const refreshMock = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, refresh: refreshMock }) }))
vi.mock('next-auth/react', () => ({ signIn: vi.fn().mockResolvedValue({ error: null }) }))

const L = AUTH_LABELS.register
const C = AUTH_LABELS.common

const SUBMIT_BTN = 'Получить код'

function fillOtpCode(code: string) {
  Array.from({ length: LOGIN_CODE_LENGTH }).forEach((_, i) => {
    const input = screen.getByLabelText(`Цифра ${i + 1} из ${LOGIN_CODE_LENGTH}`)
    fireEvent.change(input, { target: { value: code[i] } })
  })
}

async function submitForm({ name = 'Иван', email = 'ivan@test.com' } = {}) {
  fireEvent.change(screen.getByLabelText(L.nameField), { target: { value: name } })
  fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: email } })
  fireEvent.click(screen.getByRole('button', { name: SUBMIT_BTN }))
  await waitFor(() => screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`))
}

beforeEach(() => {
  pushMock.mockReset()
  vi.stubGlobal('fetch', vi.fn())
})

describe('RegisterPage — rendering', () => {
  it('renders name and email fields but no password field', () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(L.nameField)).toBeInTheDocument()
    expect(screen.getByLabelText(C.emailField)).toBeInTheDocument()
    expect(screen.queryByLabelText(C.passwordField)).toBeNull()
  })

  it('renders submit button immediately (always visible)', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('button', { name: SUBMIT_BTN })).toBeInTheDocument()
  })

})

describe('RegisterPage — success', () => {
  it('sends { email, name } (no password) and shows OTP step on success', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: true, json: async () => ({ csrfToken: 'mock-token' }) })
    render(<RegisterPage />)
    await submitForm({ name: 'Мария', email: 'maria@test.com' })
    expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: HTTP_METHOD.POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({ email: 'maria@test.com', name: 'Мария' }),
    })
    expect(screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`)).toBeInTheDocument()
  })

  it('request body does not contain a password key', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: true, json: async () => ({}) })
    render(<RegisterPage />)
    await submitForm()
    const body = JSON.parse((fetch as Mock).mock.calls[0][1].body as string) as Record<string, unknown>
    expect('password' in body).toBe(false)
  })
})

describe('RegisterPage — errors', () => {
  it('shows email-taken error on 409', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: false, status: HTTP_STATUS_CONFLICT, json: async () => ({}) })
    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(L.nameField), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: 'ivan@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BTN }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.emailTaken)
    )
  })

  it('shows generic error on 500', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: false, status: HTTP_STATUS_INTERNAL_SERVER_ERROR, json: async () => ({}) })
    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(L.nameField), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: 'ivan@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BTN }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.generic)
    )
  })

  it('shows network error when fetch rejects', async () => {
    ;(fetch as Mock).mockRejectedValue(new Error('Network failure'))
    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(L.nameField), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: 'ivan@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BTN }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.network)
    )
  })
})

describe('RegisterPage — loading state', () => {
  it('disables submit button while request is in flight', async () => {
    let resolve!: (v: unknown) => void
    ;(fetch as Mock).mockReturnValue(new Promise((r) => { resolve = r }))
    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(L.nameField), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: 'ivan@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BTN }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: SUBMIT_BTN })).toBeDisabled()
    )
    resolve({ ok: true, json: async () => ({ csrfToken: 'mock-token' }) })
    await waitFor(() => screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`))
  })
})

describe('RegisterPage — OTP step', () => {
  it('shows back button on OTP step', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
    render(<RegisterPage />)
    await submitForm()
    expect(screen.getByRole('button', { name: 'Назад' })).toBeInTheDocument()
  })

  it('back button returns to form step', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
    render(<RegisterPage />)
    await submitForm()
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }))
    await waitFor(() => expect(screen.getByRole('button', { name: SUBMIT_BTN })).toBeInTheDocument())
  })

  it('auto-submits verify request when all OTP digits are filled', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
    render(<RegisterPage />)
    await submitForm({ name: 'Мария', email: 'maria@test.com' })
    fillOtpCode('1'.repeat(LOGIN_CODE_LENGTH))
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/auth/verify-registration-code', expect.any(Object))
    )
  })

  it('shows error and clears boxes on wrong code', async () => {
    ;(fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
    render(<RegisterPage />)
    await submitForm()
    fillOtpCode('9'.repeat(LOGIN_CODE_LENGTH))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.invalidCode)
    )
    expect(screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`)).toHaveValue('')
  })
})
