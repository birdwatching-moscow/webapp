import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(site)/(auth)/login/page'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_ERROR_ACCOUNT_BLOCKED, AUTH_ERROR_PASSWORD_RESET_REQUIRED } from '@/lib/auth/errors'
import { ADMIN_2FA_PROVIDER_ID, LOGIN_CODE_PROVIDER_ID, LOGIN_CODE_LENGTH } from '@/lib/constants'
import { AUTH_LABELS } from '@/lib/auth-labels'
import { tooManyAttemptsMessage, codeTooFrequentMessage } from '@/lib/auth/rateLimitMessage'

const { pushMock, refreshMock, searchParamsGetMock, signInMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  searchParamsGetMock: vi.fn(),
  signInMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  useSearchParams: () => ({ get: searchParamsGetMock }),
}))
vi.mock('next-auth/react', () => ({ signIn: signInMock }))
vi.mock('@/utils/safeRedirect', () => ({ safeRedirect: (url: string | null) => url ?? '/' }))

const L = AUTH_LABELS.login
const C = AUTH_LABELS.common
const LC = AUTH_LABELS.loginCode
const LA = AUTH_LABELS.adminPassword
const ASP = AUTH_LABELS.adminSetPassword

const TEST_CODE = '1' .repeat(LOGIN_CODE_LENGTH)

/** Fill each OTP digit box in order, triggering auto-submit on the last. */
function fillOtpCode(code: string) {
  for (let i = 0; i < LOGIN_CODE_LENGTH; i++) {
    fireEvent.change(
      screen.getByLabelText(`Цифра ${i + 1} из ${LOGIN_CODE_LENGTH}`),
      { target: { value: code[i] ?? '' } }
    )
  }
}

// Registered user: check-email → { registered: true }, then request-login-code → ok
function stubFetchForUser() {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('check-email')) {
      return Promise.resolve({ ok: true, json: async () => ({ registered: true }) })
    }
    if (String(url).includes('verify-login-code')) {
      return Promise.resolve({ ok: true, json: async () => ({ next: 'session' }) })
    }
    return Promise.resolve({ ok: true, json: async () => ({ csrfToken: 'test-csrf' }) })
  }))
}

function stubFetchForAdmin(challengeToken = 'tok123') {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('check-email')) {
      return Promise.resolve({ ok: true, json: async () => ({ registered: true }) })
    }
    if (String(url).includes('verify-login-code')) {
      return Promise.resolve({ ok: true, json: async () => ({ next: 'password', challengeToken }) })
    }
    return Promise.resolve({ ok: true, json: async () => ({ csrfToken: 'test-csrf' }) })
  }))
}

function stubFetchForAdminNoPassword(verifyChallengeToken = 'tok123', newChallengeToken = 'newtoken456') {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('check-email')) {
      return Promise.resolve({ ok: true, json: async () => ({ registered: true }) })
    }
    if (String(url).includes('verify-login-code')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ next: 'set-password', challengeToken: verifyChallengeToken }),
      })
    }
    if (String(url).includes('set-initial-password')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ challengeToken: newChallengeToken }),
      })
    }
    return Promise.resolve({ ok: true, json: async () => ({ csrfToken: 'test-csrf' }) })
  }))
}

beforeEach(() => {
  pushMock.mockReset()
  refreshMock.mockReset()
  signInMock.mockReset()
  searchParamsGetMock.mockReturnValue(null)
})

// ── Step 1: email entry ─────────────────────────────────────────────────────

describe('LoginPage — step 1 (email)', () => {
  it('email step submit button says "Получить код", not "Продолжить"', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: LC.requestCode })).toHaveAttribute('type', 'submit')
    expect(screen.queryByRole('button', { name: 'Продолжить' })).toBeNull()
  })

  it('renders an email field', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(C.emailField)).toBeDefined()
  })

  it('does not render a password field on step 1', () => {
    render(<LoginPage />)
    expect(screen.queryByLabelText(C.passwordField)).toBeNull()
  })

  it('does NOT render a link to /reset-password', () => {
    render(<LoginPage />)
    expect(screen.queryByRole('link', { name: L.resetLink })).toBeNull()
  })

  it('shows ?registered=1 banner', () => {
    searchParamsGetMock.mockImplementation((k: string) => (k === 'registered' ? '1' : null))
    render(<LoginPage />)
    expect(screen.getByText(L.registered)).toBeDefined()
  })
})

