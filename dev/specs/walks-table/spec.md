# Spec: Walks Table

Figma: `oe5y2BvWf7ErAL30h0ffT9`, desktop node `1697:1886`

---

## What to build

### Summary

A "Ближайшие" (Upcoming) table section showing active, upcoming walks with date, title, price, and remaining tickets. Used in two places:

1. **Home page** — below `HomeWalks`, shows at most 4 active walks + a "Подробнее" button linking to `/walks`.
2. **Walks page** (`/walks`, `CityWalks`) — shows ALL active upcoming walks, no "Подробнее" button.

Clicking any row navigates to the individual walk page `/walks/[slug]`.

---

## Components

### `WalksTable` (`components/WalksTable/WalksTable.tsx`)

Presentational Server Component. Receives pre-fetched walk data as props.

**Props:**
```ts
interface WalkTableRow {
  id: string
  slug: string
  title: string
  startsAt: Date
  duration: string | null
  priceKopecks: number
  capacity: number
  ticketsSold: number
}

interface WalksTableProps {
  walks: WalkTableRow[]
  showMoreButton?: boolean  // default false; renders "Подробнее" button linking to /walks
}
```

**Structure:**
```
<section data-testid="walks-table">
  <h2>Ближайшие</h2>
  <table>
    <thead>
      <tr>ДАТА | МЕСТО | ЦЕНА | ОСТАЛОСЬ БИЛЕТОВ | (empty — arrow col)</tr>
    </thead>
    <tbody>
      {walks.map(w => <WalkRow ... />)}
    </tbody>
  </table>
  {showMoreButton && <Button as="a" href="/walks">Подробнее</Button>}
</section>
```

If `walks` is empty: renders nothing (null).

---

### `WalkRow` (`components/WalksTable/WalkRow.tsx`)

Client Component (needs `<Link>` navigation). One `<tr>` per walk.

```ts
interface WalkRowProps {
  slug: string
  dateLabel: string   // pre-formatted: "DD.MM.YYYY · HH:MM" (or "HH:MM–HH:MM" if duration)
  title: string
  priceLabel: string  // pre-formatted: "от 950 ₽"
  ticketsLabel: string  // "нет билетов" | "1 билет" | "2 билета" | "5 билетов"
  ticketsAvailable: number  // 0 means sold out
}
```

The entire row is wrapped in a `<Link href={/walks/${slug}}>` via CSS (cursor: pointer on the `<tr>`, or by making the row a link-like clickable row).

**Row content:**
- Col 1 (ДАТА): `dateLabel`
- Col 2 (МЕСТО): `title`
- Col 3 (ЦЕНА): `priceLabel`
- Col 4 (ОСТАЛОСЬ БИЛЕТОВ): `ticketsLabel` — muted color if `ticketsAvailable === 0`
- Col 5 (arrow): "→" icon, hidden on mobile

**Hover state:**
- Background: `var(--color-border)` (light grey) on `<tr>:hover`
- Cursor: pointer

---

## Data fetching

### `lib/walks.ts` — `getActiveWalks(options?: { limit?: number })`

```ts
export type WalkTableRow = {
  id: string
  slug: string
  title: string
  startsAt: Date
  duration: string | null
  priceKopecks: number
  capacity: number
  ticketsSold: number
}

export async function getActiveWalks(options?: { limit?: number }): Promise<WalkTableRow[]>
```

Query:
```ts
prisma.walk.findMany({
  where: { status: 'ACTIVE', startsAt: { gte: new Date() } },
  select: {
    id: true, slug: true, title: true, startsAt: true, duration: true,
    priceKopecks: true, capacity: true,
    _count: { select: { tickets: true } },
  },
  orderBy: { startsAt: 'asc' },
  take: options?.limit,
})
```

Maps `_count.tickets` → `ticketsSold`.

---

## Formatting helpers (pure functions in `utils/`)

### `formatWalkDate(startsAt: Date, duration: string | null): string`
(in `utils/formatWalkDate.ts`)

- Formats date as "DD.MM.YYYY · HH:MM"
- If `duration` is non-null and matches pattern "HH:MM" (end time), appends "–HH:MM"
- Example: `formatWalkDate(new Date('2026-08-09T08:00+03:00'), null)` → "09.08.2026 · 08:00"

### `formatTicketsLabel(available: number): string`
(in `utils/formatTicketsLabel.ts`)

- `available === 0` → "нет билетов"
- else → `pluralRu(available, ['билет', 'билета', 'билетов'])`

### `formatWalkPrice(priceKopecks: number): string`
(inline in component, or in `utils/formatWalkPrice.ts`)

- Returns `"от " + formatKopecksRu(priceKopecks)`
- Rounds display to rubles if kopecks remainder is 0 (e.g. "от 950 ₽" not "от 950,00 ₽")

