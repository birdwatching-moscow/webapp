# Spec: UI Primitives

**Goal:** Implement five design-system primitives (Button, Input, Logo, ImagePlaceholder, Dropdown) that faithfully match the Figma contract at `1697:194` and are fully token-driven, accessible, and test-covered.

---

## 1. Button

### What to build

Refactor `components/ui/buttons/Button.tsx` and implement `components/ui/buttons/Button.module.css` to match the Figma component set (`1697:196`).

**Breaking changes from the existing skeleton:**

| Old | New | Reason |
|-----|-----|--------|
| `variant: 'primary'` | `variant: 'default'` | Figma name is `default` |
| `variant: 'danger'` | removed | Not in Figma; out of scope |
| `size: 'md'` | `size: 'default'` | Figma name is `default` |
| `size: 'lg'` | removed | Not in Figma; out of scope |

Any existing call sites using `variant="primary"`, `size="md"`, or `size="lg"` must be updated.

### Props interface

```ts
type ButtonVariant = 'default' | 'secondary' | 'ghost';
type ButtonSize    = 'default' | 'sm';

type BaseProps = {
  variant?:   ButtonVariant;   // default: 'default'
  size?:      ButtonSize;      // default: 'default'
  loading?:   boolean;         // default: false
  disabled?:  boolean;
  className?: string;
  children:   React.ReactNode;
};

type AsButton = BaseProps & { as?: 'button' } & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AsLink   = BaseProps & { as: 'a'; href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export type ButtonProps = AsButton | AsLink;
```

### Variants and sizes

| Variant | Background | Border | Text color | Horizontal padding |
|---------|-----------|--------|------------|-------------------|
| `default` | `--color-primary` | none | `--color-primary-foreground` | `--space-5` (24px) |
| `secondary` | transparent | `--stroke-default` solid `--color-primary` | `--color-primary` | `--space-5` (24px) |
| `ghost` | transparent | none | `--color-primary` | 0 |

| Size | Height token | Height value |
|------|-------------|-------------|
| `default` | `--size-control-default` | 44px |
| `sm` | `--size-control-sm` | 36px |

Constraints:
- `ghost` is always `sm` height regardless of the `size` prop. The CSS rule for `.ghost` overrides height to `--size-control-sm`. Document this in a code comment.
- Note: `figma.md` lists Button default size as 64px. The authoritative value is `--size-control-default` = 44px from `globals.css`. The figma.md entry is considered a documentation error; spec follows the token.

### States

- **hover** (`:hover`): `default` variant uses `--color-primary-hover` background; `secondary` and `ghost` use `--color-primary` at reduced opacity (implementation detail — match Figma hover visuals).
- **disabled** (`disabled` attribute or `loading=true`): opacity `--opacity-disabled`; cursor `not-allowed`; pointer events none.
- **loading** (`loading=true`): sets `disabled` attribute on `<button>` and `aria-disabled` on `<Link>`; sets `aria-busy="true"`.
- **focus-visible** (`:focus-visible`): `--stroke-focus` outline in `--color-primary`; outline-offset 2px. No focus ring on mouse click (`:focus:not(:focus-visible)`).

### Accessibility

- `<button>` renders native `disabled` attribute when disabled or loading.
- `<Link>` (when `as="a"`) uses `aria-disabled="true"` instead (anchors have no native disabled).
- `aria-busy="true"` on the root element when `loading=true`.
- Focus ring uses `:focus-visible`, not `:focus`.
- Color contrast must meet WCAG AA (3:1 minimum for large text, 4.5:1 for normal). `--color-primary` on `--color-primary-foreground` (and vice versa) must be verified against token values.

### CSS tokens used

`--color-primary`, `--color-primary-foreground`, `--color-primary-hover`, `--radius-lg`, `--stroke-focus`, `--stroke-default`, `--size-control-default`, `--size-control-sm`, `--opacity-disabled`, `--space-5`

### Success criteria