// ── Step 1 → name step (new user) ──────────────────────────────────────────

const NAME_REQUIRED = 'Введите имя, чтобы продолжить'
const NAME_FIELD = 'Имя'
const REQUEST_CODE_BTN = 'Получить код'

// New user: check-email → { registered: false }, then register → ok
function stubFetchForNewUser() {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('check-email')) {
      return Promise.resolve({ ok: true, json: async () => ({ registered: false }) })
    }
    return Promise.resolve({ ok: true, json: async () => ({ csrfToken: 'test-csrf' }) })
  }))
}

async function goToNameStep(email = 'new@test.com') {
  render(<LoginPage />)
  fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: email } })
  fireEvent.submit(screen.getByRole('button', { name: LC.requestCode }))
  await waitFor(() => screen.getByLabelText(NAME_FIELD))
}

function registerCalls() {
  return (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([url]) =>
    String(url).includes('/api/auth/register')
  )
}

describe('LoginPage — name step (new user) validation', () => {
  beforeEach(stubFetchForNewUser)

  it('disables native browser validation on the name form', async () => {
    await goToNameStep()
    const form = screen.getByRole('button', { name: REQUEST_CODE_BTN }).closest('form')
    expect(form).toHaveAttribute('novalidate')
  })

  it('shows the name error and does not call register when the name is empty', async () => {
    await goToNameStep()
    fireEvent.click(screen.getByRole('button', { name: REQUEST_CODE_BTN }))
    expect(await screen.findByText(NAME_REQUIRED)).toBeInTheDocument()
    expect(screen.getByLabelText(NAME_FIELD)).toHaveAttribute('aria-invalid', 'true')
    expect(registerCalls()).toHaveLength(0)
  })

  it('clears the name error as soon as the user types', async () => {
    await goToNameStep()
    fireEvent.click(screen.getByRole('button', { name: REQUEST_CODE_BTN }))
    await screen.findByText(NAME_REQUIRED)
    fireEvent.change(screen.getByLabelText(NAME_FIELD), { target: { value: 'И' } })
    expect(screen.queryByText(NAME_REQUIRED)).toBeNull()
  })
})

// ── Step 2: OTP code entry ──────────────────────────────────────────────────

async function submitEmail(email = 'user@test.com') {
  render(<LoginPage />)
  fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: email } })
  fireEvent.submit(screen.getByRole('button', { name: LC.requestCode }))
  await waitFor(() => screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`))
}

describe('LoginPage — step 2 (OTP code entry)', () => {
  beforeEach(stubFetchForUser)

  it('shows OTP boxes and hides email field after step-1 submit', async () => {
    await submitEmail()
    expect(screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`)).toBeDefined()
    expect(screen.queryByLabelText(C.emailField)).toBeNull()
  })

  it('does not show a password field on step 2', async () => {
    await submitEmail()
    expect(screen.queryByLabelText(C.passwordField)).toBeNull()
  })

  it('calls signIn("login-code") with email and code when verify returns { next:"session" }', async () => {
    signInMock.mockResolvedValue({ error: null, code: null })
    await submitEmail('user@test.com')
    fillOtpCode(TEST_CODE)
    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(LOGIN_CODE_PROVIDER_ID, {
        email: 'user@test.com',
        code: TEST_CODE,
        redirect: false,
      })
    )
  })

  it('redirects to "/" on successful USER login', async () => {
    signInMock.mockResolvedValue({ error: null, code: null })
    await submitEmail()
    fillOtpCode(TEST_CODE)
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'))
  })
})

// ── Step 2 → password step (admin path) ────────────────────────────────────

