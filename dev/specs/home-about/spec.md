# HomeAbout — Spec

Figma: `oe5y2BvWf7ErAL30h0ffT9`
- Desktop node: `1697:1878` (page «Сайт»), 1248 × 308 px
- Mobile node: `I1697:1915;1697:1878`, 328 × 360 px

---

## What to build

Static `<section>` Server Component. Full-width, background `--color-background`. Content is horizontally centered and constrained to 720 px max-width. Two layouts separated by the standard breakpoint (`min-width: 1248px`).

---

## Design measurements

### Desktop (≥ 1248 px) — 1248 × 308 px

```
padding-top:    96px
padding-bottom: 0
padding-inline: var(--page-gutter)   ← 96px at desktop
background:     var(--color-background)
layout:         content centred horizontally, max-width 720px
```

**Content block** (720 × 212, centred):

```
layout: VERTICAL, gap: 24px   ← between text block and button
```

**Text block** (720 × 124, VERTICAL, gap: 8px):

| Element | Tag | Class | Font | Size | lh | Weight | Color |
|---------|-----|-------|------|------|----|--------|-------|
| Heading | `<h2>` | `.text-h1` | Montserrat | 40px | 44px | 600 | `--color-foreground` |
| Body | `<p>` | `.text-body-l` | Manrope | 20px | 24px | 600 | `--color-muted-foreground` |

Heading text: `«О проекте»`

Body text: `«Помогать природе через образование людей. К нам приходят, чтобы узнать больше о птицах, научиться их различать, найти новое увлечение или просто провести время на природе в хорошей компании.»`

**Button** (406 × 64):

```
label:    Подробнее
href:     /team
variant:  secondary   ← outlined, background = --color-background, border = --color-primary
size:     lg          ← existing Button size, height 64px
```

---

### Mobile (< 1248 px) — 360 × 360 px (content 328 px)

```
padding-top:    64px
padding-bottom: 0
padding-inline: var(--page-gutter)   ← 16px at mobile
layout:         VERTICAL, gap: 24px (between text block and button)
```

**Text block** (328 × 208, VERTICAL, gap: 8px):

| Element | Class | Size | lh | Weight |
|---------|-------|------|----|--------|
| Heading `<h2>` | `.text-h1` | 28px | 32px | 600 |
| Body `<p>` | `.text-body-l` | 18px | 24px | **500** ← Figma shows 500 on mobile vs 600 on desktop |

> **Note:** Figma mobile body weight is 500, desktop is 600. `.text-body-l` in globals.css is 600 on both breakpoints. Use `.text-body-l` and verify visually; if the lighter weight is intentional, raise with designer before overriding the token.

**Button** (328 × 64 — full width on mobile):
- Same label, href, variant as desktop
- `align-self: stretch` on mobile so it fills the content width

---

## Typography tokens

| Class | Mobile | Desktop |
|-------|--------|---------|
| `.text-h1` | 28px / 32px, Montserrat 600 | 40px / 44px |
| `.text-body-l` | 18px / 24px, Manrope 600 | 20px / 24px |

---

## Component structure

```
components/
  HomeAbout/
    HomeAbout.tsx
    HomeAbout.module.css
```

- No `'use client'` — Server Component
- Button uses existing `<Button as="a" variant="secondary" size="lg" href="/team">`
- Semantic heading tag: `<h2>` (page already has an `<h1>` in Hero)

---

## Success criteria

- [ ] `pnpm test:run` passes
- [ ] `pnpm typecheck` passes
- [ ] Renders a `<section>` element
- [ ] Heading `<h2>` with text «О проекте» and `.text-h1` class
- [ ] Body paragraph with correct text and `.text-body-l` class
- [ ] «Подробнее» button links to `/team`
- [ ] Button uses `variant="secondary"` from the existing `Button` component
- [ ] Desktop: content centred, max-width 720px
- [ ] Mobile: button is full-width (`align-self: stretch`)
- [ ] No `'use client'`

---

## Edge cases & error cases

- `/team` page already exists in the codebase — link will resolve correctly
- Heading is `<h2>`, not `<h1>` — there is already one `<h1>` per page (in Hero)
- If `.text-body-l` token weight (600) looks too heavy on mobile, raise with designer
