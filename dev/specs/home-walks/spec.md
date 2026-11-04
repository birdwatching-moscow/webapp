# Spec: HomeWalks

Figma: `oe5y2BvWf7ErAL30h0ffT9`, desktop node `1697:1885`, mobile node `I1697:1915;1697:1885`

---

## Components

### `PhotoCard` (`components/PhotoCard/PhotoCard.tsx`)

Reusable photo component used for all large section images across the site.

**Props:**
```ts
interface PhotoCardProps {
  src: string
  alt: string
  caption?: string   // text shown on hover; falls back to placeholder Lorem Ipsum
  className?: string
}
```

**Behaviour:**
- Renders a `next/image` filling the container (`object-fit: cover`)
- `border-radius: 12px`, `overflow: hidden`
- Info icon (the provided white SVG `ⓘ`) absolutely positioned at **bottom-left**, `16px` from left and bottom
- On hover: icon fades out, a text overlay fades in at the bottom of the card — white text on a semi-transparent dark gradient — showing `caption` or Lorem Ipsum placeholder
- Hover transition CSS only (no JS state): `opacity` on icon and overlay driven by `.photoCard:hover`

**Placeholder caption (Lorem Ipsum):**
> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.

---

### `HomeWalks` (`components/HomeWalks/HomeWalks.tsx`)

**Content (hardcoded for now):**
- Heading: `Прогулки по Москве`
- Body: `Прогулки в Москве проходят каждые выходные и длятся 1,5–2 часа. Такой лёгкий формат идеален для первого знакомства с птицами, а многие приходят регулярно, потому что им нравится отдыхать от городской суеты и проводить время на природе в хорошей компании.`
- Photo: placeholder image (`/placeholder-walks.jpg` — use any existing image from `public/`)

---

## Layout

### Mobile (base)

```
padding-top: 64px
padding-inline: var(--page-gutter)
display: flex; flex-direction: column; gap: 16px

[h2]        Прогулки по Москве   28px / 600 / line-height 32px
[PhotoCard] full width × aspect-ratio 16/9; border-radius 12px
[p]         body text            18px / 500 / line-height 24px; color: var(--color-muted-foreground)
```

### Desktop (min-width: 1248px)

```
padding-top: 96px
display: flex; flex-direction: column; gap: 48px

Row 1 — intro (flex row, gap 24px, equal 1fr 1fr):
  left:   h2  40px / 600
  right:  p   20px / 600; color: var(--color-muted-foreground)

Row 2 — PhotoCard: full content width × aspect-ratio 16/9
```

---

## Success Criteria

1. `pnpm test:run` passes with all HomeWalks and PhotoCard tests green.
2. `<section>` renders with `data-testid="home-walks"`.
3. `<h2>` with text "Прогулки по Москве" is present.
4. Body paragraph text matches the copy above.
5. `PhotoCard` renders an `<img>` (via next/image) with the correct `alt`.
6. `PhotoCard` renders the info SVG icon (`data-testid="photo-info-icon"`) inside the card.
7. `PhotoCard` renders the caption overlay element (`data-testid="photo-caption"`) inside the card.
8. Desktop: intro row is `flex-direction: row` (via CSS class); mobile base is `flex-direction: column`.
9. `HomeWalks` is wired into `app/page.tsx` below `HomeAbout`.

---

## Edge / Error Cases

- If `src` is empty string, `next/image` still renders (alt text visible).
- `caption` prop is optional; component must not crash when omitted.
- Hover styles are CSS-only — no JS event handlers on the card.
