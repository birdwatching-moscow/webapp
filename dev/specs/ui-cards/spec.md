# Spec: UI Cards

**Goal:** Implement seven card components (TeamCard, ExpeditionCard, HighlightCard, LocationCard, EditorialCard, Fact, Review) that faithfully match the Figma section `1697:320`–`1697:349`, are fully token-driven, mobile-first, and test-covered.

---

## Cross-cutting constraints

Applies to all seven components unless overridden per-component:

- No inline styles — all layout and visual styles via CSS Modules and `app/globals.css` tokens only
- No `'use client'` directive unless the component requires browser APIs, event handlers, or React state — only `ExpeditionCard` qualifies (see below)
- `className` prop forwarded to the root element, concatenated with internal module classes (never replacing them)
- Mobile-first: base CSS targets mobile; desktop breakpoints scale up with `min-width` media queries — never `max-width` overrides
- All components are named exports (`export const ComponentName = ...`) using `const` arrow function style
- One component per file; all seven components live under `components/cards/`
- Each component has a paired CSS Module file (e.g., `TeamCard.module.css`) in the same directory
- All text elements use a global typography class from `app/globals.css` (`.text-h1` through `.text-caption`) rather than raw font declarations in the module CSS
- **Typography weight note (applies to 5 components):** Figma specifies "18px/24px Manrope Medium (weight 500)" for body content fields in TeamCard, ExpeditionCard, HighlightCard, LocationCard, and Review. The closest global class by size is `.text-body-l` (Manrope 600, 18/24px mobile → 20/24px desktop), but its weight is 600 (SemiBold), not 500. Until Open Question #7 is resolved, use `.text-body-l` and add `font-weight: 500` as a single CSS module override on that element to match the Figma weight exactly.

---

## 1. TeamCard

### What to build

`components/cards/TeamCard.tsx` and `components/cards/TeamCard.module.css`. Server Component (no `'use client'`).

### Props interface

```ts
export type TeamCardProps = {
  name: string;
  role: string;
  details: string;
  imageUrl?: string;
  imageAlt: string;         // required; forwarded to ImagePlaceholder
  ebirdHref?: string;       // when omitted the eBird button is not rendered
  className?: string;
};
```

### Layout and visual

| Property | Value |
|----------|-------|
| Root element | `<article>` |
| Display | `flex; flex-wrap: wrap` |
| Gap | `var(--space-4)` (16px) |
| Width | `min-width: 320px; max-width: 600px` |
| Background | `var(--color-background)` |
| Border | none |
| Border-radius | `var(--radius-lg)` (12px) |
| Padding | none |

**Photo sub-frame:** fixed `200px × 200px` containing `<ImagePlaceholder ratio="1-1" src={imageUrl} alt={imageAlt} />`.

**Info sub-frame:** `flex: 1; display: flex; flex-direction: column; gap: var(--space-1)` (4px). Contains Name, Role, Details, and optionally the eBird button, stacked vertically.

### Typography

| Element | Global class | Color token | Notes |
|---------|-------------|-------------|-------|
| Name | `.text-h2` | `--color-foreground` | 24/28px mobile → 28/32px desktop |
| Role | `.text-body` | `--color-muted-foreground` | 16/20px mobile → 18/24px desktop |
| Details | `.text-body-l` | `--color-foreground` | See cross-cutting weight note |
| eBird button | — | — | `<Button variant="ghost" size="sm" as="a" href={ebirdHref}>eBird</Button>` |

### Success criteria

- [ ] Renders an `<article>` root element with `display: flex; flex-wrap: wrap`, `gap: 16px`, `background-color: var(--color-background)`, `border-radius: var(--radius-lg)`, and no `border` property set
- [ ] Photo sub-frame is 200×200px and contains `<ImagePlaceholder ratio="1-1">`
- [ ] `name` renders in an element with the `.text-h2` CSS class and `color: var(--color-foreground)`
- [ ] `role` renders in an element with the `.text-body` CSS class and `color: var(--color-muted-foreground)`
- [ ] `details` renders in an element with the `.text-body-l` CSS class and `color: var(--color-foreground)`
- [ ] When `ebirdHref` is provided, a `<Button variant="ghost" size="sm" as="a" href={ebirdHref}>` with text "eBird" is present in the DOM
- [ ] When `ebirdHref` is `undefined`, no eBird button element is present in the DOM
- [ ] `className` prop value appears in the root element's `className` string
- [ ] No `'use client'` directive in the file

### Edge cases