- [ ] `<Button>` renders a `<button>` element by default.
- [ ] `<Button as="a" href="/path">` renders a Next.js `<Link>` element.
- [ ] `variant="default"` applies `--color-primary` background and `--color-primary-foreground` text color via CSS class.
- [ ] `variant="secondary"` applies transparent background, `--color-primary` border, and `--color-primary-foreground`... wait — actually `--color-primary` text (not foreground) per Figma.
- [ ] `variant="ghost"` applies no background, no border, and no horizontal padding.
- [ ] `size="default"` results in a computed height of 44px (matches `--size-control-default`).
- [ ] `size="sm"` results in a computed height of 36px (matches `--size-control-sm`).
- [ ] `variant="ghost"` always has height 36px even when `size="default"` is explicitly passed.
- [ ] `disabled={true}` sets the `disabled` attribute on `<button>` and reduces opacity to 0.5.
- [ ] `loading={true}` sets `disabled` on `<button>`, sets `aria-busy="true"`, and reduces opacity to 0.5.
- [ ] `:focus-visible` outline is visible and uses `--color-primary` color; `:focus:not(:focus-visible)` has no outline.
- [ ] `className` prop is appended to the root element's class list.
- [ ] TypeScript: passing `variant="primary"` causes a type error (old name no longer valid).
- [ ] TypeScript: passing `variant="danger"` causes a type error.

### Edge cases

- `ghost` with `size="default"`: height is clamped to 36px by the ghost CSS rule.
- `loading` and `disabled` simultaneously: both are treated as disabled; no duplicate aria attributes.
- Empty `children` (e.g., icon-only button): no layout break; `aria-label` should be provided by the caller — spec does not enforce this in the component itself.
- Very long label text: button grows in width; height stays fixed.

### Error cases

- `as="a"` without `href`: TypeScript type error at compile time (enforced by discriminated union).

---

## 2. Input

### What to build

Create `components/ui/input/Input.tsx` and `components/ui/input/Input.module.css`. No `'use client'` directive — the component is pure markup. It is used only inside Client Component trees (the caller owns state).

### Props interface

```ts
export type InputProps = {
  id?:          string;
  name?:        string;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?:       string;
  error?:       string;
  disabled?:    boolean;
  type?:        'text' | 'email' | 'tel' | 'password';
  className?:   string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'id' | 'name' | 'disabled' | 'placeholder' | 'className'
>;
```

### States

| State | Trigger | Border | Outline |
|-------|---------|--------|---------|
| default | none | `--stroke-default` solid `--color-input-border` | none |
| focus | `:focus` on `<input>` | `--stroke-focus` solid `--color-primary` | none (border change communicates focus) |
| error | `error` prop is a non-empty string | `--stroke-default` solid `--color-error` | none |
| disabled | `disabled={true}` | unchanged | none; opacity `--opacity-disabled` |

Error + focus simultaneously: error border takes precedence (error is more important to communicate).

### Layout

- Wrapper `<div>` contains: optional `<label>`, `<input>`, optional error `<p>`.
- Input is full-width (`width: 100%`) within its container.
- Height: `--size-control-input` (48px).
- Border radius: `--radius-lg`.
- Horizontal padding: `--space-4` (16px).
- Placeholder text color: `--color-muted-foreground`.
- Label text: `text-label` typography class; color `--color-foreground`.
- Error message text: `text-label` typography class (14px/16px); color `--color-error`; `role="alert"` so screen readers announce it on appearance.

### Accessibility

- When `label` and `id` are both provided, `<label htmlFor={id}>` associates with the input.
- `aria-invalid="true"` on `<input>` when `error` is a non-empty string.
- `aria-describedby` on `<input>` pointing to the error element's `id` when error is present.
- `disabled` sets native `disabled` attribute on `<input>`.

### CSS tokens used

`--color-border`, `--color-input-border`, `--color-error`, `--color-foreground`, `--color-muted-foreground`, `--radius-lg`, `--stroke-default`, `--stroke-focus`, `--size-control-input`, `--opacity-disabled`, `--space-4`

### Success criteria

- [ ] Renders an `<input>` element; `value` prop is reflected as the input's value attribute in the DOM.
- [ ] `onChange` is called with the change event when the input value changes.
- [ ] Default state: input border is `2px solid` using `--color-input-border`.
- [ ] When `error` is a non-empty string: input border switches to `--color-error`; an error message element appears below the input containing the error text.
- [ ] When `error` is a non-empty string: input has `aria-invalid="true"`.
- [ ] When `error` prop is `undefined` or `""`: no error element is rendered; `aria-invalid` is absent or `"false"`.
- [ ] Error message element has `role="alert"`.
- [ ] Input height is 48px (matches `--size-control-input`).
- [ ] Input width is 100% of its container (fills parent).
- [ ] When `label` and `id` are both provided, a `<label>` is rendered with `htmlFor` equal to `id`.
- [ ] `placeholder` text is rendered by the browser; its CSS color is `--color-muted-foreground`.
- [ ] `disabled={true}` sets the native `disabled` attribute on the `<input>`.
- [ ] TypeScript: `value` and `onChange` are required; omitting either causes a type error.

