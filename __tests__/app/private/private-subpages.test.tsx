import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LecturesPage, { metadata as lecturesMetadata } from '@/app/(site)/private/lectures/page'
import ConsultationsPage, { metadata as consultationsMetadata } from '@/app/(site)/private/consultations/page'

// /private/parks is a real page now — see parks-page.test.tsx
describe('/private/* placeholder pages', () => {
  it.each([
    ['/private/lectures', LecturesPage, lecturesMetadata, 'Лекции | Birdwatching Moscow'],
    ['/private/consultations', ConsultationsPage, consultationsMetadata, 'Консультации | Birdwatching Moscow'],
  ])('%s renders a <main> and sets its title', (_path, Page, metadata, title) => {
    render(<Page />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(metadata.title).toBe(title)
  })
})