- `ebirdHref` as empty string `""`: the eBird button is rendered with `href=""`; the prop being an empty string is not treated as absent. Callers that have no eBird link should omit the prop rather than pass `""`.
- `imageUrl` absent: `ImagePlaceholder` renders the grey placeholder; no broken image element.
- Very long `name` or `details`: text wraps within the info sub-frame; the photo sub-frame stays fixed at 200×200px.
- Card narrower than photo + gap + minimum info width: `flex-wrap: wrap` causes the info sub-frame to drop below the photo sub-frame.

### Error cases

- `imageAlt` is required — omitting it causes a TypeScript error (propagated from `ImagePlaceholder` which requires `alt`).

---

## 2. ExpeditionCard

### What to build

`components/cards/ExpeditionCard.tsx` and `components/cards/ExpeditionCard.module.css`. Requires `'use client'` (touch-tap state for ⓘ photo preview).

### Props interface

```ts
export type ExpeditionCardProps = {
  imageUrl?: string;
  imageAlt: string;         // required; forwarded to ImagePlaceholder
  dateRange: string;        // pre-formatted date range; rendered UPPERCASE via CSS text-transform
  title: string;
  summary: string;
  onPreview?: () => void;   // called when photo zone is tapped (touch) or activated; caller renders the modal/lightbox
  className?: string;
};
```

### Layout and visual

| Property | Value |
|----------|-------|
| Root element | `<article>` |
| Display | `flex; flex-direction: column` |
| Width | `var(--size-col-3)` (406px) fixed |
| Height | fills container (`height: 100%`) |
| Background | `var(--color-background)` |
| Border | `var(--stroke-default) solid var(--color-border)` (2px solid) |
| Border-radius | `var(--radius-lg)` (12px) |
| Overflow | `hidden` |

**Photo zone:** `<ImagePlaceholder ratio="4-3" src={imageUrl} alt={imageAlt} />` with `width: 100%; min-height: 240px; max-height: 462px`. The photo zone is wrapped in an interactive element (see ⓘ behavior below).

**Text section:** `padding: 0 var(--space-4) var(--space-4)` (0 top, 16px left/right/bottom); `display: flex; flex-direction: column; gap: var(--space-2)` (8px).

### ⓘ Preview behavior

The Figma annotation (verbatim): "Photo preview для карточек < 500 px: показывать Unicode ⓘ поверх изображения. Hover на устройствах с указателем и tap на touch открывают preview; отдельный графический icon asset не использовать."

Implementation contract:

