import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConfirmResetPage from '@/app/(site)/(auth)/8qfzgof9uev06a/reset-password/[token]/page'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { ADMIN_2FA_PROVIDER_ID, HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'
import { API_ROUTES, ROUTES } from '@/utils/routes'

const pushMock = vi.fn()
const refreshMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  useParams: () => ({ token: 'valid-reset-token-123' }),
}))

const signInMock = vi.fn()
vi.mock('next-auth/react', () => ({ signIn: (...args: unknown[]) => signInMock(...args) }))

const L = AUTH_LABELS.resetConfirm
const ASP = AUTH_LABELS.adminSetPassword

// A password that passes the client rules (>= PASSWORD_MIN_LENGTH, latin only)
const VALID_PASSWORD = 'newpassword-12345'

// Fills both fields like a user would; `confirm` defaults to the same password.
function fillAndSubmit(password = VALID_PASSWORD, confirm = password) {
  fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: password } })
  fireEvent.change(screen.getByLabelText(ASP.confirmField), { target: { value: confirm } })
  fireEvent.submit(screen.getByRole('button', { name: L.submit }))
}

const LOGIN_AFTER_RESET = '/login?passwordReset=1'
const RESET_OK_BODY = { ok: true, email: 'admin@test.com', challengeToken: 'c'.repeat(64) }

// fetch resolves like a successful reset that returned a sign-in challenge
function resetSucceeds(body: object = RESET_OK_BODY) {
  (fetch as Mock).mockResolvedValue({ ok: true, text: async () => JSON.stringify(body) })
}

beforeEach(() => {
  pushMock.mockReset()
  refreshMock.mockReset()
  signInMock.mockReset()
  vi.stubGlobal('fetch', vi.fn())
})

describe('ConfirmResetPage — rendering', () => {
  it('renders new password field and submit button', () => {
    render(<ConfirmResetPage />)
    expect(screen.getByLabelText(ASP.passwordField)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: L.submit })).toBeInTheDocument()
  })
})

describe('ConfirmResetPage — same fields and rules as the first password ("Создайте пароль")', () => {
  it('has a "Подтвердите пароль" field', () => {
    render(<ConfirmResetPage />)
    expect(screen.getByLabelText(ASP.confirmField)).toHaveAttribute('autocomplete', 'new-password')
  })

  it('passwords that do not match: mismatch error under the confirm field, no API call', async () => {
    render(<ConfirmResetPage />)
    fillAndSubmit(VALID_PASSWORD, `${VALID_PASSWORD}x`)
    expect(await screen.findByText(ASP.mismatch)).toBeInTheDocument()
    expect(screen.getByLabelText(ASP.confirmField)).toHaveAttribute('aria-invalid', 'true')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('non-latin confirmation: latin-only error under the confirm field, no API call', async () => {
    render(<ConfirmResetPage />)
    fillAndSubmit(VALID_PASSWORD, 'подтверждение-12345')
    expect(await screen.findByText(ASP.latinOnly)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the latin-only error while typing, before submit', () => {
    render(<ConfirmResetPage />)
    fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: 'пароль' } })
    expect(screen.getByText(ASP.latinOnly)).toBeInTheDocument()
  })

  it('each field has a show/hide password button', () => {
    render(<ConfirmResetPage />)
    const [showNew, showConfirm] = screen.getAllByRole('button', { name: 'Показать пароль' })
    fireEvent.click(showNew)
    expect(screen.getByLabelText(ASP.passwordField)).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText(ASP.confirmField)).toHaveAttribute('type', 'password')
    fireEvent.click(showConfirm)
    expect(screen.getByLabelText(ASP.confirmField)).toHaveAttribute('type', 'text')
    expect(screen.getAllByRole('button', { name: 'Скрыть пароль' })).toHaveLength(2)
  })
})

describe('ConfirmResetPage — success: signs the admin in right away', () => {
  it('sends token and new password to the API', async () => {
    resetSucceeds()
    signInMock.mockResolvedValue({ error: undefined })
    render(<ConfirmResetPage />)

    fillAndSubmit('mySecretPassword99')

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(API_ROUTES.auth.resetPassword, {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          token: 'valid-reset-token-123',
          newPassword: 'mySecretPassword99',
        }),
      })
    )
  })

  it('signs in with admin-2fa using the returned email, challenge token and the new password', async () => {
    resetSucceeds()
    signInMock.mockResolvedValue({ error: undefined })
    render(<ConfirmResetPage />)

    fillAndSubmit('mySecretPassword99')

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(ADMIN_2FA_PROVIDER_ID, {
        email: RESET_OK_BODY.email,
        challengeToken: RESET_OK_BODY.challengeToken,
        password: 'mySecretPassword99',
        redirect: false,
      })
    )
  })

  it('after a successful sign-in goes to the home page, not to /login', async () => {
    resetSucceeds()
    signInMock.mockResolvedValue({ error: undefined })
    render(<ConfirmResetPage />)

    fillAndSubmit()

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(ROUTES.home))
    expect(refreshMock).toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalledWith(LOGIN_AFTER_RESET)
  })
})