### Edge cases

- `error=""` (empty string): treated as no error — no error element, no `aria-invalid`.
- No `id` provided: `<label>` is not rendered even if `label` prop is passed (avoids orphaned label).
- `type="password"`: browser masks the input; no custom handling needed.
- Very long error message: wraps to multiple lines; input width is unaffected.
- `disabled` and `error` simultaneously: disabled styling takes visual precedence; `aria-invalid` is still set if error is non-empty.

### Error cases

- No explicit error cases beyond prop validation covered above.

---

## 3. Logo

### What to build

Create `components/ui/logo/Logo.tsx`. No `'use client'` directive. No CSS module needed unless sizing utility classes are required.

### Props interface

```ts
export type LogoProps = {
  className?: string;
};
```

### What it renders

- A single inline `<svg>` element containing the "Birdwatching Moscow" logotype exactly as in Figma node `1697:261`.
- `role="img"` on the `<svg>`.
- `aria-label="Birdwatching Moscow"` on the `<svg>`.
- No interactive states, no variants, no size variants.
- `currentColor` used for fill where the design uses the foreground/primary color, so the logo inherits its container's text color.

### CSS tokens used

None required — the SVG uses `currentColor` or hard-coded brand colors. If the logotype uses a fixed brand color, that color is embedded in the SVG (it is a known, intentional raw color per design.md rules for the logo).

### Success criteria

- [ ] Renders an `<svg>` element (not an `<img>` or `<Image>`).
- [ ] The `<svg>` has `role="img"` and `aria-label="Birdwatching Moscow"`.
- [ ] `className` prop is forwarded to the `<svg>` element.
- [ ] No `'use client'` directive in the file.
- [ ] Renders without any props (all props optional).

### Edge cases

- Logo must not break layout when placed in a flex/grid container — ensure the SVG has explicit `width` and `height` attributes or uses `viewBox` only with CSS sizing.

### Error cases

- None specific to this component.

---

## 4. ImagePlaceholder

### What to build

Create `components/ui/image-placeholder/ImagePlaceholder.tsx` and `components/ui/image-placeholder/ImagePlaceholder.module.css`. No `'use client'` directive.

### Props interface

```ts
export type AspectRatio = '16-9' | '4-3' | '1-1' | '9-16';

export type ImagePlaceholderProps = {
  ratio:      AspectRatio;
  src?:       string;
  alt:        string;
  className?: string;
};
```

### Behavior

- **No `src`**: renders a `<div>` with a grey background (`#d9d9d9` — this is the intentional technical stub color per `design.md`; no CSS token exists for it). No `<img>` or `<Image>` is rendered.
- **With `src`**: renders a `<div>` containing a `next/image` with `fill` layout. The wrapper `<div>` must have `position: relative` and `overflow: hidden`.
- In both cases the wrapper enforces the aspect ratio via the CSS `aspect-ratio` property.
- `alt` is always forwarded to `<Image>` when `src` is provided; when no `src`, the wrapper has `aria-label={alt}` and `role="img"` so the placeholder is described for screen readers.

### Aspect ratios

| Prop value | CSS `aspect-ratio` |
|------------|--------------------|
| `'16-9'`   | `16 / 9`           |
| `'4-3'`    | `4 / 3`            |
| `'1-1'`    | `1 / 1`            |
| `'9-16'`   | `9 / 16`           |

### CSS tokens used

`--radius-lg` (applied to the wrapper). The placeholder background color `#d9d9d9` is a raw value (no token).

### Success criteria

- [ ] When `src` is not provided, no `<img>` or `next/image` is rendered; the wrapper has a grey background.
- [ ] When `src` is provided, a `next/image` is rendered inside the wrapper with `fill` and the `alt` prop.
- [ ] `ratio="16-9"` produces a container whose width-to-height ratio is 16:9 (within 1px tolerance).
- [ ] `ratio="4-3"` produces a 4:3 container.
- [ ] `ratio="1-1"` produces a 1:1 container.
- [ ] `ratio="9-16"` produces a 9:16 container.
- [ ] The wrapper has `position: relative` and `overflow: hidden` when `src` is provided.
- [ ] When no `src`, wrapper has `role="img"` and `aria-label` equal to the `alt` prop.
- [ ] `alt` is a required prop — omitting it causes a TypeScript error.
- [ ] `className` is forwarded to the wrapper element.

