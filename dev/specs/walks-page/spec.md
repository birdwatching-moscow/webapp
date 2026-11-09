# Spec: Walks Page (`/walks`)

**Goal:** Replace the stub `/walks` page with a full page showing a hero section and an "Ближайшие" table of all upcoming ACTIVE walks, with mobile expand/collapse behaviour.

Figma: desktop node `1697-1916`, mobile node `1697-2095`.

---

## What to build

### 1. Hero section (`WalksPageHero`)

A static Server Component. Full-width, two layouts separated by the standard breakpoint (`min-width: 1248px`).

**Desktop (two-column, 50 / 50):**
- Left column: H1 "Прогулки по Москве" (`text-display` class) followed by 3 description paragraphs (`text-body-l` class, `color: var(--color-muted-foreground)`)
- Right column: `next/image` from `/placeholders/hero-media.png`, fills its container (`object-fit: cover`, `border-radius: var(--radius-lg)`), `priority` prop on (above the fold)

**Mobile (single column, top → bottom):**
1. Full-width image (`next/image`, `priority`)
2. H1
3. 3 description paragraphs

### 2. "Ближайшие" section

Re-uses the existing `NearestSection` component (heading "Ближайшие", `showMoreButton={false}`).

Inside it: a new `WalksExpandable` Client Component (see below).

The table header row and row structure remain identical to the existing `WalksTable` component: `ДАТА | МЕСТО | ЦЕНА | ОСТАЛОСЬ БИЛЕТОВ | →`.

### 3. `WalksExpandable` Client Component

Handles the mobile expand/collapse. Renders the same row markup as `WalksTable` rows.

- State: `expanded: boolean` (default `false`)
- Mobile: rows at index 0–2 always visible; rows at index 3+ hidden (`display: none`) until `expanded === true`
- Mobile: when `walks.length > 3` and `!expanded`, shows "Посмотреть все" button (`Button` component, `variant="default"`, `fullWidth`)
- Mobile: clicking the button sets `expanded = true`; button disappears (not toggled back)
- Desktop: all rows always visible (CSS override); button never visible

The expand button is `display: none` at `min-width: 1248px` via CSS. Extra rows (index 3+) also force-show at `min-width: 1248px`.

### 4. Page wiring

`app/walks/page.tsx` becomes a proper async Server Component:
- Fetches all upcoming ACTIVE walks via existing `getActiveWalks()` (no limit)
- Exports updated `metadata` (title: "Прогулки по Москве | Birdwatching Moscow")
- Renders: `<WalksPageHero />` then the "Ближайшие" section with `<WalksExpandable walks={walks} />`
- No longer delegates to `CityWalks`

`components/cityWalks/CityWalks.tsx` — delete (nothing else imports it after this change).

---

## Data requirements

### Query

Use the existing `getActiveWalks()` from `lib/walks.ts` with no limit.

```ts
// lib/walks.ts — already implemented; no changes needed
prisma.walk.findMany({
  where: { status: 'ACTIVE', startsAt: { gte: new Date() } },
  select: {
    id, slug, title, startsAt, endsAt,
    priceKopecks, capacity,
    _count: { select: { tickets: true } },
  },
  orderBy: { startsAt: 'asc' },
})
```

Returns `WalkTableRow[]` (already typed in `lib/walks.ts`).

### Ticket counting

`Ticket` has no `status` field in the schema. Tickets are only created on paid orders, so `_count.tickets` already equals sold tickets. `available = capacity - _count.tickets`.

### Formatting helpers (all already exist)

| Helper | Output example |
|--------|----------------|
| `formatWalkDate(startsAt, endsAt)` | `"09.08.2026 · 08:00–10:00"` |
| `formatTicketsLabel(available)` | `"1 билет"` / `"нет билетов"` |
| `formatKopecksShort(priceKopecks)` | `"950 ₽"` → price cell shows `"от 950 ₽"` |

---

## Component breakdown

| Component | Type | File |
|-----------|------|------|
| `WalksPageHero` | Server Component | `components/walks-page/WalksPageHero.tsx` |
| `WalksPageHero` styles | CSS Module | `components/walks-page/WalksPageHero.module.css` |
| `WalksExpandable` | Client Component (`'use client'`) | `components/walks-page/WalksExpandable.tsx` |
| `WalksExpandable` styles | CSS Module | `components/walks-page/WalksExpandable.module.css` |
| `app/walks/page.tsx` | Server Component | `app/walks/page.tsx` (**rewrite**) |
| Page layout styles | CSS Module | `app/walks/walks.module.css` (**new**) |

`WalksExpandable` renders the full table (header row + data rows). It does **not** reuse `WalksTable` from the home page; that component is left untouched for home page use. The row markup mirrors `WalksTable` rows exactly (same CSS class names from `WalksTable.module.css` can be shared, or duplicated into `WalksExpandable.module.css`).

---

## Success criteria