describe('LoginPage — admin path: verify returns { next:"password" }', () => {
  beforeEach(() => stubFetchForAdmin())

  it('shows password field and hides OTP boxes', async () => {
    await submitEmail('admin@test.com')
    fillOtpCode(TEST_CODE)
    await waitFor(() => screen.getByLabelText(C.passwordField))
    expect(screen.queryByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`)).toBeNull()
  })

  it('does NOT call signIn("login-code") when advancing to password step', async () => {
    await submitEmail('admin@test.com')
    fillOtpCode(TEST_CODE)
    await waitFor(() => screen.getByLabelText(C.passwordField))
    expect(signInMock).not.toHaveBeenCalled()
  })
})

// ── Step 3: password (admin only) ───────────────────────────────────────────

async function advanceToPasswordStep(email = 'admin@test.com', challengeToken = 'tok123') {
  stubFetchForAdmin(challengeToken)
  await submitEmail(email)
  fillOtpCode(TEST_CODE)
  await waitFor(() => screen.getByLabelText(C.passwordField))
}

describe('LoginPage — step 3 (admin password) validation', () => {
  const PASSWORD_REQUIRED = 'Введите пароль, чтобы продолжить'

  it('disables native browser validation on the password form', async () => {
    await advanceToPasswordStep()
    const form = screen.getByRole('button', { name: LA.submit }).closest('form')
    expect(form).toHaveAttribute('novalidate')
  })

  it('shows the password error and does not call signIn when the password is empty', async () => {
    await advanceToPasswordStep()
    fireEvent.click(screen.getByRole('button', { name: LA.submit }))
    expect(await screen.findByText(PASSWORD_REQUIRED)).toBeInTheDocument()
    expect(screen.getByLabelText(C.passwordField)).toHaveAttribute('aria-invalid', 'true')
    expect(signInMock).not.toHaveBeenCalled()
  })

  it('clears the password error as soon as the user types', async () => {
    await advanceToPasswordStep()
    fireEvent.click(screen.getByRole('button', { name: LA.submit }))
    await screen.findByText(PASSWORD_REQUIRED)
    fireEvent.change(screen.getByLabelText(C.passwordField), { target: { value: 'x' } })
    expect(screen.queryByText(PASSWORD_REQUIRED)).toBeNull()
  })
})

describe('LoginPage — step 3 (admin password)', () => {
  it('calls signIn("admin-2fa") with email, challengeToken, and password', async () => {
    signInMock.mockResolvedValue({ error: null, code: null })
    await advanceToPasswordStep('admin@test.com', 'tok123')
    fireEvent.change(screen.getByLabelText(C.passwordField), { target: { value: 'AdminPass123!' } })
    fireEvent.submit(screen.getByRole('button', { name: LA.submit }))
    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(ADMIN_2FA_PROVIDER_ID, {
        email: 'admin@test.com',
        challengeToken: 'tok123',
        password: 'AdminPass123!',
        redirect: false,
      })
    )
  })

  it('redirects to "/" on success', async () => {
    signInMock.mockResolvedValue({ error: null, code: null })
    await advanceToPasswordStep()
    fireEvent.change(screen.getByLabelText(C.passwordField), { target: { value: 'pass' } })
    fireEvent.submit(screen.getByRole('button', { name: LA.submit }))
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'))
  })

  it('password_reset_required → AUTH_ERRORS.passwordResetRequired', async () => {
    signInMock.mockResolvedValue({ error: 'AccessDenied', code: AUTH_ERROR_PASSWORD_RESET_REQUIRED })
    await advanceToPasswordStep()
    fireEvent.change(screen.getByLabelText(C.passwordField), { target: { value: 'pass' } })
    fireEvent.submit(screen.getByRole('button', { name: LA.submit }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.passwordResetRequired)
    )
  })

  it('account_blocked → AUTH_ERRORS.accountBlocked', async () => {
    signInMock.mockResolvedValue({ error: 'AccessDenied', code: AUTH_ERROR_ACCOUNT_BLOCKED })
    await advanceToPasswordStep()
    fireEvent.change(screen.getByLabelText(C.passwordField), { target: { value: 'pass' } })
    fireEvent.submit(screen.getByRole('button', { name: LA.submit }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.accountBlocked)
    )
  })

  it('wrong password → AUTH_ERRORS.wrongCredentials', async () => {
    signInMock.mockResolvedValue({ error: 'CredentialsSignin', code: null })
    await advanceToPasswordStep()
    fireEvent.change(screen.getByLabelText(C.passwordField), { target: { value: 'wrong' } })
    fireEvent.submit(screen.getByRole('button', { name: LA.submit }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.wrongCredentials)
    )
  })
})

// ── Step 2 → set-password step (admin first login) ─────────────────────────

describe('LoginPage — admin first login: verify returns { next:"set-password" }', () => {
  beforeEach(() => stubFetchForAdminNoPassword())

  it('shows set-password step and hides OTP boxes', async () => {
    await submitEmail('admin@test.com')
    fillOtpCode(TEST_CODE)
    await waitFor(() => screen.getByLabelText(ASP.passwordField))
    expect(screen.queryByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`)).toBeNull()
  })

  it('also shows a confirm-password field', async () => {
    await submitEmail('admin@test.com')
    fillOtpCode(TEST_CODE)
    await waitFor(() => screen.getByLabelText(ASP.confirmField))
  })

  it('does NOT call signIn when advancing to set-password step', async () => {
    await submitEmail('admin@test.com')
    fillOtpCode(TEST_CODE)
    await waitFor(() => screen.getByLabelText(ASP.passwordField))
    expect(signInMock).not.toHaveBeenCalled()
  })
})