- The ⓘ character is the Unicode character `ⓘ` (U+24D8 CIRCLED LATIN SMALL LETTER I) rendered as a `<span aria-hidden="true">` — never a separate icon asset
- The ⓘ is positioned `absolute` at `top: var(--space-2); right: var(--space-2)` within the photo zone
- Visibility of the ⓘ when the card width is ≥ 500px vs < 500px is controlled via a CSS module class applied via a `narrow` prop (see Open Questions #3 for the narrow-trigger mechanism decision)
- The photo zone wrapper is a `<button>` with `aria-label="Открыть превью"` so the interaction is keyboard- and screen-reader-accessible
- **Pointer devices (`:hover` on the button):** increase ⓘ opacity — pure CSS, no JS
- **Touch tap (onClick on the button):** calls `onPreview?.()` — this click handler is why `'use client'` is required
- Animate only `opacity` or `transform` on the ⓘ hover transition; no layout-affecting properties

### Typography

| Element | Global class | Color token | CSS module extra |
|---------|-------------|-------------|-----------------|
| Date range | `.text-label` | `--color-muted-foreground` | `text-transform: uppercase; letter-spacing: 0.08em` |
| Title | `.text-h2` | `--color-foreground` | — |
| Summary | `.text-body-l` | `--color-muted-foreground` | See cross-cutting weight note |

### Success criteria

- [ ] Renders an `<article>` with `flex-direction: column`, `width: var(--size-col-3)` (406px), `border: 2px solid var(--color-border)`, `border-radius: var(--radius-lg)`, `overflow: hidden`
- [ ] `<ImagePlaceholder ratio="4-3">` is the first child; its container has `min-height: 240px` and `max-height: 462px`
- [ ] `dateRange` renders in `.text-label` class with `text-transform: uppercase` and `letter-spacing: 0.08em` applied via CSS module
- [ ] `title` renders in `.text-h2` class with `--color-foreground`
- [ ] `summary` renders in `.text-body-l` class with `--color-muted-foreground`
- [ ] A `<button>` wrapping the photo zone is present; it has `aria-label="Открыть превью"`
- [ ] A `<span aria-hidden="true">` containing the character `ⓘ` is present inside the photo zone
- [ ] Clicking the photo zone button calls `onPreview` exactly once when `onPreview` is provided
- [ ] Clicking the photo zone button when `onPreview` is `undefined` does not throw
- [ ] `className` appended to the root element's class list
- [ ] `'use client'` directive is present in the file

### Edge cases

- `imageUrl` absent: `ImagePlaceholder` renders grey placeholder; ⓘ overlay still renders; click still fires `onPreview`.
- `onPreview` not provided: click is a no-op; the `<button>` is still rendered for accessibility (the preview affordance should still be visible to the user).
- Very long `title` or `summary`: text wraps; card height grows; width stays fixed at 406px.

### Error cases

- `imageAlt` required (TypeScript).

---

## 3. HighlightCard

### What to build

`components/cards/HighlightCard.tsx` and `components/cards/HighlightCard.module.css`. Server Component (no `'use client'`).

### Props interface

```ts
export type HighlightCardProps = {
  title: string;
  description: string;
  className?: string;
};
```

### Layout and visual

| Property | Value |
|----------|-------|
| Root element | `<div>` |
| Display | `flex; flex-direction: column` |
| Gap | `var(--space-2)` (8px) |
| Width/height | `width: 100%; height: 100%` (fills grid/flex container) |
| Padding | `var(--space-4)` all sides (16px) |
| Background | none — **do not set `background-color`**; inherits from parent |
| Border | `var(--stroke-default) solid var(--color-border)` (2px solid) |
| Border-radius | `var(--radius-lg)` (12px) |

### Typography

| Element | Global class | Color token |
|---------|-------------|-------------|
| Title | `.text-h2` | `--color-foreground` |
| Description | `.text-body-l` | `--color-foreground` |

Note: both title and description use `--color-foreground`. Description uses `.text-body-l`; see cross-cutting weight note.

### Success criteria

- [ ] Renders the root element with `padding: 16px`, `border: 2px solid var(--color-border)`, `border-radius: var(--radius-lg)`, `gap: 8px`, `flex-direction: column`
- [ ] Root element has **no** `background-color` property set (transparent; inherits parent)
- [ ] `title` renders in `.text-h2` class with `--color-foreground`
- [ ] `description` renders in `.text-body-l` class with `--color-foreground`
- [ ] `className` appended to root element's class list
- [ ] No `'use client'` directive in the file

### Edge cases

- Very long `description`: wraps and grows card height; no layout break.
- `description` as empty string `""`: renders an empty element; no crash.

### Error cases

- None beyond TypeScript enforcement.

---

## 4. LocationCard

### What to build

`components/cards/LocationCard.tsx` and `components/cards/LocationCard.module.css`. Server Component (no `'use client'`).

### Props interface

```ts
export type LocationCardProps = {
  imageUrl?: string;
  imageAlt: string;         // required; forwarded to ImagePlaceholder
  name: string;
  description: string;
  species: string;          // value appended after the hard-coded "Птицы: " prefix
  className?: string;
};
```

### Layout and visual

| Property | Value |
|----------|-------|
| Root element | `<article>` |
| Display | `flex; flex-direction: column` |
| Gap | `var(--space-2)` (8px) |
| Width | `width: 100%` (fills container) |
| Height | hugs content |
| Padding | **none** on root (see Open Questions #4) |
| Background | `var(--color-background)` |
| Border | none |
| Border-radius | `var(--radius-lg)` on root (clips image top corners via `overflow: hidden`) |
| Overflow | `hidden` (ensures top image corners are rounded by the card radius) |

**Image:** `<ImagePlaceholder ratio="16-9" src={imageUrl} alt={imageAlt} />` as first child; `width: 100%`.

**Text children** (stacked in order: name, description, species) are direct children of the root `<article>`, sitting flush at the card edge per the current Figma zero-padding spec. See Open Questions #4.

### Typography

| Element | Global class | Color token | Notes |
|---------|-------------|-------------|-------|
| Name | `.text-h2` | `--color-foreground` | |
| Description | `.text-body-l` | `--color-muted-foreground` | See cross-cutting weight note |
| Species | `.text-body-l` | `--color-muted-foreground` | "Птицы: " prefix hard-coded in component; `species` prop supplies the value after the prefix |

### Species rendering

```tsx
<p className={`${styles.species} text-body-l`}>
  <span>Птицы: </span>{species}
</p>
```

The string "Птицы: " is a static UI string; not internationalised in this scope.

### Success criteria

- [ ] Renders an `<article>` with `flex-direction: column`, `gap: 8px`, `background-color: var(--color-background)`, `border-radius: var(--radius-lg)`, `overflow: hidden`, no `padding`
- [ ] First child is `<ImagePlaceholder ratio="16-9">` filling card width
- [ ] `name` renders in `.text-h2` class with `--color-foreground`
- [ ] `description` renders in `.text-body-l` class with `--color-muted-foreground`
- [ ] Species field renders the text "Птицы: " followed by the `species` prop value, in `.text-body-l` class with `--color-muted-foreground`
- [ ] `className` appended to root element
- [ ] No `'use client'` directive in the file

### Edge cases

- `imageUrl` absent: `ImagePlaceholder` renders grey placeholder; card layout intact.
- `species` as empty string `""`: renders "Птицы: " with nothing after it; no crash.
- Very long `name`: wraps to multiple lines; other elements are unaffected.

### Error cases

- `imageAlt` required (TypeScript).

---

## 5. EditorialCard

### What to build

`components/cards/EditorialCard.tsx` and `components/cards/EditorialCard.module.css`. Server Component (no `'use client'`).

### Props interface

```ts
export type EditorialCardProps = {
  imageUrl?: string;
  imageAlt: string;         // required; forwarded to ImagePlaceholder
  title: string;
  subtitle: string;
  className?: string;
};
```

### Layout and visual

| Property | Value |
|----------|-------|
| Root element | `<article>` |
| Display | `flex; flex-direction: column; align-items: center; justify-content: center` |
| Width/height | `width: 100%; height: 100%` |
| Padding | `var(--space-7)` vertical (48px), `var(--space-4)` horizontal (16px) |
| Border | `var(--stroke-default) solid var(--color-border)` (2px solid) |
| Border-radius | `var(--radius-lg)` (12px) |
| Overflow | `hidden` |

**Image container:** `width: 247px; height: var(--size-control-header-mobile)` (64px); centered horizontally (inherits `align-items: center` from parent). Contains `<ImagePlaceholder ratio="16-9" src={imageUrl} alt={imageAlt} />` inside a wrapper with `overflow: hidden` to clip to the fixed 64px height. Note: the `ratio="16-9"` value on `ImagePlaceholder` at 247px wide would naturally produce ~139px height; the 64px wrapper clips it. See Open Questions #5.

**Text block:** `display: flex; flex-direction: column; gap: var(--space-2)` (8px); `width: 100%`; children have `text-align: center`.

### Typography

| Element | Global class | Color token | Alignment |
|---------|-------------|-------------|-----------|
| Title | `.text-h1` | `--color-foreground` | `text-align: center` |
| Subtitle | `.text-body-l` | `--color-muted-foreground` | `text-align: center` |

### Success criteria

- [ ] Renders an `<article>` with `flex-direction: column`, `align-items: center`, `padding: 48px 16px`, `border: 2px solid var(--color-border)`, `border-radius: var(--radius-lg)`, `overflow: hidden`
- [ ] Image container has `width: 247px` and `height: 64px` (`var(--size-control-header-mobile)`) and is horizontally centered within the card
- [ ] `<ImagePlaceholder ratio="16-9">` is rendered inside the fixed-size image container
- [ ] `title` renders in `.text-h1` class with `--color-foreground` and `text-align: center`
- [ ] `subtitle` renders in `.text-body-l` class with `--color-muted-foreground` and `text-align: center`
- [ ] `className` appended to root element
- [ ] No `'use client'` directive in the file

### Edge cases

- Very long `title`: wraps to multiple lines; card height grows; the image and subtitle shift down.
- `imageUrl` absent: `ImagePlaceholder` renders grey placeholder clipped to 247×64px.

### Error cases

- `imageAlt` required (TypeScript).

---

## 6. Fact

### What to build

`components/cards/Fact.tsx` and `components/cards/Fact.module.css`. Server Component (no `'use client'`).

### Props interface

```ts
export type FactProps = {
  value: string;      // e.g., "1000+", "47"
  label: string;      // e.g., "участников", "видов птиц"
  className?: string;
};
```

### Layout and visual

| Property | Value |
|----------|-------|
| Root element | `<div>` (see Open Questions #6 for semantic `<dl>` alternative) |
| Display | `flex; flex-direction: column` |
| Width | `min-width: 128px; max-width: 394px` |
| Background | none |
| Border | none |
| Padding | none |

### Typography

| Element | Global class | Color token |
|---------|-------------|-------------|
| Value | `.text-h1` | `--color-foreground` |
| Label | `.text-body-l` | `--color-muted-foreground` |

### Success criteria

- [ ] Renders the `value` in an element with `.text-h1` class and `color: var(--color-foreground)`
- [ ] Renders the `label` in an element with `.text-body-l` class and `color: var(--color-muted-foreground)`
- [ ] Root element has no `border`, no `background-color`, no `padding` in its computed styles
- [ ] Root element has `min-width: 128px` and `max-width: 394px`
- [ ] `className` appended to root element
- [ ] No `'use client'` directive in the file

### Edge cases

- Very long `value` string (e.g., `"10 000 000+"`): wraps within the min/max width constraints.
- `label` as empty string `""`: renders an empty text node; no crash.

### Error cases

- None beyond TypeScript enforcement.

---

## 7. Review

### What to build

`components/cards/Review.tsx` and `components/cards/Review.module.css`. Server Component (no `'use client'`).

### Props interface

```ts
export type ReviewProps = {
  authorImageUrl?: string;
  authorName: string;
  body: string;
  className?: string;
};
```

### Layout and visual

| Property | Value |
|----------|-------|
| Root element | `<article>` |
| Display | `flex; flex-direction: column` |
| Gap | `var(--space-4)` (16px) |
| Width | `min-width: 320px; max-width: var(--size-col-3)` (406px) |
| Padding | `var(--space-5)` all sides (24px) |
| Border | `var(--stroke-default) solid var(--color-border)` (2px solid) |
| Border-radius | `var(--radius-lg)` (12px) |

**Header row:** `display: flex; flex-direction: row; align-items: flex-end; gap: var(--space-4)` (16px).
- Author photo: `<ImagePlaceholder ratio="1-1" src={authorImageUrl} alt={authorName} />` in a fixed `80px × 80px` wrapper.
- Author name: see Typography below.

**Body:** below the header row; full width within the card.

### Typography

| Element | Global class | Color token | Notes |
|---------|-------------|-------------|-------|
| Author name | `.text-h2` | `--color-foreground` | |
| Body | `.text-body-l` | `--color-foreground` | Figma specifies raw `#1e2d2a`; use `--color-foreground` (`#26241f`) pending Open Questions #2. See cross-cutting weight note. |

### Success criteria

- [ ] Renders an `<article>` with `flex-direction: column`, `gap: 16px`, `padding: 24px`, `border: 2px solid var(--color-border)`, `border-radius: var(--radius-lg)`
- [ ] Root element has `min-width: 320px` and `max-width: var(--size-col-3)` (406px)
- [ ] Header row has `flex-direction: row`, `align-items: flex-end`, `gap: 16px`
- [ ] Author photo container is 80×80px and contains `<ImagePlaceholder ratio="1-1">`
- [ ] `authorName` renders in `.text-h2` class with `--color-foreground`
- [ ] `body` renders in `.text-body-l` class with `--color-foreground`
- [ ] `className` appended to root element
- [ ] No `'use client'` directive in the file

### Edge cases

- `authorImageUrl` absent: `ImagePlaceholder` renders grey placeholder at 80×80px; layout intact.
- Very long `body`: wraps; card height grows; width stays within 320–406px.
- Very long `authorName`: wraps within the header row; the photo frame stays 80×80px.

### Error cases

- None beyond TypeScript enforcement.

---

## Out of scope

- Card-level `href` / navigation — no card is itself a link; routing is the caller's concern
- Skeleton / shimmer loading states for images — deferred
- Mount/unmount animations or card hover elevation effects
- Click handlers on any card except `ExpeditionCard`'s photo zone
- The modal/lightbox rendered after `onPreview` fires in `ExpeditionCard` — caller's responsibility
- Internationalisation of the "Птицы: " prefix in `LocationCard`
- `TeamCard` additional social link slots beyond `ebirdHref`
- `Fact` semantic `<dl>`/`<dt>`/`<dd>` wrapping — pending Open Questions #6
- `Review` star rating, timestamp, or verified badge
- Dark mode / additional color scheme tokens
- Storybook stories

---

## Technical notes

**Files to create:**

| Component | Source | CSS Module | Test |
|-----------|--------|-----------|------|
| TeamCard | `components/cards/TeamCard.tsx` | `TeamCard.module.css` | `__tests__/components/cards/TeamCard.test.tsx` |
| ExpeditionCard | `components/cards/ExpeditionCard.tsx` | `ExpeditionCard.module.css` | `__tests__/components/cards/ExpeditionCard.test.tsx` |
| HighlightCard | `components/cards/HighlightCard.tsx` | `HighlightCard.module.css` | `__tests__/components/cards/HighlightCard.test.tsx` |
| LocationCard | `components/cards/LocationCard.tsx` | `LocationCard.module.css` | `__tests__/components/cards/LocationCard.test.tsx` |
| EditorialCard | `components/cards/EditorialCard.tsx` | `EditorialCard.module.css` | `__tests__/components/cards/EditorialCard.test.tsx` |
| Fact | `components/cards/Fact.tsx` | `Fact.module.css` | `__tests__/components/cards/Fact.test.tsx` |
| Review | `components/cards/Review.tsx` | `Review.module.css` | `__tests__/components/cards/Review.test.tsx` |

**Dependencies:**
- `Button` (`components/ui/buttons/Button.tsx`) — used in `TeamCard` only
- `ImagePlaceholder` (`components/ui/image-placeholder/ImagePlaceholder.tsx`) — used in `TeamCard`, `ExpeditionCard`, `LocationCard`, `EditorialCard`, `Review`
- No new npm packages required

**Constraints:**
- `ExpeditionCard` must have `'use client'`; all other six files must NOT have `'use client'`
- `ExpeditionCard` CSS transitions: animate only `opacity` or `transform`; no layout-affecting property animations
- `Button` with `as="a"` renders a Next.js `<Link>`, which emits a plain `<a>` for external URLs — no special handling required
- `EditorialCard` image container must use `overflow: hidden` to clip the `ImagePlaceholder` to the fixed 64px height without distorting the `ImagePlaceholder` component itself
- `LocationCard` root uses `overflow: hidden` to apply `border-radius` corner clipping to the top of the `ImagePlaceholder`

**Testing:**
- Tests in `__tests__/components/cards/`
- Use Vitest + Testing Library
- Each success criterion maps to at least one test
- Run `pnpm test:run` before marking any component complete

---

## Open questions

1. **Cross-cutting "18px/24px Manrope Medium" body text:** `.text-body-l` (Manrope 600, 18/24px → 20/24px) is the closest class by size, but Figma specifies weight 500. The spec calls for a `font-weight: 500` override in each component's CSS module. A cleaner alternative is a new `.text-body-m` global class (Manrope 500, 18/24px → 20/24px). Which approach does the project prefer? Affects TeamCard, ExpeditionCard, HighlightCard, LocationCard, and Review.

2. **Review body text color:** Figma specifies raw `#1e2d2a` for the review body — a value that has no CSS token and differs from `--color-foreground` (`#26241f`) by approximately 1 lightness step. Is this intentional, or should `--color-foreground` be used? If intentional, a new token is needed before implementation.

3. **ExpeditionCard ⓘ narrow-card trigger mechanism:** The Figma annotation says "< 500px". Three options: (a) CSS `@container` query — requires a named container context provided by the caller; (b) a `narrow?: boolean` prop passed by the caller — simplest to test; (c) a JS `ResizeObserver` — self-contained but adds bundle weight. Decide before implementation so the props interface and tests can be finalized.

4. **LocationCard zero padding:** Figma shows padding 0 on the container, meaning name/description/species text sits flush to the card edge. Is this intentional (an editorial style), or should there be horizontal padding (e.g., `var(--space-4)` = 16px) on the text elements? Confirm with design before writing tests for padding values.

5. **EditorialCard image dimensions:** Figma specifies `ratio="16-9"` with a fixed 247px × 64px container. A true 16:9 ratio at 247px wide produces ~139px height, not 64px. Is 64px the intended fixed height (clipping the image to a banner/logo-style strip), or is the `16-9` label a Figma error and the container's natural ratio is `247/64 ≈ 3.86:1`? The spec currently implements fixed 247×64 with `overflow: hidden`. Confirm with design before implementation.

6. **Fact element semantics:** Should `<Fact>` use `<dl>`/`<dt>`/`<dd>` for accessible definition-list markup (value as term, label as description or vice versa), or is a plain `<div>` with two `<p>` children sufficient? The decision is out of scope for now but should be confirmed before this component is reused in a page context.

7. **ExpeditionCard ⓘ accessibility label language:** The spec uses `aria-label="Открыть превью"`. Confirm this is the correct Russian copy, or provide the approved string from content.
