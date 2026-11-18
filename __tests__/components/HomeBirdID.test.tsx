import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BirdIDCTABand } from '@/components/BirdIDCTABand/BirdIDCTABand'
import { CertificateCTABand } from '@/components/CertificateCTABand/CertificateCTABand'

describe('BirdIDCTABand', () => {
  it('renders the BirdID course CTABand', () => {
    render(<BirdIDCTABand />)
    expect(screen.getByRole('heading', { name: /BirdID — курс идентификации птиц/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Узнать о курсе/i })).toHaveAttribute('href', '/birdid')
  })
})

describe('CertificateCTABand', () => {
  it('renders the certificate CTABand', () => {
    render(<CertificateCTABand />)
    expect(screen.getByRole('heading', { name: /Сертификат/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Подробнее/i })).toHaveAttribute('href', '/certificates')
  })
})
