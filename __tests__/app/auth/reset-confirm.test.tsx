import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConfirmResetPage from '@/app/(site)/(auth)/8qfzgof9uev06a/reset-password/[token]/page'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { HTTP_METHOD, JSON_HEADERS } from '@/lib/constants'
import { API_ROUTES, ROUTES } from '@/utils/routes'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ token: 'valid-reset-token-123' }),
}))

const L = AUTH_LABELS.resetConfirm
const ASP = AUTH_LABELS.adminSetPassword

// A password that passes the client rules (>= PASSWORD_MIN_LENGTH, latin only)
const VALID_PASSWORD = 'newpassword-12345'

function fillAndSubmit(password = VALID_PASSWORD) {
  fireEvent.change(screen.getByLabelText(L.newPasswordField), { target: { value: password } })
  fireEvent.submit(screen.getByRole('button', { name: L.submit }))
}

beforeEach(() => {
  pushMock.mockReset()
  vi.stubGlobal('fetch', vi.fn())
})

describe('ConfirmResetPage — rendering', () => {
  it('renders new password field and submit button', () => {
    render(<ConfirmResetPage />)
    expect(screen.getByLabelText(L.newPasswordField)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: L.submit })).toBeInTheDocument()
  })
})

describe('ConfirmResetPage — success', () => {
  it('sends token and new password to API and redirects to /login?passwordReset=1', async () => {
    (fetch as Mock).mockResolvedValue({ ok: true })
    render(<ConfirmResetPage />)

    fillAndSubmit('mySecretPassword99')

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(API_ROUTES.resetPassword, {
        method: HTTP_METHOD.POST,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          token: 'valid-reset-token-123',
          newPassword: 'mySecretPassword99',
        }),
      })
      expect(pushMock).toHaveBeenCalledWith('/login?passwordReset=1')
    })
  })
})

describe('ConfirmResetPage — errors & loading', () => {
  it('disables submit button during submission', async () => {
    let resolvePromise!: (v: unknown) => void
    ;(fetch as Mock).mockReturnValue(new Promise((r) => { resolvePromise = r }))

    render(<ConfirmResetPage />)
    fillAndSubmit()

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(L.submitting)

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
    expect(screen.getByLabelText(L.newPasswordField)).toHaveAttribute('aria-invalid', 'true')
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
    fireEvent.change(screen.getByLabelText(L.newPasswordField), { target: { value: 'short12' } })
    expect(screen.queryByText(ASP.tooShort)).toBeNull()
  })
})