### Edge cases

- `src` changes from `undefined` to a URL at runtime: React re-renders; the `next/image` appears. No special handling needed.
- Empty string `alt=""`: valid (decorative image); allowed by the type.
- Very tall container with `9-16` ratio: no overflow or layout issues.

### Error cases

- `next/image` requires the domain to be in `next.config`; that is the caller's responsibility, not this component's.

---

## 5. Dropdown

### What to build

Create `components/ui/dropdown/Dropdown.tsx` and `components/ui/dropdown/Dropdown.module.css`. Requires `'use client'` (open/close state, outside-click ref, keyboard handler).

### Props interface

```ts
export type DropdownOption = {
  label: string;
  value: number;
};

export type DropdownProps = {
  value:     number;
  onChange:  (value: number) => void;
  options:   DropdownOption[];
  disabled?: boolean;
  label?:    string;   // accessible label for the control; rendered as visually-hidden or visible <label>
};
```

### States

| State | Trigger | Visual |
|-------|---------|--------|
| closed | default | trigger button shows selected label + chevron pointing down |
| open | trigger click | options list appears below trigger; chevron rotates 180° |
| disabled | `disabled={true}` | trigger is non-interactive; opacity `--opacity-disabled`; `aria-disabled="true"` |

### Behavior

- Clicking the trigger toggles open/closed.
- Clicking an option: calls `onChange(option.value)`, closes the list.
- Pressing **Escape** while open: closes the list, returns focus to trigger.
- Clicking outside the component: closes the list.
- `disabled` prevents opening; clicking or keyboard navigation has no effect.
- Selected option: the option matching `value` may receive a visual indicator (bold or checkmark — implementation detail, not specified in Figma; implement as a CSS class on the active `<li>`).
- If `value` does not match any option, trigger label shows an empty/fallback string (e.g., `"–"`).

### Layout

- Trigger: full-width button, height `--size-control-input` (48px), border `--stroke-default` solid `--color-border`, border radius `--radius-lg`.
- Chevron icon: `--size-control-icon` (24px), positioned right; animates `transform: rotate(180deg)` when open (CSS transition on `transform` only — no layout properties).
- Options list: `position: absolute`, full-width of trigger, `z-index` sufficient to layer over sibling content, border `--stroke-default` solid `--color-border`, border radius `--radius-lg`, `background: --color-background`.
- Each option: `min-height --size-control-sm` (36px), horizontal padding `--space-4` (16px).

### Accessibility

- Trigger `<button>` has `aria-haspopup="listbox"` and `aria-expanded="true"/"false"`.
- Options list is a `<ul role="listbox">`.
- Each option is `<li role="option">` with `aria-selected="true"` for the current value.
- If `label` prop provided: associate via `aria-labelledby` or render a `<label>` with `htmlFor` pointing to the trigger's `id`.
- Escape key closes and returns focus to trigger (`triggerRef.current?.focus()`).
- Outside-click uses `useRef` + `mousedown` listener on `document`.

### CSS tokens used

`--color-border`, `--color-foreground`, `--color-background`, `--radius-lg`, `--size-control-input`, `--size-control-sm`, `--size-control-icon`, `--stroke-default`, `--opacity-disabled`, `--space-4`

### Success criteria

- [ ] Trigger button renders with the label of the currently selected option (matched by `value`).
- [ ] Clicking the trigger sets open state to `true`; the options list becomes visible.
- [ ] Clicking the trigger again while open sets open state to `false`; the options list is hidden.
- [ ] Clicking an option calls `onChange` with that option's `value` and closes the list.
- [ ] Pressing Escape while open closes the list.
- [ ] Clicking outside the Dropdown component while open closes the list.
- [ ] Trigger has `aria-expanded="false"` when closed and `aria-expanded="true"` when open.
- [ ] Options list has `role="listbox"`; each option element has `role="option"`.
- [ ] The option matching the current `value` has `aria-selected="true"`; all others have `aria-selected="false"`.
- [ ] `disabled={true}` prevents the list from opening; trigger has `aria-disabled="true"`; opacity is `--opacity-disabled`.
- [ ] Chevron applies a CSS class that rotates it 180° when open; no rotation when closed. The CSS transition is on `transform` only.
- [ ] TypeScript: `value`, `onChange`, and `options` are required; omitting any causes a type error.

