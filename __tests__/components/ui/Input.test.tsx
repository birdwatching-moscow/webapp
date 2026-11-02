import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input/Input'

describe('Input — rendering', () => {
  it('renders an <input> element', () => {
    render(<Input value="" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('reflects value prop in the DOM', () => {
    render(<Input value="hello" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('hello')
  })

  it('calls onChange with the change event', () => {
    const onChange = vi.fn()
    render(<Input value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('renders a <label> when both label and id are provided', () => {
    render(<Input value="" onChange={() => {}} label="Name" id="name" />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('does not render a <label> when id is missing', () => {
    render(<Input value="" onChange={() => {}} label="Name" />)
    expect(screen.queryByText('Name')).toBeNull()
  })

  it('renders placeholder text', () => {
    render(<Input value="" onChange={() => {}} placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('className is forwarded to the wrapper element', () => {
    const { container } = render(<Input value="" onChange={() => {}} className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })
})

describe('Input — error state', () => {
  it('shows error message when error prop is non-empty', () => {
    render(<Input value="" onChange={() => {}} error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('error message has role="alert"', () => {
    render(<Input value="" onChange={() => {}} error="Required" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('sets aria-invalid="true" when error is non-empty', () => {
    render(<Input value="" onChange={() => {}} error="Bad" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not render error element when error is undefined', () => {
    render(<Input value="" onChange={() => {}} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('does not render error element when error is empty string', () => {
    render(<Input value="" onChange={() => {}} error="" />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('aria-invalid is absent or "false" when no error', () => {
    render(<Input value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    const invalid = input.getAttribute('aria-invalid')
    expect(invalid === null || invalid === 'false').toBe(true)
  })

  it('input has aria-describedby pointing to error element when error is present', () => {
    render(<Input value="" onChange={() => {}} error="Bad" id="field" />)
    const input = screen.getByRole('textbox')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const errorEl = document.getElementById(describedBy!)
    expect(errorEl).not.toBeNull()
    expect(errorEl?.textContent).toBe('Bad')
  })
})

describe('Input — disabled state', () => {
  it('disabled={true} sets native disabled on <input>', () => {
    render(<Input value="" onChange={() => {}} disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
