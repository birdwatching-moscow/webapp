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

  it('renders each description paragraph separately', () => {
    render(<PageHero title={props.title} description={['Первый абзац', 'Второй абзац']} cta={props.cta} />)
    expect(screen.getByText('Первый абзац').tagName).toBe('P')
    expect(screen.getByText('Второй абзац').tagName).toBe('P')
  })

  it('renders a custom action instead of the link', () => {
    render(
      <PageHero
        title={props.title}
        description={props.description}
        action={<button type="button">Оставить заявку</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Оставить заявку' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
