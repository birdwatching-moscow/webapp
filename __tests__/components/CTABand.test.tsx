import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CTABand } from '@/components/CTABand/CTABand'

const DEFAULT_PROPS = {
  title: 'BirdID — курс идентификации птиц',
  description: 'Углублённый курс с апреля по середину июля, по выходным и в поле.',
  buttonLabel: 'Узнать о курсе',
  href: '/birdid',
}

describe('CTABand', () => {
  it('renders with data-testid', () => {
    render(<CTABand {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('cta-band')).toBeInTheDocument()
  })

  it('renders the title as a heading', () => {
    render(<CTABand {...DEFAULT_PROPS} />)
    expect(screen.getByRole('heading', { name: DEFAULT_PROPS.title })).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<CTABand {...DEFAULT_PROPS} />)
    expect(screen.getByText(DEFAULT_PROPS.description)).toBeInTheDocument()
  })

  it('renders a link with the correct label and href', () => {
    render(<CTABand {...DEFAULT_PROPS} />)
    const link = screen.getByRole('link', { name: DEFAULT_PROPS.buttonLabel })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', DEFAULT_PROPS.href)
  })

  it('renders different content via props', () => {
    render(
      <CTABand
        title="Сертификат"
        description="Удобный подарок для друзей и коллег."
        buttonLabel="Подробнее"
        href="/certificates"
      />
    )
    expect(screen.getByRole('heading', { name: 'Сертификат' })).toBeInTheDocument()
    expect(screen.getByText('Удобный подарок для друзей и коллег.')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Подробнее' })
    expect(link).toHaveAttribute('href', '/certificates')
  })
})