// ── Step set-password: submit (admin first login) ───────────────────────────

async function advanceToSetPasswordStep(email = 'admin@test.com') {
  stubFetchForAdminNoPassword()
  await submitEmail(email)
  fillOtpCode(TEST_CODE)
  await waitFor(() => screen.getByLabelText(ASP.passwordField))
}

// Chrome / password managers need a username field next to a password field
// to know which account the password belongs to.
function usernameFieldIn(form: HTMLFormElement | null) {
  return form?.querySelector<HTMLInputElement>('input[autocomplete="username"]') ?? null
}

describe('LoginPage — password forms carry a hidden username field', () => {
  it('admin password step: hidden, read-only username field with the email', async () => {
    await advanceToPasswordStep('admin@test.com')
    const field = usernameFieldIn(screen.getByLabelText(C.passwordField).closest('form'))
    expect(field).not.toBeNull()
    expect(field).toHaveValue('admin@test.com')
    expect(field).toHaveAttribute('hidden')
    expect(field).toHaveAttribute('readonly')
  })

  it('set-password step: hidden, read-only username field with the email', async () => {
    await advanceToSetPasswordStep('admin@test.com')
    const field = usernameFieldIn(screen.getByLabelText(ASP.passwordField).closest('form'))
    expect(field).not.toBeNull()
    expect(field).toHaveValue('admin@test.com')
    expect(field).toHaveAttribute('hidden')
  })
})

describe('LoginPage — set-password step (admin first login)', () => {
  it('shows mismatch error when passwords do not match', async () => {
    await advanceToSetPasswordStep()
    fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.change(screen.getByLabelText(ASP.confirmField), { target: { value: 'bbbbbbbbbbbbbbbb' } })
    fireEvent.submit(screen.getByRole('button', { name: ASP.submit }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(ASP.mismatch)
    )
    expect(signInMock).not.toHaveBeenCalled()
  })

  it('calls set-initial-password then signIn("admin-2fa") with the returned challengeToken', async () => {
    signInMock.mockResolvedValue({ error: null, code: null })
    await advanceToSetPasswordStep()
    fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.change(screen.getByLabelText(ASP.confirmField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.submit(screen.getByRole('button', { name: ASP.submit }))
    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(ADMIN_2FA_PROVIDER_ID, {
        email: 'admin@test.com',
        challengeToken: 'newtoken456',
        password: 'aaaaaaaaaaaaaaaa',
        redirect: false,
      })
    )
  })

  it('redirects to "/" on success', async () => {
    signInMock.mockResolvedValue({ error: null, code: null })
    await advanceToSetPasswordStep()
    fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.change(screen.getByLabelText(ASP.confirmField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.submit(screen.getByRole('button', { name: ASP.submit }))
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'))
  })

  it('account_blocked → AUTH_ERRORS.accountBlocked', async () => {
    signInMock.mockResolvedValue({ error: 'AccessDenied', code: AUTH_ERROR_ACCOUNT_BLOCKED })
    await advanceToSetPasswordStep()
    fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.change(screen.getByLabelText(ASP.confirmField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.submit(screen.getByRole('button', { name: ASP.submit }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.accountBlocked)
    )
  })

  it('signIn error → AUTH_ERRORS.wrongCredentials', async () => {
    signInMock.mockResolvedValue({ error: 'CredentialsSignin', code: null })
    await advanceToSetPasswordStep()
    fireEvent.change(screen.getByLabelText(ASP.passwordField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.change(screen.getByLabelText(ASP.confirmField), { target: { value: 'aaaaaaaaaaaaaaaa' } })
    fireEvent.submit(screen.getByRole('button', { name: ASP.submit }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.wrongCredentials)
    )
  })
})

// ── Error handling (step 2, USER path) ─────────────────────────────────────

describe('LoginPage — errors (step 2)', () => {
  beforeEach(stubFetchForUser)

  it('CredentialsSignin error → AUTH_ERRORS.invalidCode', async () => {
    signInMock.mockResolvedValue({ error: 'CredentialsSignin', code: null })
    await submitEmail()
    fillOtpCode(TEST_CODE)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.invalidCode)
    )
  })

  it('account_blocked code → AUTH_ERRORS.accountBlocked', async () => {
    signInMock.mockResolvedValue({ error: 'AccessDenied', code: AUTH_ERROR_ACCOUNT_BLOCKED })
    await submitEmail()
    fillOtpCode(TEST_CODE)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.accountBlocked)
    )
  })
})

// ── Wrong code: clear boxes + resend ───────────────────────────────────────

const RESEND_BTN = LC.resendCode

function firstDigit() {
  return screen.getByLabelText(`Цифра 1 из ${LOGIN_CODE_LENGTH}`)
}

function fetchCallsTo(path: string) {
  return (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([url]) => String(url).includes(path))
}

type StubResponse = {
  ok: boolean
  body: Record<string, unknown>
  status?: number
  headers?: Record<string, string>
}

// Registered user whose code is rejected by verify-login-code.
// `resend` controls what the second request-login-code call returns.
function stubFetchWrongCodeForUser(resend: StubResponse = { ok: true, body: { csrfToken: 'csrf-2' } }) {
  let requestCount = 0
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('check-email')) {
      return Promise.resolve({ ok: true, json: async () => ({ registered: true }) })
    }
    if (String(url).includes('verify-login-code')) {
      return Promise.resolve({ ok: false, json: async () => ({ error: 'invalid_code' }) })
    }
    requestCount += 1
    if (requestCount === 1) {
      return Promise.resolve({ ok: true, json: async () => ({ csrfToken: 'csrf-1' }) })
    }
    return Promise.resolve({
      ok: resend.ok,
      status: resend.status,
      headers: new Headers(resend.headers),
      json: async () => resend.body,
    })
  }))
}

