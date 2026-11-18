import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhotoWithCredit } from '@/components/PhotoWithCredit/PhotoWithCredit'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const credit = {
  author: 'Kristy2906',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Вид_на_Большое_колесо_обозрения_и_Круглый_пруд,_Измайловский_ПКиО.jpg',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
}

const renderPhoto = () => render(<PhotoWithCredit src="/izmailovo.jpg" alt="Измайловский парк" credit={credit} />)

describe('PhotoWithCredit', () => {
  it('renders the photo', () => {
    renderPhoto()
    expect(screen.getByRole('img', { name: 'Измайловский парк' })).toHaveAttribute('src', '/izmailovo.jpg')
  })

  it('author name links to the file page in a new tab', () => {
    renderPhoto()
    const link = screen.getByRole('link', { name: 'Kristy2906' })
    expect(link).toHaveAttribute('href', credit.sourceUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('license links to the license text in a new tab', () => {
    renderPhoto()
    const link = screen.getByRole('link', { name: 'CC BY-SA 4.0' })
    expect(link).toHaveAttribute('href', credit.licenseUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('caption reads «author, license, изменено» — the photo is cropped to 16:9 (CC BY 4.0 §3(a)(1)(B))', () => {
    renderPhoto()
    expect(screen.getByTestId('photo-caption')).toHaveTextContent(/^Kristy2906, CC BY-SA 4\.0, изменено$/)
  })

  it('credit is collapsed until the info icon is clicked, and a second click collapses it', () => {
    renderPhoto()
    const icon = screen.getByTestId('photo-info-icon')
    const disclosure = icon.closest('details')
    expect(disclosure).not.toBeNull()
    expect(disclosure).not.toHaveAttribute('open')

    fireEvent.click(icon)
    expect(disclosure).toHaveAttribute('open')

    fireEvent.click(icon)
    expect(disclosure).not.toHaveAttribute('open')
  })

  it('info icon has an accessible name', () => {
    renderPhoto()
    expect(screen.getByTestId('photo-info-icon')).toHaveAccessibleName('Автор и лицензия фото')
  })
})
