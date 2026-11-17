# Spec: Header Component

Figma file: `UPCl1IDlaoQ3lmPoKafETU`
Figma nodes:
- `1957-6670` — Desktop, unauthenticated
- `1957-6696` — Desktop, authenticated (not on `/profile`)
- `1957-6683` — Desktop, authenticated + on `/profile`
- `1863-4343` — Mobile menu (open state)
- `1697-1875` — Full page context

---

## What to build

Replace the stub in `components/Header.tsx` with a fully functional, mobile-first header.

### Files

| File | Action |
|---|---|
| `components/Header.tsx` | Replace stub |
| `components/Header.module.css` | Create |

---

## Visual design

### Desktop (≥ 1248px)

Height: `--size-control-header-desktop` (80px).

Full-width band with background `--color-background` (`#fffff8`). Content fills the width with `padding-inline: --page-gutter` (96px at desktop). Horizontal flex row, logo on left, navigation on right, all items vertically centred.

```
[ Logo (256×36)          Прогулки  Экспедиции  Частные  Книга  О проекте  [CTA] ]
```

**Nav items** (Прогулки … О проекте):
- Font: 16px / 500 / Manrope (`--color-foreground`)
- Gap between nav items: 32px (`--space-6`)
- Gap between nav group and CTA: 24px (`--space-5`)

**CTA item** (rightmost — context-dependent):
- Font: same 16px / 500, but colour `--color-primary` (`#3f4fa6`)
- Three states — see "CTA logic" below

### Mobile (< 1248px)

Two states: **closed** (slim bar) and **open** (full-screen overlay).

#### Closed state

Height: `--size-control-header-mobile` (64px).
Full-width, `padding-inline: --page-gutter` (16px at mobile), background `--color-background`.

```
[ Logo (256×36)                              [☰] ]
```

Hamburger button: `--size-control-icon` (24px × 24px), two horizontal bars (`--color-foreground`), `aria-label="Открыть меню"`.

#### Open state (full-screen overlay)

Covers the viewport 100% width × 100% height. Background `--color-background`. `position: fixed`, `inset: 0`, `z-index: 100`.

```
[ Logo (256×36)                              [×] ]

         Прогулки
        Экспедиции
          Частные
           Книга
        О проекте
           Войти
```

- Header row: 64px height, padding-inline `--page-gutter`, logo left / close button right
- Close button: same 24×24, `aria-label="Закрыть меню"`, two diagonal bars forming ×
- Nav items stacked, centred, `font-size: 16px / 500`, `--color-foreground`, gap 16px (`--space-4`)
- CTA item: same as nav items but `--color-primary`
- Clicking any link or CTA closes the overlay

---

## CTA logic

| Condition | Label | Action |
|---|---|---|
| `status === 'unauthenticated'` | `Войти` | `<Link href="/login">` |
| `status === 'authenticated'` AND `pathname !== '/profile'` | `Личный кабинет` | `<Link href="/profile">` |
| `status === 'authenticated'` AND `pathname === '/profile'` | `Выйти` | `<button onClick={() => signOut({ redirectTo: '/' })}>` |

`status === 'loading'` — render nothing in the CTA slot (no layout shift or flash of wrong state).

---

## Navigation routes

| Label | href |
|---|---|
| Прогулки | `/walks` |
| Экспедиции | `/expeditions` |
| Частные | `/private-events` |
| Книга | `/book` |
| О проекте | `/about`|

---

## Implementation notes

- `'use client'` is required — uses `useSession()`, `usePathname()`, and `useState` for the mobile overlay.
- Import `useSession` from `next-auth/react`.
- Import `signOut` from `next-auth/react`.
- Import `usePathname` from `next/navigation`.
- Import `Logo` from `@/components/ui/logo/Logo`.
- No `useRouter` or imperative navigation — links use `<Link>` from `next/link`.
- Mobile overlay: `overflow: hidden` on `<body>` when open to prevent background scroll. Use `useEffect` to toggle a class on `document.body`.
- The header is **not sticky** (static position). No sticky/fixed behaviour on scroll for the main bar.
- Logo stays constant across all auth states and viewports.
- No label constants file needed — nav link text is English-adjacent proper nouns, inline is fine. CTA labels are few enough to inline too.

---

## Success criteria

- [ ] `pnpm test:run` passes (no existing tests broken, new tests pass).
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes.

### Desktop rendering (≥ 1248px)

- [ ] Header renders `<header>` containing the `Logo` component.
- [ ] Five nav links render with correct `href` values: `/walks`, `/expeditions`, `/private-events`, `/#book`, `/#about`.
- [ ] When `status === 'unauthenticated'`, a link `Войти` with `href="/login"` is present.
- [ ] When `status === 'authenticated'` and `pathname !== '/profile'`, a link `Личный кабинет` with `href="/profile"` is present; no `Войти` link.
- [ ] When `status === 'authenticated'` and `pathname === '/profile'`, a button `Выйти` is present; no `Личный кабинет` link.
- [ ] When `status === 'loading'`, no CTA link/button renders.

### Mobile rendering

- [ ] At mobile viewport width the hamburger button is present and has `aria-label="Открыть меню"`.
- [ ] Clicking the hamburger button renders the overlay with all five nav links and the CTA.
- [ ] Close button inside overlay has `aria-label="Закрыть меню"`.
- [ ] Clicking the close button removes the overlay.
- [ ] Clicking any nav link inside the overlay closes the overlay.
- [ ] While the overlay is open, `document.body` has a class that prevents scroll (verified via `classList`).

### Edge cases

- [ ] When overlay is open, pressing Escape closes it.
- [ ] Navigating to a new route (simulated via `usePathname` change) closes the overlay.

---

## Test file

`__tests__/components/Header.test.tsx`

Use Testing Library + `vi.mock('next-auth/react')` + `vi.mock('next/navigation')`.

Render the `Header` component with `MemoryRouter` equivalent — mock `usePathname` to return a path, mock `useSession` to return the desired auth state.
