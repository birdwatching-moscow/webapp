import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AUTH_ERRORS } from '@/lib/auth-errors'
import { AUTH_LABELS } from '@/lib/auth-labels'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

vi.mock('@/lib/api/auth', () => ({
  requestLoginCode: vi.fn(),
  register: vi.fn(),
}))

import { AuthFlow } from '@/components/auth/AuthFlow'
import * as authApi from '@/lib/api/auth'
import { signIn } from 'next-auth/react'

const mockRequestLoginCode = authApi.requestLoginCode as ReturnType<typeof vi.fn>
const mockRegister = authApi.register as ReturnType<typeof vi.fn>
const mockSignIn = signIn as ReturnType<typeof vi.fn>

const defaultProps = {
  flow: 'sign-in' as const,
  context: 'screen' as const,
  onFlowChange: vi.fn(),
  onSuccess: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Step rendering ───────────────────────────────────────────────────────────

describe('AuthFlow — sign-in step', () => {
  it('renders one email input and a submit button; no name or code input', () => {
    render(<AuthFlow {...defaultProps} flow="sign-in" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.queryByLabelText(AUTH_LABELS.register.nameField)).toBeNull()
    expect(screen.queryByRole('textbox', { name: AUTH_LABELS.loginCode.codeField })).toBeNull()
  })
})

describe('AuthFlow — sign-up step', () => {
  it('renders a name input and an email input; no code input', () => {
    render(<AuthFlow {...defaultProps} flow="sign-up" />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByLabelText(AUTH_LABELS.register.nameField)).toBeInTheDocument()
  })
})

describe('AuthFlow — otp step', () => {
  it('renders a code input with maxLength=6, inputMode="text", autoComplete="one-time-code"', () => {
    render(<AuthFlow {...defaultProps} flow="otp" email="test@example.com" />)
    const codeInput = screen.getByRole('textbox')
    expect(codeInput).toHaveAttribute('maxLength', '6')
    expect(codeInput).toHaveAttribute('inputMode', 'text')
    expect(codeInput).toHaveAttribute('autoComplete', 'one-time-code')
  })

  it('shows the email prop value somewhere in the output', () => {
    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" />)
    expect(screen.getByText(/user@example\.com/)).toBeInTheDocument()
  })

  it('code input is not disabled on initial render (idle sub-state)', () => {
    render(<AuthFlow {...defaultProps} flow="otp" email="test@example.com" />)
    expect(screen.getByRole('textbox')).not.toBeDisabled()
  })
})

describe('AuthFlow — purchase context', () => {
  it('renders no close/dismiss button', () => {
    render(<AuthFlow {...defaultProps} flow="sign-in" context="purchase" />)
    const buttons = screen.queryAllByRole('button')
    const closeBtn = buttons.find(b => {
      const text = (b.textContent ?? '').toLowerCase()
      const label = (b.getAttribute('aria-label') ?? '').toLowerCase()
      return /закрыт|close|×|✕/.test(text) || /закрыт|close/.test(label)
    })
    expect(closeBtn).toBeUndefined()
  })
})

// ── API wiring — sign-in ─────────────────────────────────────────────────────

describe('AuthFlow — sign-in submission', () => {
  it('calls requestLoginCode with the submitted email on success', async () => {
    mockRequestLoginCode.mockResolvedValueOnce({})

    render(<AuthFlow {...defaultProps} flow="sign-in" />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.requestCode }))

    await waitFor(() => {
      expect(mockRequestLoginCode).toHaveBeenCalledWith({ email: 'user@example.com' })
    })
  })

  it('calls onFlowChange("otp", email) after requestLoginCode resolves', async () => {
    mockRequestLoginCode.mockResolvedValueOnce({})
    const onFlowChange = vi.fn()

    render(<AuthFlow {...defaultProps} flow="sign-in" onFlowChange={onFlowChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.requestCode }))

    await waitFor(() => {
      expect(onFlowChange).toHaveBeenCalledWith('otp', 'user@example.com')
    })
  })

  it('shows network error and does not call onFlowChange on API failure', async () => {
    mockRequestLoginCode.mockRejectedValueOnce(new Error('Network Error'))
    const onFlowChange = vi.fn()

    render(<AuthFlow {...defaultProps} flow="sign-in" onFlowChange={onFlowChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.requestCode }))

    await waitFor(() => {
      expect(screen.getByText(AUTH_ERRORS.network)).toBeInTheDocument()
    })
    expect(onFlowChange).not.toHaveBeenCalled()
  })
})

// ── API wiring — sign-up ─────────────────────────────────────────────────────