describe('LoginPage — wrong code (registered user)', () => {
  it('clears the code boxes when signIn rejects the code', async () => {
    stubFetchForUser()
    signInMock.mockResolvedValue({ error: 'CredentialsSignin', code: null })
    await submitEmail()
    fillOtpCode(TEST_CODE)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.invalidCode))
    expect(firstDigit()).toHaveValue('')
  })

  it('shows the resend button only after a wrong code, and clears the boxes', async () => {
    stubFetchWrongCodeForUser()
    await submitEmail()
    expect(screen.queryByRole('button', { name: RESEND_BTN })).toBeNull()
    fillOtpCode(TEST_CODE)
    expect(await screen.findByRole('button', { name: RESEND_BTN })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.invalidCode)
    expect(firstDigit()).toHaveValue('')
  })

  it('resend requests a new login code for the same email and clears the error', async () => {
    stubFetchWrongCodeForUser()
    await submitEmail('user@test.com')
    fillOtpCode(TEST_CODE)
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(fetchCallsTo('request-login-code')).toHaveLength(2))
    expect(JSON.parse(fetchCallsTo('request-login-code')[1][1].body as string)).toEqual({ email: 'user@test.com' })
    await waitFor(() => expect(screen.queryByText(AUTH_ERRORS.invalidCode)).toBeNull())
    expect(screen.queryByRole('button', { name: RESEND_BTN })).toBeNull()
    expect(firstDigit()).toHaveValue('')
  })

  it('uses the new csrf token from the resend for the next verify', async () => {
    stubFetchWrongCodeForUser()
    await submitEmail()
    fillOtpCode(TEST_CODE)
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(screen.queryByRole('button', { name: RESEND_BTN })).toBeNull())
    fillOtpCode(TEST_CODE)
    await waitFor(() => expect(fetchCallsTo('verify-login-code')).toHaveLength(2))
    const headers = fetchCallsTo('verify-login-code')[1][1].headers as Record<string, string>
    expect(headers['x-csrf-token']).toBe('csrf-2')
  })

  it('shows the "code too frequent" message with the server wait time when the resend is rate limited', async () => {
    stubFetchWrongCodeForUser({
      ok: false,
      status: 429,
      headers: { 'Retry-After': '150' },
      body: { error: 'code_rate_limited', retryAfterSeconds: 150 },
    })
    await submitEmail()
    fillOtpCode(TEST_CODE)
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(codeTooFrequentMessage(150)))
  })

  it('confirms a successful resend with a status message', async () => {
    stubFetchWrongCodeForUser()
    await submitEmail()
    fillOtpCode(TEST_CODE)
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(LC.codeResent))
  })

  it('hides the resend confirmation once the next code is checked', async () => {
    stubFetchWrongCodeForUser()
    await submitEmail()
    fillOtpCode(TEST_CODE)
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(LC.codeResent))
    fillOtpCode(TEST_CODE)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(AUTH_ERRORS.invalidCode))
    expect(screen.queryByText(LC.codeResent)).toBeNull()
  })
})

