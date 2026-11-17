/**
 * Renders page 1 of each PDF fragment to a PNG using mupdf (WASM).
 * Run once from project root: node scripts/gen-pdf-previews.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import * as mupdf from 'mupdf'

const files = [
  { pdf: 'public/book/book-fragment-1.pdf', png: 'public/book/book-fragment-1.png' },
  { pdf: 'public/book/book-fragment-2.pdf', png: 'public/book/book-fragment-2.png' },
  { pdf: 'public/book/book-fragment-3.pdf', png: 'public/book/book-fragment-3.png' },
]

const DPI_SCALE = 2 // 150dpi effective (PDF default is 72dpi)

for (const { pdf, png } of files) {
  const data = readFileSync(resolve(pdf))
  const doc = mupdf.Document.openDocument(data, 'application/pdf')
  const page = doc.loadPage(0) // 0-indexed

  const pixmap = page.toPixmap(
    mupdf.Matrix.scale(DPI_SCALE, DPI_SCALE),
    mupdf.ColorSpace.DeviceRGB,
    false // no alpha
  )

  const pngBytes = pixmap.asPNG()
  writeFileSync(resolve(png), pngBytes)

  pixmap.destroy()
  page.destroy()
  doc.destroy()

  console.log(`✓ ${png}`)
}

console.log('Done.')