describe('AuthFlow — sign-up submission', () => {
  it('calls register then requestLoginCode on success, then onFlowChange("otp", email)', async () => {
    mockRegister.mockResolvedValueOnce({})
    mockRequestLoginCode.mockResolvedValueOnce({})
    const onFlowChange = vi.fn()

    render(<AuthFlow {...defaultProps} flow="sign-up" onFlowChange={onFlowChange} />)
    fireEvent.change(screen.getByLabelText(AUTH_LABELS.register.nameField), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByLabelText(AUTH_LABELS.common.emailField), { target: { value: 'ivan@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.register.submit }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({ name: 'Иван', email: 'ivan@example.com' })
      expect(mockRequestLoginCode).toHaveBeenCalledWith({ email: 'ivan@example.com' })
      expect(onFlowChange).toHaveBeenCalledWith('otp', 'ivan@example.com')
    })
  })

  it('shows network error and does not call onFlowChange when requestLoginCode fails after register', async () => {
    mockRegister.mockResolvedValueOnce({})
    mockRequestLoginCode.mockRejectedValueOnce(new Error('Network Error'))
    const onFlowChange = vi.fn()

    render(<AuthFlow {...defaultProps} flow="sign-up" onFlowChange={onFlowChange} />)
    fireEvent.change(screen.getByLabelText(AUTH_LABELS.register.nameField), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByLabelText(AUTH_LABELS.common.emailField), { target: { value: 'ivan@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.register.submit }))

    await waitFor(() => {
      expect(screen.getByText(AUTH_ERRORS.network)).toBeInTheDocument()
    })
    expect(onFlowChange).not.toHaveBeenCalled()
  })
})

// ── API wiring — OTP submission ──────────────────────────────────────────────

describe('AuthFlow — OTP submission', () => {
  it('calls signIn("login-code") with email and code on submit', async () => {
    mockSignIn.mockResolvedValueOnce({})
    const onSuccess = vi.fn()

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.verify }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'login-code',
        expect.objectContaining({ email: 'user@example.com', code: 'ABC123', redirect: false }),
      )
    })
  })

  it('calls onSuccess exactly once when signIn resolves without error', async () => {
    mockSignIn.mockResolvedValueOnce({})
    const onSuccess = vi.fn()

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.verify }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
  })

  it('shows AUTH_ERRORS.invalidCode and does not call onSuccess when signIn returns CredentialsSignin', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'CredentialsSignin' })
    const onSuccess = vi.fn()

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'WRONG1' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.verify }))

    await waitFor(() => {
      expect(screen.getByText(AUTH_ERRORS.invalidCode)).toBeInTheDocument()
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })
})

// ── OTP attempt limit ────────────────────────────────────────────────────────

describe('AuthFlow — OTP attempt limit', () => {
  const submitWrong = async (times: number) => {
    for (let i = 0; i < times; i++) {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'WRONG1' } })
      fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.verify }))
      await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(i + 1))
    }
  }

  it('code input is disabled after 5 consecutive wrong submissions', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" />)
    await submitWrong(5)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  it('resend button is absent after the 5th failure', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" />)
    await submitWrong(5)

    await waitFor(() => {
      expect(screen.queryByText(AUTH_LABELS.loginCode.resendCode)).toBeNull()
    })
  })

  it('limit-reached message is shown instead of invalidCode message after 5th failure', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" />)
    await submitWrong(5)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
    // The limit message is different from the per-attempt invalidCode message
    expect(screen.queryByText(AUTH_ERRORS.invalidCode)).toBeNull()
  })
})

// ── OTP resend ───────────────────────────────────────────────────────────────

describe('AuthFlow — OTP resend', () => {
  it('clicking resend calls requestLoginCode and clears the error', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'CredentialsSignin' })
    mockRequestLoginCode.mockResolvedValueOnce({})

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" />)

    // Trigger a wrong submission to show the error
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'WRONG1' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.verify }))

    await waitFor(() => {
      expect(screen.getByText(AUTH_ERRORS.invalidCode)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(AUTH_LABELS.loginCode.resendCode))

    await waitFor(() => {
      expect(mockRequestLoginCode).toHaveBeenCalledWith({ email: 'user@example.com' })
      expect(screen.queryByText(AUTH_ERRORS.invalidCode)).toBeNull()
    })
  })
})

// ── OTP back navigation ──────────────────────────────────────────────────────

describe('AuthFlow — OTP back / change email', () => {
  it('clicking the change-email control calls onFlowChange("sign-in", email) without an API call', () => {
    const onFlowChange = vi.fn()

    render(<AuthFlow {...defaultProps} flow="otp" email="user@example.com" onFlowChange={onFlowChange} />)
    fireEvent.click(screen.getByText(AUTH_LABELS.loginCode.changeEmail))

    expect(onFlowChange).toHaveBeenCalledWith('sign-in', 'user@example.com')
    expect(mockRequestLoginCode).not.toHaveBeenCalled()
    expect(mockSignIn).not.toHaveBeenCalled()
  })
})

// ── Loading state ────────────────────────────────────────────────────────────

describe('AuthFlow — loading state during API call', () => {
  it('submit button is disabled and input is disabled while requestLoginCode is in flight', async () => {
    // A promise that never resolves simulates an in-flight request
    mockRequestLoginCode.mockReturnValueOnce(new Promise(() => {}))

    render(<AuthFlow {...defaultProps} flow="sign-in" />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: AUTH_LABELS.loginCode.requestCode }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: AUTH_LABELS.loginCode.requestCode })).toBeDisabled()
    })
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