### Edge cases

- `options` is an empty array: trigger renders with fallback label `"–"`; opening shows an empty list. No crash.
- `value` does not match any option: trigger shows fallback label `"–"`.
- `options` list is longer than the viewport: the list must have `overflow-y: auto` and a `max-height` (implementation detail — suggest `max-height: 240px`).
- Rapid open/close clicks: no state inconsistency; each click toggles correctly.
- Component unmounts while open: `useEffect` cleanup removes the `mousedown` document listener to prevent memory leaks.

### Error cases

- `onChange` receiving a `value` not in `options`: no crash; the next render resolves via the matched-or-fallback label logic.

---

## Edge cases (cross-cutting)

- All components: `className` prop is forwarded without overriding internal CSS module classes (concatenate, not replace).
- All components: no inline styles anywhere — only CSS module classes and global token variables.
- Mobile-first: all components' base styles target mobile viewports; no `max-width` media query overrides.

## Error cases (cross-cutting)

- TypeScript strict mode: no `any`, no non-null assertions (`!`) without a documented reason.

## Out of scope

- `Button`: `variant="danger"`, `size="lg"`, `size="md"` — not in Figma; not implemented.
- `Button`: icon slot (leading/trailing icon) — not in current Figma spec.
- `Input`: textarea, select, checkbox, radio — different components.
- `Input`: async validation or debouncing — caller's responsibility.
- `Logo`: responsive size variants — one size; caller scales via CSS.
- `ImagePlaceholder`: loading skeleton/shimmer animation — deferred.
- `ImagePlaceholder`: `next/image` `sizes` optimisation — caller's responsibility.
- `Dropdown`: multi-select — not in Figma.
- `Dropdown`: search/filter inside dropdown — not in Figma.
- `Dropdown`: keyboard arrow-key navigation through options — deferred (Escape only is minimum viable).
- All: dark mode / additional color scheme tokens — not in current Figma scope.
- All: Storybook stories — deferred.

## Technical notes

**Files to create:**
- `components/ui/input/Input.tsx`
- `components/ui/input/Input.module.css`
- `components/ui/logo/Logo.tsx`
- `components/ui/image-placeholder/ImagePlaceholder.tsx`
- `components/ui/image-placeholder/ImagePlaceholder.module.css`
- `components/ui/dropdown/Dropdown.tsx`
- `components/ui/dropdown/Dropdown.module.css`

**Files to modify:**
- `components/ui/buttons/Button.tsx` — rename variants/sizes, update types
- `components/ui/buttons/Button.module.css` — implement all variant/size/state styles

**Files likely requiring call-site updates after Button rename:**
- Any file importing `Button` and passing `variant="primary"`, `size="md"`, or `size="lg"` — search codebase before implementation.

**Constraints:**
- `next/image` requires `fill` prop + `position: relative` parent for ratio-constrained containers; do not use `width`/`height` number props on ImagePlaceholder.
- Dropdown outside-click: use `mousedown` not `click` to avoid race with the trigger's own click handler.
- CSS transitions: animate `transform` and `opacity` only; never `height`, `width`, `top`, or `display`.
- No `'use client'` on Button (keep existing), Input, Logo, ImagePlaceholder — `'use client'` only on Dropdown.

**Dependencies:**
- `next/image` (already available via Next.js 16)
- No new npm packages required

**Testing:**
- Tests live in `__tests__/components/ui/`
- Use Vitest + Testing Library
- Each success criterion maps to at least one test
- Run `pnpm test:run` before marking complete

## Resolved questions

1. **Button ghost/secondary hover**: border color `#33418C` (`--color-primary-hover`). Secondary: border-color changes to `--color-primary-hover`. Ghost: a border in `--color-primary-hover` appears on hover.
2. **Logo SVG**: confirmed — inline SVG, fill uses `currentColor` (original is `#26241F` = `--color-foreground`).
3. **Dropdown value type**: `number` only — used exclusively for ticket quantity.
4. **Input focus ring**: border-color change matches Figma; add a transparent forced-colors-aware outline for high-contrast mode accessibility.
