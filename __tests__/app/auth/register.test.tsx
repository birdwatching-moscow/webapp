import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/(site)/(auth)/register/page'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import {
  HTTP_METHOD,
  JSON_HEADERS,
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

describe('RegisterPage — client validation (same as login)', () => {
  const NAME_REQUIRED = 'Введите имя, чтобы продолжить'
  const EMAIL_REQUIRED = 'Введите почту, чтобы продолжить'
  const EMAIL_INVALID = 'Введите почту в формате name@example.ru'

  function fill({ name, email }: { name: string; email: string }) {
    fireEvent.change(screen.getByLabelText(L.nameField), { target: { value: name } })
    fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: email } })
  }

  function clickSubmit() {
    fireEvent.click(screen.getByRole('button', { name: SUBMIT_BTN }))
  }

  it('disables native browser validation on the form', () => {
    render(<RegisterPage />)
    const form = screen.getByRole('button', { name: SUBMIT_BTN }).closest('form')
    expect(form).toHaveAttribute('novalidate')
  })

  it('shows both field errors and does not call the API when name and email are empty', async () => {
    render(<RegisterPage />)
    clickSubmit()
    expect(await screen.findByText(NAME_REQUIRED)).toBeInTheDocument()
    expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the name error and does not call the API when only the name is empty', async () => {
    render(<RegisterPage />)
    fill({ name: '', email: 'ivan@test.com' })
    clickSubmit()
    expect(await screen.findByText(NAME_REQUIRED)).toBeInTheDocument()
    expect(screen.queryByText(EMAIL_REQUIRED)).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('treats a whitespace-only name as empty', async () => {
    render(<RegisterPage />)
    fill({ name: '   ', email: 'ivan@test.com' })
    clickSubmit()
    expect(await screen.findByText(NAME_REQUIRED)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the email error and does not call the API when only the email is empty', async () => {
    render(<RegisterPage />)
    fill({ name: 'Иван', email: '' })
    clickSubmit()
    expect(await screen.findByText(EMAIL_REQUIRED)).toBeInTheDocument()
    expect(screen.queryByText(NAME_REQUIRED)).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the format error and does not call the API for a malformed email', async () => {
    render(<RegisterPage />)
    fill({ name: 'Иван', email: 'ivan@test' })
    clickSubmit()
    expect(await screen.findByText(EMAIL_INVALID)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('marks the invalid inputs with aria-invalid', async () => {
    render(<RegisterPage />)
    clickSubmit()
    await screen.findByText(NAME_REQUIRED)
    expect(screen.getByLabelText(L.nameField)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(C.emailField)).toHaveAttribute('aria-invalid', 'true')
  })

  it('clears a field error as soon as the user edits that field', async () => {
    render(<RegisterPage />)
    clickSubmit()
    await screen.findByText(NAME_REQUIRED)
    fireEvent.change(screen.getByLabelText(L.nameField), { target: { value: 'И' } })
    expect(screen.queryByText(NAME_REQUIRED)).toBeNull()
    expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument()
  })

  it('trims name and email before sending them', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
    render(<RegisterPage />)
    fill({ name: '  Мария  ', email: '  maria@test.com  ' })
    clickSubmit()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const body = JSON.parse((fetch as Mock).mock.calls[0][1].body as string) as Record<string, unknown>
    expect(body).toEqual({ email: 'maria@test.com', name: 'Мария' })
  })

  it('shows the rate-limit message under the email field, like login', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: false, json: async () => ({ error: 'code_rate_limited' }) })
    render(<RegisterPage />)
    fill({ name: 'Иван', email: 'ivan@test.com' })
    clickSubmit()
    const message = await screen.findByText(AUTH_ERRORS.tooManyAttempts)
    expect(screen.getByLabelText(C.emailField)).toHaveAttribute('aria-describedby', message.id)
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

describe('RegisterPage — wrong code: resend', () => {
  const RESEND_BTN = AUTH_LABELS.loginCode.resendCode

  function registerCalls() {
    return (fetch as Mock).mock.calls.filter(([url]) => String(url).includes('/api/auth/register'))
  }

  it('shows the resend button only after a wrong code', async () => {
    ;(fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'invalid_code' }) })
    render(<RegisterPage />)
    await submitForm()
    expect(screen.queryByRole('button', { name: RESEND_BTN })).toBeNull()
    fillOtpCode('9'.repeat(LOGIN_CODE_LENGTH))
    expect(await screen.findByRole('button', { name: RESEND_BTN })).toBeInTheDocument()
  })

  it('resend registers again with the same email and name and clears the error', async () => {
    ;(fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'invalid_code' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'csrf-2' }) })
    render(<RegisterPage />)
    await submitForm({ name: 'Мария', email: 'maria@test.com' })
    fillOtpCode('9'.repeat(LOGIN_CODE_LENGTH))
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(registerCalls()).toHaveLength(2))
    expect(JSON.parse(registerCalls()[1][1].body as string)).toEqual({ email: 'maria@test.com', name: 'Мария' })
    await waitFor(() => expect(screen.queryByText(AUTH_ERRORS.invalidCode)).toBeNull())
    expect(screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`)).toHaveValue('')
  })

  it('shows the "code too frequent" message when the resend is rate limited', async () => {
    ;(fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'invalid_code' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'code_rate_limited' }) })
    render(<RegisterPage />)
    await submitForm()
    fillOtpCode('9'.repeat(LOGIN_CODE_LENGTH))
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.codeTooFrequent))
  })

  it('confirms a successful resend with a status message', async () => {
    ;(fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'invalid_code' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'csrf-2' }) })
    render(<RegisterPage />)
    await submitForm()
    fillOtpCode('9'.repeat(LOGIN_CODE_LENGTH))
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(AUTH_LABELS.loginCode.codeResent)
    )
  })
})
