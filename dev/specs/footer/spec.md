# Footer — Spec

Figma: `o3z6B8QEOwTHCosUVizuyH`, node `1883:6481` (page «Вход/профиль/покупка»)  
Master component: `1697:594` (UI KIT page) — `Breakpoint=Desktop` / `Breakpoint=Mobile`

---

## What to build

Static `<footer>` component, full width, with consistent horizontal gutters (`var(--page-gutter)`).  
Two layout variants controlled by a single CSS breakpoint (`min-width: 1248px`).

---

## Design measurements

### Desktop (≥ 1248px) — 1248 × 383px

```
padding-top:    96px
padding-bottom: 64px
padding-inline: var(--page-gutter)   ← 96px at desktop
layout:         VERTICAL, gap: 16px
```

**Row 1 — main content** (HORIZONTAL, gap: 64px between all items):

| Slot | Content | Size |
|------|---------|------|
| Logo block | "Birdwatching Moscow" (Montserrat 600, 24px) + tagline (Manrope 500, 18px, `--color-muted-foreground`) | 355 × 84 |
| Bird photo | `<Image>` with kingfisher | 355 × 187 |
| «события» column | label + 3 links | 95 × 112 |
| «прочее» column | label + 5 links | 106 × 176 |
| «Контакты» column | label + 3 links | 82 × 112 |

**Row 2 — bottom bar** (HORIZONTAL, gap: 16px):
- `© 2026` (Manrope 500, 16px, `--color-muted-foreground`)
- `Оферта` (Manrope 500, 16px, `--color-muted-foreground`)

---

### Mobile (< 1248px) — 360 × 718px

```
padding-top:    48px
padding-bottom: 48px
padding-inline: var(--page-gutter)   ← 16px at mobile
layout:         VERTICAL, gap: 24px
```

**Main group** (VERTICAL, gap: 16px):

1. Logo block (full width, 360 × 84) — same text as desktop
2. Bird photo (full width, 360 × 190)
3. Two-column nav (HORIZONTAL, no gap, each column 50%):
   - Left (180px): «события» label + Прогулки, Экспедиции, Частные
   - Right (180px): «прочее» label + О проекте, FAQ, Книга, Сертификаты
   *(«BirdID» is desktop-only — not present in mobile variant)*
4. «Контакты» section (full width, VERTICAL, gap: 12px):
   label + Почта, Вконтакте, Телеграм
   *(desktop shows «VK» — mobile shows «Вконтакте»)*

**Bottom bar**: `© 2026` + `Оферта` (same as desktop)

---

## Column content

### «события»
| Label | Href |
|-------|------|
| Прогулки | `/walks` |
| Экспедиции | `/expeditions` |
| Частные | `/private-events` |

### «прочее»
| Label | Href |
|-------|------|
| О проекте | `/about` |
| FAQ | `/faq` (placeholder — page doesn't exist yet) |
| Книга | `/book` |
| Сертификаты | `/certificates` (placeholder) |
| BirdID *(desktop only)* | `/birdid` (placeholder) |

### «Контакты»
| Label | Desktop label | Href |
|-------|--------------|------|
| Почта | Почта | `mailto:` (TBD — leave `href="#"` until real address confirmed) |
| VK / Вконтакте | VK | `https://vk.com/` (TBD) |
| Телеграм | Телеграм | `https://t.me/` (TBD) |

### Bottom bar
| Label | Href |
|-------|------|
| © 2026 | — (plain text, no link) |
| Оферта | `/oferta` (placeholder) |

---

## Typography in columns

- **Column label** (события / прочее / Контакты): Manrope 500, 14px, `--color-muted-foreground`
  - Gap after label before first link: 12px (= `itemSpacing` 12 − label height 16 + next item = spacing is 12px via gap)
- **Column links**: Manrope 500, 16px, `--color-foreground`
- Inter-link gap within columns: 12px

---

## Bird photo

The kingfisher image is embedded in Figma as a raster fill (imageHash `58aea5dc86553f76c86a9d99b4b4ef72f2295434`).  
**Manual step required**: export it from Figma (select the `HeroMedia` frame in UI KIT → Export PNG 2×) and save to `public/images/footer-bird.png`.  
The MCP export timed out; this must be done by hand before the image can be used in code.

Use `next/image` with `sizes` appropriate for its container:
```tsx
<Image
  src="/images/footer-bird.png"
  alt="Зимородок"
  width={355}
  height={187}
/>
```

---

## Implementation notes

- **Server Component** — no interactivity, no `'use client'`
- Place in `components/Footer.tsx` + `components/Footer.module.css`
- Footer already referenced in `app/layout.tsx` as `<Footer />`
- Logo reuses the existing `<Logo />` component (same as Header); no link needed on the logo in footer (it's decorative here — per Figma, no link wrapping)
- All nav links use `next/link`; contact links use plain `<a>` (external / mailto)
- Column label gap: Figma uses `itemSpacing: 12` but the label is 16px tall and next item starts at y=28, so the actual visual gap between label bottom and first link top = 28 − 16 = 12px. CSS: use `gap: 12px` on the column flex container — the label and links all sit in the same flex column.
- `© 2026` should be dynamic: `© {new Date().getFullYear()}` so it doesn't go stale
- "VK" vs "Вконтакте": use "Вконтакте" on mobile, "VK" on desktop — handle via CSS `.desktopOnly` / `.mobileOnly`, or just use "ВКонтакте" everywhere (simpler, ask before implementing)

---

## File structure

```
components/
  Footer.tsx
  Footer.module.css
__tests__/components/
  Footer.test.tsx
public/images/
  footer-bird.png   ← manual export from Figma
```

---

## Success criteria

- [ ] `pnpm test:run` passes
- [ ] `pnpm typecheck` passes
- [ ] Desktop (≥1248px): 5-column layout (logo, photo, 3 nav columns) with correct gaps and padding
- [ ] Mobile (<1248px): stacked layout (logo → photo → 2-col nav → contacts) with correct padding
- [ ] All nav links navigate to their correct hrefs
- [ ] Bird photo renders via `next/image`
- [ ] `© {year}` is dynamically computed
- [ ] No `'use client'` — Footer is a Server Component
- [ ] Footer is visible on all pages (rendered in root layout)

---

## Edge cases & error cases

- Missing bird image (`public/images/footer-bird.png` not exported yet): add `next/image` `placeholder="empty"` to avoid broken-image states during development
- "BirdID" and "Сертификаты" and "FAQ" hrefs don't exist yet — links should still render; 404 is acceptable until those pages are built
- Contact hrefs are TBD — use `href="#"` until confirmed; these are `<a>` not `<Link>` since they're external
- Year: `new Date().getFullYear()` evaluates at render time on the server — correct for SSR
