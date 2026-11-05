import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeBirdID } from '@/components/HomeBirdID/HomeBirdID'

describe('HomeBirdID', () => {
  it('renders the section with testid', () => {
    render(<HomeBirdID />)
    expect(screen.getByTestId('home-birdid')).toBeInTheDocument()
  })

  it('renders the BirdID course CTABand', () => {
    render(<HomeBirdID />)
    expect(screen.getByRole('heading', { name: /BirdID — курс идентификации птиц/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Узнать о курсе/i })).toHaveAttribute('href', '/birdid')
  })

  it('renders the certificate CTABand', () => {
    render(<HomeBirdID />)
    expect(screen.getByRole('heading', { name: /Сертификат/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Подробнее/i })).toHaveAttribute('href', '/certificates')
  })

  it('renders two CTABand elements', () => {
    render(<HomeBirdID />)
    expect(screen.getAllByTestId('cta-band')).toHaveLength(2)
  })
})