---

## Routes

Add to `utils/routes.ts`:
```ts
walk: (slug: string) => `/walks/${slug}` as const,
```

---

## Page wiring

### `app/page.tsx` (Home page)

```tsx
const walks = await getActiveWalks({ limit: 4 })
// ...
<WalksTable walks={walks} showMoreButton={walks.length > 0} />
```

Placed directly after `<HomeWalks />`.

### `components/cityWalks/CityWalks.tsx` (Walks page)

```tsx
const walks = await getActiveWalks()
return <WalksTable walks={walks} showMoreButton={false} />
```

Convert from stub to proper server component.

### `app/walks/[slug]/page.tsx` (Walk detail page — stub)

Stub only in this feature; full content is out of scope.

```tsx
export default async function WalkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <main><p>Прогулка: {slug}</p></main>
}
```

---

## Layout

### Desktop (min-width: 1248px)

```
section:
  padding-inline: var(--page-gutter)
  padding-top: var(--space-7)   // 48px

h2: text-h1 class

table:
  width: 100%
  border-collapse: collapse
  border: 1px solid var(--color-border)
  border-radius: var(--radius-lg)

thead th:
  text-label class
  color: var(--color-muted-foreground)
  text-transform: uppercase
  padding: var(--space-4) var(--space-5)
  text-align: left
  border-bottom: 1px solid var(--color-border)

tbody tr:
  border-bottom: 1px solid var(--color-border)
  cursor: pointer
  transition: background-color 150ms ease

tbody tr:hover:
  background-color: color-mix(in srgb, var(--color-border) 50%, transparent)

tbody td:
  padding: var(--space-5) var(--space-5)   // ~24px
  text-body class

col widths (approximate):
  ДАТА:              ~200px (fixed)
  МЕСТО:             flex (1fr)
  ЦЕНА:              ~150px (fixed)
  ОСТАЛОСЬ БИЛЕТОВ:  ~180px (fixed)
  Arrow col:         40px (fixed)

"Подробнее" button:
  margin-top: var(--space-5)
  full width on mobile, auto on desktop (or as designed)
```

### Mobile (base)

```
table columns collapsed — show only МЕСТО and ОСТАЛОСЬ БИЛЕТОВ side-by-side,
with ДАТА as small label above МЕСТО, ЦЕНА hidden or shown below МЕСТО.

OR: use a list/card layout instead of table on mobile.
```

**Recommended mobile approach:** replace `<table>` with a `<ul>` list on mobile using CSS `display: none` on the `<thead>` and reformatting cells as a 2-column grid per row:

```
[ДАТА]           [ОСТАЛОСЬ БИЛЕТОВ]
[МЕСТО]                           →
[ЦЕНА]
```

Use `@media (max-width: 1247px)` to switch from table display to block/grid display for each `<tr>`.

---

## Success criteria

1. `pnpm test:run` passes with all new WalksTable, WalkRow, formatWalkDate, formatTicketsLabel tests green.
2. `<section data-testid="walks-table">` renders when `walks` has at least one entry.
3. `WalksTable` renders nothing when `walks` is empty.
4. Each walk row has a link to `/walks/${slug}`.
5. Ticket label: 0 → "нет билетов"; 1 → "1 билет"; 2 → "2 билета"; 5 → "5 билетов"; 11 → "11 билетов"; 21 → "21 билет".
6. Price label: `priceKopecks: 95000` → "от 950 ₽".
7. `showMoreButton={true}` renders a link to `/walks`; `showMoreButton={false}` does not.
8. `app/page.tsx` calls `getActiveWalks({ limit: 4 })` and renders `WalksTable`.
9. `CityWalks` calls `getActiveWalks()` (no limit) and renders `WalksTable`.
10. `pnpm build` succeeds with zero TypeScript errors.

---

## Edge cases

- **0 active walks on home page** — `WalksTable` renders nothing; "Подробнее" button not shown.
- **Exactly 4 walks** — all 4 shown on home page; no "Подробнее" button needed, but still renders if `showMoreButton` prop is true.
- **Walk with 0 available tickets** — shows "нет билетов", row is still clickable.
- **Walk capacity = ticketsSold** — same as 0 available tickets case.
- **Walk with `duration = null`** — date column shows "DD.MM.YYYY · HH:MM" without time range end.
- **`formatKopecksRu` with whole ruble amounts** — price shows "от 950 ₽" (strip trailing ",00").

---

## Out of scope

- Full walk detail page (`/walks/[slug]`) — stub only.
- In-flight (AWAITING_PAYMENT) order seat reservation in availability count.
- Purchase flow from the walks table (future feature).
- Pagination on `/walks` page.
