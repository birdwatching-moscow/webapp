# Hero — Spec

Figma: `o3z6B8QEOwTHCosUVizuyH`
- Desktop node: `1697:1877` (page «Сайт»), 1248 × 450 px
- Mobile node: `I1697:1915;1697:1877` (inside full-page «Экраны/Главная/»), 328 × 602 px

---

## What to build

Static `<section>` Server Component. Full-width, background `--color-background`. Two layouts separated by the standard breakpoint (`min-width: 1248px`).

---

## Design measurements

### Desktop (≥ 1248 px) — 1248 × 450 px

```
padding-top:    96px
padding-bottom: 0
padding-inline: var(--page-gutter)   ← 96px at desktop
layout:         HORIZONTAL, gap: 48px
background:     var(--color-background)
```

| Slot | Size | Notes |
|------|------|-------|
| Left column | 600 × 354 | VERTICAL, gap: 32px (between text block and button) |
| Right column | 600 × 317 | HeroMedia placeholder |

**Left column → Text block** (600 × 258, VERTICAL, gap: 12px):

| Element | Font | Size | Line-height | Weight |
|---------|------|------|-------------|--------|
| Heading | Montserrat | 56px | 58px | 600 |
| Subheading | Manrope | 20px | 24px | 600 |

Heading text: `«Помогаем природе через образование людей»`
Subheading text: `«Знакомим людей с птицами. Организуем бердвотчерские прогулки в Москве и поездки по миру. Повышаем квалификацию через BirdID»`

**Left column → Button** (406 × 64):

```
label:          Выбрать прогулку
href:           /walks
padding:        12px top/bottom, 48px left/right
font:           Manrope 500, 18px
background:     var(--color-primary)   ← #3f4fa6
color:          var(--color-primary-foreground)   ← #ffffff
border-radius:  12px   ← --radius-lg
```

**Right column — HeroMedia** (600 × 317):

Same approach as the footer bird photo: `background: var(--color-border)` placeholder, no image yet. When an image is provided, render it with `next/image` (`width={600}` `height={317}`, `object-fit: cover`).

---

### Mobile (< 1248 px) — 360 × 602 px (content 328 px wide)

```
padding-top:    64px
padding-bottom: 0
padding-inline: var(--page-gutter)   ← 16px at mobile
layout:         VERTICAL, gap: 16px between items
```

Order of items (top → bottom):

1. **Heading** — Montserrat 600, 40px / 44px lh
2. **HeroMedia** — 328 × 174 px placeholder
3. **Subheading** — Manrope 600, 20px / 24px lh (same text as desktop)
4. **Button** — full-width (328px), same label and href

> **Heading text on mobile is shorter:** `«Помогаем природе через образование»` (omits «людей»).
> This is intentional in Figma — the full text would create a 4th line at 40px and break the 602px total height.
> **Implementation decision:** use `aria-label` on the section or a `<span className="sr-only"> людей</span>` appended to the mobile heading, OR simply use the shorter text everywhere on mobile and accept the Figma difference. Recommend going with the shorter text on mobile (matches Figma exactly).

---

## Component structure

```
components/
  Hero/
    Hero.tsx
    Hero.module.css
```

- No `'use client'` — Server Component
- Button uses `next/link`
- Image placeholder: `<div className={styles.heroMedia} />` until a real photo is provided; when photo exists, replace with `<Image … />`

---

## Success criteria

- [ ] `pnpm test:run` passes
- [ ] `pnpm typecheck` passes
- [ ] Desktop (≥ 1248px): two-column layout — text+button on left, image placeholder on right, correct padding and gap
- [ ] Mobile (< 1248px): single-column layout — heading → image → subheading → button, in that order
- [ ] Heading uses `--text-h1` / Montserrat sizing at correct breakpoint values (56/58 desktop, 40/44 mobile)
- [ ] Subheading Manrope 600, 20px / 24px on both breakpoints
- [ ] Button navigates to `/walks`
- [ ] Image placeholder shows `background: var(--color-border)` with reserved space at correct dimensions
- [ ] No `'use client'`

---

## Edge cases & error cases

- Photo not yet provided → placeholder `div` with fixed height must reserve space (no layout shift)
- When photo is added later, only `Hero.tsx` needs to change — dimensions and CSS class stay the same
- `/walks` page may not exist yet — link renders correctly, 404 is acceptable until page is built
- Mobile heading shorter text: document the difference in a comment in `Hero.tsx`

---

## Typography tokens (from globals.css)

The project already defines these classes in `globals.css`:

| Class | Desktop | Mobile |
|-------|---------|--------|
| `.text-display` | 56px / 58px, Montserrat 600 | 40px / 44px |
| `.text-h1` | 40px / 44px | 28px / 32px |
| `.text-body-l` | 20px / 24px, Manrope 600 | 18px / 24px |
| `.text-body` | 18px / 24px, Manrope 500 | 16px / 20px |

The heading (56px desktop / 40px mobile) matches `.text-display`. Use it.
The subheading (20px / 24px, weight 600) matches `.text-body-l`. Use it.