describe('LoginPage — wrong code (new user)', () => {
  it('resend re-registers with the same email and name', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('check-email')) {
        return Promise.resolve({ ok: true, json: async () => ({ registered: false }) })
      }
      if (String(url).includes('verify-registration-code')) {
        return Promise.resolve({ ok: false, json: async () => ({ error: 'invalid_code' }) })
      }
      return Promise.resolve({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
    }))
    await goToNameStep('new@test.com')
    fireEvent.change(screen.getByLabelText(NAME_FIELD), { target: { value: 'Мария' } })
    fireEvent.click(screen.getByRole('button', { name: REQUEST_CODE_BTN }))
    await waitFor(() => firstDigit())
    fillOtpCode(TEST_CODE)
    fireEvent.click(await screen.findByRole('button', { name: RESEND_BTN }))
    await waitFor(() => expect(fetchCallsTo('/api/auth/register')).toHaveLength(2))
    expect(JSON.parse(fetchCallsTo('/api/auth/register')[1][1].body as string)).toEqual({ email: 'new@test.com', name: 'Мария' })
    expect(fetchCallsTo('request-login-code')).toHaveLength(0)
  })
})

// ── Rate limits (429): show the wait time the server sent ──────────────────

const TOO_MANY = 429

function rateLimited(seconds: number, body: Record<string, unknown> = { error: 'Too many requests' }) {
  return Promise.resolve({
    ok: false,
    status: TOO_MANY,
    headers: new Headers({ 'Retry-After': String(seconds) }),
    json: async () => body,
  })
}

describe('LoginPage — too many attempts (429)', () => {
  it('code step: shows "too many attempts" with the server wait time, not "wrong code"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('check-email')) {
        return Promise.resolve({ ok: true, json: async () => ({ registered: true }) })
      }
      if (String(url).includes('verify-login-code')) return rateLimited(120)
      return Promise.resolve({ ok: true, json: async () => ({ csrfToken: 'csrf' }) })
    }))
    await submitEmail()
    fillOtpCode(TEST_CODE)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(tooManyAttemptsMessage(120)))
    expect(screen.queryByText(AUTH_ERRORS.invalidCode)).toBeNull()
  })

  it('email step: request-login-code rate limit shows the wait time under the email field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('check-email')) {
        return Promise.resolve({ ok: true, json: async () => ({ registered: true }) })
      }
      return rateLimited(180, { error: 'code_rate_limited', retryAfterSeconds: 180 })
    }))
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: 'user@test.com' } })
    fireEvent.submit(screen.getByRole('button', { name: LC.requestCode }))
    expect(await screen.findByText(tooManyAttemptsMessage(180))).toBeInTheDocument()
  })

  it('email step: check-email rate limit shows the wait time instead of a generic error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => rateLimited(60)))
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(C.emailField), { target: { value: 'user@test.com' } })
    fireEvent.submit(screen.getByRole('button', { name: LC.requestCode }))
    expect(await screen.findByText(tooManyAttemptsMessage(60))).toBeInTheDocument()
    expect(screen.queryByText(AUTH_ERRORS.generic)).toBeNull()
  })

  it('name step: register rate limit sends the user back to email with the wait time', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('check-email')) {
        return Promise.resolve({ ok: true, json: async () => ({ registered: false }) })
      }
      return rateLimited(240, { error: 'code_rate_limited', retryAfterSeconds: 240 })
    }))
    await goToNameStep()
    fireEvent.change(screen.getByLabelText(NAME_FIELD), { target: { value: 'Мария' } })
    fireEvent.click(screen.getByRole('button', { name: REQUEST_CODE_BTN }))
    expect(await screen.findByText(tooManyAttemptsMessage(240))).toBeInTheDocument()
  })
})
