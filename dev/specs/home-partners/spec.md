# HomePartners — Spec

Figma: `MpZRXolbzistBaW20SYXsR`, node `1697:1895`  
Desktop instance: `1697:1895` (1248 × 620)  
Mobile instance: `I1697:1915;1697:1895` (328 × 480)

---

## What to build

Static `<section>` component displaying 8 partner logos in a responsive grid, with a "Посмотреть все" link to `/partners`.

---

## Design measurements

### Desktop (≥ 1248px) — 1248 × 620px

```
padding-top:    96px
padding-bottom: 0
padding-inline: var(--page-gutter)   ← 96px at desktop
layout:         VERTICAL, gap: 24px
```

| Slot | Details |
|------|---------|
| Heading h2 | "Друзья и партнёры проекта" (Montserrat, text-h1 class) |
| Logo grid | 4 columns × 2 rows, gap: 24px, each cell 306 × 172px |
| Button | Secondary/outlined, "Посмотреть все", width: 406px |

Each logo cell: logo image centered with `object-fit: contain`, fills 306 × 172 slot.

### Mobile (< 1248px) — 360 × 480px

```
padding-top:    64px
padding-bottom: 0
padding-inline: var(--page-gutter)   ← 16px at mobile
layout:         VERTICAL, gap: 8px between heading and grid; 24px between grid and button
```

| Slot | Details |
|------|---------|
| Heading h2 | Wraps to 2 lines |
| Logo grid | 2 columns × 4 rows, gap: 24px, cells fluid (1fr 1fr) |
| Button | Full width (`fullWidth` prop) |

---

## Partners data

Order matches Figma (left-to-right, top-to-bottom):

| # | File | Alt text | href |
|---|------|----------|------|
| 1 | `/images/partners/biofak.png` | Биологический факультет МГУ | `#` (TBD) |
| 2 | `/images/partners/leica.png` | Leica | `#` (TBD) |
| 3 | `/images/partners/pg.png` | Парк Горького | `#` (TBD) |
| 4 | `/images/partners/birdid.png` | Bird ID | `#` (TBD) |
| 5 | `/images/partners/macaulay.png` | Macaulay Library | `#` (TBD) |
| 6 | `/images/partners/monticola.png` | Monticola | `#` (TBD) |
| 7 | `/images/partners/elements.png` | Элементы | `#` (TBD) |
| 8 | `/images/partners/sopr.png` | Союз охраны птиц России | `#` (TBD) |

Each partner links to its own site in a new tab (`target="_blank" rel="noopener noreferrer"`). Use `href="#"` until real URLs are confirmed.

---

## Implementation notes

- **Server Component** — no `'use client'`
- Place in `components/HomePartners/HomePartners.tsx` + `components/HomePartners/HomePartners.module.css`
- Logo grid: use CSS Grid (`grid-template-columns: repeat(4, 1fr)` on desktop, `repeat(2, 1fr)` on mobile)
- Each logo: `next/image` with `fill` and `object-fit: contain` inside a positioned container
- Logo container aspect ratio: approximately 306:172 ≈ 16:9 — use `aspect-ratio: 306/172` on the cell
- Button: `<Button as="a" variant="secondary" size="lg">` from existing Button component; `fullWidth` on mobile, `max-width: 406px` on desktop
- Button links to `ROUTES.partners` (`/partners`)
- Add `partners: '/partners'` to `utils/routes.ts`
- Add `<HomePartners />` to `app/page.tsx` after `<HomeMedia />`
- Create `app/partners/page.tsx` stub (heading + metadata), following the same pattern as `app/media/page.tsx`

---

## File structure

```
components/
  HomePartners/
    HomePartners.tsx
    HomePartners.module.css
__tests__/components/
  HomePartners.test.tsx
__tests__/app/
  partners-page.test.tsx
app/partners/
  page.tsx
public/images/partners/   ← already present
  biofak.png, leica.png, pg.png, birdid.png,
  macaulay.png, monticola.png, elements.png, sopr.png
```

---

## Success criteria

- [ ] `pnpm test:run` passes
- [ ] `pnpm typecheck` passes
- [ ] Desktop (≥1248px): 4-column grid, `padding-top: 96px`, button `max-width: 406px`
- [ ] Mobile (<1248px): 2-column grid, `padding-top: 64px`, button full-width
- [ ] All 8 partner logos render via `next/image`
- [ ] Each logo links to `href="#"` in a new tab
- [ ] "Посмотреть все" links to `/partners`
- [ ] No `'use client'` — Server Component
- [ ] `HomePartners` is rendered on the home page after `HomeMedia`

---

## Edge cases & error cases

- Missing image file: add `placeholder="empty"` on each `<Image>` to avoid broken-image states
- Partner `href="#"` — links render but do nothing; acceptable placeholder until real URLs confirmed
- `/partners` page doesn't exist as full page yet — stub with h1 + metadata is enough for this spec
