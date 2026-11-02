import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropdown } from '@/components/ui/dropdown/Dropdown'

const OPTIONS = [
  { label: '1 билет', value: 1 },
  { label: '2 билета', value: 2 },
  { label: '3 билета', value: 3 },
]

describe('Dropdown — closed state', () => {
  it('renders trigger button with selected option label', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    expect(screen.getByText('1 билет')).toBeInTheDocument()
  })

  it('trigger has aria-haspopup="listbox"', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('trigger has aria-expanded="false" when closed', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('options list is not visible when closed', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('shows fallback "–" when value does not match any option', () => {
    render(<Dropdown value={99} onChange={() => {}} options={OPTIONS} />)
    expect(screen.getByText('–')).toBeInTheDocument()
  })

  it('shows fallback "–" when options is empty', () => {
    render(<Dropdown value={1} onChange={() => {}} options={[]} />)
    expect(screen.getByText('–')).toBeInTheDocument()
  })
})

describe('Dropdown — open state', () => {
  it('clicking trigger opens the list', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('trigger has aria-expanded="true" when open', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders all options in the list', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length)
  })

  it('selected option has aria-selected="true"', () => {
    render(<Dropdown value={2} onChange={() => {}} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    const opts = screen.getAllByRole('option')
    const selected = opts.find(o => o.getAttribute('aria-selected') === 'true')
    expect(selected?.textContent).toBe('2 билета')
  })

  it('non-selected options have aria-selected="false"', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    const opts = screen.getAllByRole('option')
    const unselected = opts.filter(o => o.getAttribute('aria-selected') === 'false')
    expect(unselected).toHaveLength(OPTIONS.length - 1)
  })

  it('clicking trigger again closes the list', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Dropdown — selecting an option', () => {
  it('clicking an option calls onChange with its value', () => {
    const onChange = vi.fn()
    render(<Dropdown value={1} onChange={onChange} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getAllByRole('option')[1])
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('clicking an option closes the list', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getAllByRole('option')[0])
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Dropdown — keyboard interaction', () => {
  it('pressing Escape while open closes the list', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Dropdown — outside click', () => {
  it('mousedown outside component closes the list', () => {
    render(
      <div>
        <Dropdown value={1} onChange={() => {}} options={OPTIONS} />
        <button data-testid="outside">outside</button>
      </div>
    )
    fireEvent.click(screen.getByRole('button', { name: /билет/ }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('Dropdown — disabled state', () => {
  it('disabled trigger has aria-disabled="true"', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} disabled />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('clicking disabled trigger does not open list', () => {
    render(<Dropdown value={1} onChange={() => {}} options={OPTIONS} disabled />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
