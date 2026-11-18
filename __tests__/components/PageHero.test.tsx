import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHero } from '@/components/PageHero/PageHero'

const props = {
  title: 'Парки Москвы',
  description: 'Описание страницы',
  cta: { label: 'Посмотреть стоимость', href: '#price' },
}

describe('PageHero', () => {
  it('renders the title as the page h1', () => {
    render(<PageHero {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: props.title })).toHaveClass('text-display')
  })

  it('renders the description', () => {
    render(<PageHero {...props} />)
    expect(screen.getByText(props.description)).toBeInTheDocument()
  })

  it('renders the call-to-action link', () => {
    render(<PageHero {...props} />)
    expect(screen.getByRole('link', { name: props.cta.label })).toHaveAttribute('href', '#price')
  })
})
