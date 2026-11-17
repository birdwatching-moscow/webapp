/**
 * `sizes` presets for next/image `fill` images, so the browser downloads a
 * file close to the rendered width.
 *
 * Mirrors the layout tokens in app/globals.css — update both together:
 *   --page-gutter: 16px on mobile, 96px from the 1248px breakpoint
 *   card grids:    3 columns with 24px gaps on desktop, one column on mobile
 */
export const IMAGE_SIZES = {
  /** Full width inside the page gutters (section photos). */
  pageWidth: '(min-width: 1248px) calc(100vw - 192px), calc(100vw - 32px)',
  /** One card in a 3-column grid on desktop; never narrower than it renders. */
  cardThird: '(min-width: 1248px) calc((100vw - 240px) / 3), calc(100vw - 32px)',
} as const