describe('ConfirmResetPage — password changed but automatic sign-in failed: falls back to /login', () => {
  it('sign-in returns an error → /login?passwordReset=1', async () => {
    resetSucceeds()
    signInMock.mockResolvedValue({ error: 'CredentialsSignin', code: 'account_blocked' })
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(LOGIN_AFTER_RESET))
  })

  it('sign-in throws → /login?passwordReset=1, no error shown (the password is already changed)', async () => {
    resetSucceeds()
    signInMock.mockRejectedValue(new Error('Network failure'))
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(LOGIN_AFTER_RESET))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('API returned no challenge token → /login?passwordReset=1 without trying to sign in', async () => {
    resetSucceeds({ ok: true })
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(LOGIN_AFTER_RESET))
    expect(signInMock).not.toHaveBeenCalled()
  })

  it('API success body is not JSON → /login?passwordReset=1 without trying to sign in', async () => {
    (fetch as Mock).mockResolvedValue({ ok: true, text: async () => '' })
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(LOGIN_AFTER_RESET))
    expect(signInMock).not.toHaveBeenCalled()
  })
})

describe('ConfirmResetPage — errors & loading', () => {
  it('disables submit button during submission', async () => {
    let resolvePromise!: (v: unknown) => void
    ;(fetch as Mock).mockReturnValue(new Promise((r) => { resolvePromise = r }))

    render(<ConfirmResetPage />)
    fillAndSubmit()

    // The page also has show/hide buttons, so pick the submit button by its text.
    const button = screen.getByRole('button', { name: L.submitting })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')

    resolvePromise({ ok: true })
    await waitFor(() => expect(pushMock).toHaveBeenCalled())
  })

  it('used or expired link: explains it in Russian and offers to request a new link', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: 'Invalid or expired link', code: 'invalid_link' }),
    })
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.resetLinkInvalid)
    )
    expect(screen.queryByText(/Invalid or expired link/)).toBeNull()
    expect(screen.getByRole('link', { name: L.requestNewLink })).toHaveAttribute('href', ROUTES.resetPassword)
  })

  it('never shows the raw "Validation failed" from the server', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: 'Validation failed', issues: { newPassword: ['Too small'] } }),
    })
    render(<ConfirmResetPage />)
    fillAndSubmit()
    expect(await screen.findByText(ASP.tooShort)).toBeInTheDocument()
    expect(screen.queryByText(/Validation failed|Too small/)).toBeNull()
  })

  it('unknown server error text is replaced by the generic message', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: 'Internal server error' }),
    })
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.generic))
    expect(screen.queryByText('Internal server error')).toBeNull()
  })

  it('falls back to generic error when API returns no error message or non-JSON', async () => {
    (fetch as Mock).mockResolvedValue({ ok: false, text: async () => '' })
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.generic)
    )
  })

  it('shows network error when fetch throws', async () => {
    (fetch as Mock).mockRejectedValue(new Error('Network failure'))
    render(<ConfirmResetPage />)
    fillAndSubmit()
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.network)
    )
  })
})
describe('ConfirmResetPage — client validation (same rules as "Создайте пароль")', () => {
  it('disables native browser validation on the form', () => {
    render(<ConfirmResetPage />)
    expect(screen.getByRole('button', { name: L.submit }).closest('form')).toHaveAttribute('novalidate')
  })

  it('too short: shows the length rule under the field and does not call the API', async () => {
    render(<ConfirmResetPage />)
    fillAndSubmit('short1')
    expect(await screen.findByText(ASP.tooShort)).toBeInTheDocument()
    expect(screen.getByLabelText(ASP.passwordField)).toHaveAttribute('aria-invalid', 'true')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('non-latin characters: shows the latin-only rule and does not call the API', async () => {
    render(<ConfirmResetPage />)
    fillAndSubmit('пароль-кириллицей-123')
    expect(await screen.findByText(ASP.latinOnly)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('clears the field error as soon as the user edits the password', async () => {
    render(<ConfirmResetPage />)
    fillAndSubmit('short1')
    await screen.findByText(ASP.tooShort)
    fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: 'short12' } })
    expect(screen.queryByText(ASP.tooShort)).toBeNull()
  })
})