- [ ] `pnpm test:run` passes (no new test failures)
- [ ] `pnpm typecheck` passes (zero TypeScript errors)
- [ ] `pnpm build` completes with no errors
- [ ] `app/walks/page.tsx` has no `'use client'` directive
- [ ] `WalksPageHero` has no `'use client'` directive
- [ ] `/walks` renders an `<h1>` with text "Прогулки по Москве"
- [ ] `/walks` renders a `<img>` (next/image) with `src` containing `hero-media.png`
- [ ] Desktop (≥ 1248px): hero is two-column — heading+paragraphs left, image right; verified by CSS `flex-direction: row` on the hero wrapper at that breakpoint
- [ ] Mobile (< 1248px): hero is single-column — image is first child, H1 is second; verified by DOM order
- [ ] `data-testid="walks-table"` element is present when `walks` has at least one entry (existing `WalksTable` test already covers this — `WalksExpandable` must also set this attribute)
- [ ] Each walk row is a `<Link>` (or `<a>`) with `href="/walks/{slug}"`
- [ ] Walk rows are ordered by `startsAt` ascending (earliest first)
- [ ] A walk row with `available === 0` shows "нет билетов" in the tickets column
- [ ] A walk row with `available === 1` shows "1 билет"
- [ ] A walk row with `available === 5` shows "5 билетов"
- [ ] Price cell shows `"от 950 ₽"` for `priceKopecks = 95000`
- [ ] On mobile: when `walks.length <= 3`, "Посмотреть все" button is not rendered
- [ ] On mobile: when `walks.length > 3`, rows at index 3+ are not visible until the button is clicked
- [ ] On mobile: clicking "Посмотреть все" makes all rows visible and removes the button from the DOM
- [ ] On desktop: all rows are visible and "Посмотреть все" button is not visible (CSS `display: none`)
- [ ] When `walks` is empty, the "Ближайшие" section renders nothing (or is visually empty with just the heading)

---

## Edge cases

- **0 active walks** — `WalksExpandable` receives empty array; no rows rendered; "Ближайшие" section shows only the heading, no table structure, no expand button
- **Exactly 3 walks** — all 3 visible on mobile; "Посмотреть все" button not shown
- **Exactly 4 walks** — first 3 visible on mobile, button shown; button reveals walk 4
- **Walk with `endsAt = null`** — `formatWalkDate` shows `"DD.MM.YYYY · HH:MM"` with no time range end
- **Walk with `available < 0`** — guard against negative available: treat as 0 / "нет билетов" (can happen if capacity was lowered after tickets were sold)
- **Very long walk title** — title cell truncates with ellipsis on desktop (single line); wraps on mobile

---

## Error cases

- **Database unavailable at render time** — Next.js will throw an unhandled error; the existing `not-found.tsx` and error boundary (`error.tsx`) handle this if present. No special handling required inside the page component.
- **`/placeholders/hero-media.png` missing from `public/`** — `next/image` renders broken image; not a code error; file must be present in `public/placeholders/` (confirmed present in codebase).

---

## Mobile-specific behaviour (expand/collapse detail)

```
Initial state (mobile, walks.length = 7):
  Row 0  visible
  Row 1  visible
  Row 2  visible
  Row 3  hidden (display: none via .extraRow CSS)
  Row 4  hidden
  Row 5  hidden
  Row 6  hidden
  [Посмотреть все] button  visible

After button click:
  Rows 0-6  all visible
  [Посмотреть все] button  gone (expanded === true)
```

CSS approach (mobile-first):

```css
/* WalksExpandable.module.css */
.extraRow { display: none; }                        /* hidden on mobile by default */
.expanded .extraRow { display: grid; }              /* shown after expand */
.expandButton { /* full-width button */ }

@media (min-width: 1248px) {
  .extraRow { display: grid !important; }           /* always visible on desktop */
  .expandButton { display: none !important; }       /* never visible on desktop */
}
```

The wrapper `<div>` gets `className={expanded ? styles.expanded : ''}`.

---

## Out of scope

- Video in the hero (placeholder image only; video implementation is a future feature)
- Walk detail page `/walks/[slug]` (stub remains; content is out of scope)
- "Отзывы участников" section (explicitly excluded by user story)
- Pagination (all upcoming ACTIVE walks shown; deferred)
- Filtering or sorting controls
- Sold-out walks showing a different call-to-action
- Ticket purchasing from the walks page (covered in separate checkout spec)
- In-flight (AWAITING_PAYMENT) order seat reservation in the availability count

---

## Technical notes

**Files likely affected:**
- `app/walks/page.tsx` — full rewrite
- `app/walks/walks.module.css` — create
- `components/walks-page/WalksPageHero.tsx` — create
- `components/walks-page/WalksPageHero.module.css` — create
- `components/walks-page/WalksExpandable.tsx` — create
- `components/walks-page/WalksExpandable.module.css` — create
- `components/cityWalks/CityWalks.tsx` — delete (verify nothing else imports it first with `grep -r "CityWalks"`)

**Files unchanged:**
- `lib/walks.ts` — `getActiveWalks()` is already correct; no changes
- `components/WalksTable/WalksTable.tsx` — still used on home page; do not modify
- `utils/formatWalkDate.ts`, `utils/formatTicketsLabel.ts`, `utils/formatMoney.ts` — already implemented and tested

**Constraints:**
- `app/walks/page.tsx` must remain a Server Component; data fetching via Prisma directly through `getActiveWalks()`
- `WalksExpandable` requires `'use client'` for `useState`; keep it as the smallest possible Client Component boundary (wrap only the table, not the hero)
- `next/image` must be used for the hero media; add `priority` prop since it is above the fold

**Dependencies:**
- `components/NearestSection/NearestSection.tsx` — existing; used for the section heading
- `components/ui/buttons/Button.tsx` — existing; used for "Посмотреть все" button
- `utils/routes.ts` — `ROUTES.walk(slug)` for row links; already defined

---

## Open questions

1. **Hero description copy** — the Figma shows 3 paragraphs below the H1 but the paragraph text is not provided in the brief. What are the 3 paragraph strings? Confirm before implementation begins.
2. **Hero image dimensions** — `/placeholders/hero-media.png` exists but aspect ratio / intrinsic size is unknown. What `width` and `height` props should `next/image` use for the hero? (Figma desktop right column was 600 × 317 in the home hero; confirm if the same applies here or different.)
3. **Empty-state display** — when no ACTIVE walks exist, should the "Ближайшие" section be hidden entirely, show just the heading, or show a "Прогулок пока нет" message? Confirm expected behaviour.
