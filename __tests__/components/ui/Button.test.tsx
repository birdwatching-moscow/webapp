import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/buttons/Button'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Button — element type', () => {
  it('renders a <button> by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders a <link> element when as="a"', () => {
    render(<Button as="a" href="/path">Link</Button>)
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('link has correct href', () => {
    render(<Button as="a" href="/path">Link</Button>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/path')
  })
})

describe('Button — disabled state', () => {
  it('disabled={true} sets native disabled on <button>', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('loading={true} sets native disabled on <button>', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('loading={true} sets aria-busy="true" on <button>', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('loading={true} on link sets aria-disabled="true"', () => {
    render(<Button as="a" href="/path" loading>Link</Button>)
    expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true')
  })

  it('loading={true} on link sets aria-busy="true"', () => {
    render(<Button as="a" href="/path" loading>Link</Button>)
    expect(screen.getByRole('link')).toHaveAttribute('aria-busy', 'true')
  })
})

describe('Button — className', () => {
  it('className prop is appended to root element', () => {
    render(<Button className="my-custom">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('my-custom')
  })
})

describe('Button — variant and size classes', () => {
  it('default variant applies a CSS class containing "default"', () => {
    render(<Button variant="default">Click</Button>)
    expect(screen.getByRole('button').className).toMatch(/default/)
  })

  it('secondary variant applies a CSS class containing "secondary"', () => {
    render(<Button variant="secondary">Click</Button>)
    expect(screen.getByRole('button').className).toMatch(/secondary/)
  })

  it('ghost variant applies a CSS class containing "ghost"', () => {
    render(<Button variant="ghost">Click</Button>)
    expect(screen.getByRole('button').className).toMatch(/ghost/)
  })

  it('size="sm" applies a CSS class containing "sm"', () => {
    render(<Button size="sm">Click</Button>)
    expect(screen.getByRole('button').className).toMatch(/sm/)
  })
})

describe('Button — fullWidth', () => {
  it('fullWidth applies a CSS class containing "fullWidth"', () => {
    render(<Button fullWidth>Click</Button>)
    expect(screen.getByRole('button').className).toMatch(/fullWidth/)
  })

  it('fullWidth applies to link variant too', () => {
    render(<Button as="a" href="/path" fullWidth>Link</Button>)
    expect(screen.getByRole('link').className).toMatch(/fullWidth/)
  })

  it('does not apply fullWidth class by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button').className).not.toMatch(/fullWidth/)
  })
})
