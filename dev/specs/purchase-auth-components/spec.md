# Spec: Purchase & Auth Components

**Goal:** Implement `AuthFlow`, `PurchaseSummary`, and `NoticeBanner` React components from Figma section `Purchase & Auth` (`1697:787`) that wire to the existing OTP auth and ЮKassa payment APIs.

---

## What to build

### 1. `AuthFlow` — `components/auth/AuthFlow.tsx` + `AuthFlow.module.css`

A controlled client component (`'use client'`) covering all auth screens in both standalone and checkout-embedded contexts.

**Props:**

```ts
type AuthFlowStep = 'sign-in' | 'sign-up' | 'otp';
type AuthFlowContext = 'purchase' | 'screen';

type AuthFlowProps = {
  flow: AuthFlowStep;
  context: AuthFlowContext;
  email?: string;        // required when flow='otp'; carries email from the previous step
  onFlowChange: (step: AuthFlowStep, email: string) => void;
  onSuccess: () => void; // called after signIn resolves without error
};
```

**Step rendering rules:**

| `flow` | Inputs rendered | Labels source |
|--------|----------------|---------------|
| `'sign-in'` | Email `<Input>` | `AUTH_LABELS.loginCode` |
| `'sign-up'` | Name `<Input>` + Email `<Input>` | `AUTH_LABELS.register` |
| `'otp'` | Code `<Input>` (`maxLength=6`, `inputMode="text"`, `autoComplete="one-time-code"`) + masked `email` prop display | `AUTH_LABELS.loginCode` / `AUTH_LABELS.register` |

**OTP internal sub-states** (managed inside the component when `flow='otp'`):

| Sub-state | Trigger | UI effect |
|-----------|---------|-----------|
| `idle` | Initial render | No error shown |
| `wrong` | `signIn` returns `{ error: 'CredentialsSignin' }` | `AUTH_ERRORS.invalidCode` shown below the input |
| `limit` | 5 consecutive wrong submissions (tracked locally) | Code `<Input disabled>`, limit-reached message shown, resend not offered |
| `loading` | API call in flight | Submit `<Button loading>`, inputs `disabled` |

Note: "code expired" surfaces as `wrong` — the server returns the same `CredentialsSignin` error for expired, used, and wrong codes (per passwordless-otp spec). The component does not distinguish them.

**API wiring** (all calls via `lib/api/auth.ts` Axios wrapper — new file):

| Step | User action | API call(s) | On success |
|------|-------------|-------------|------------|
| `sign-in` | Submit email | `POST /api/auth/request-login-code { email }` | `onFlowChange('otp', email)` |
| `sign-up` | Submit name + email | `POST /api/auth/register { name, email }` then `POST /api/auth/request-login-code { email }` | `onFlowChange('otp', email)` |
| `otp` | Submit code | `signIn('login-code', { email, code, redirect: false })` | `onSuccess()` |
| `otp` | Click resend | `POST /api/auth/request-login-code { email }` | Sub-state resets to `idle`; attempt counter resets to 0 |
| `otp` | Click back / change email | — (no API call) | `onFlowChange('sign-in', email)` |

**Context layout rules:**

| `context` | Card layout | Close / dismiss |
|-----------|------------|-----------------|
| `'screen'` | Standalone full-width card, centred on the page | Not applicable; no overlay |
| `'purchase'` | Embedded in checkout; same card dimensions | No close button, no Escape dismiss, no backdrop click to dismiss |

**Card dimensions (CSS):**

- Mobile (base): card width 358px; content width 310px (24px horizontal padding each side)
- Desktop (`min-width: 1248px`): card width 454px; content width 406px (`--size-col-3`), 24px padding

---

### 2. `PurchaseSummary` — `components/purchase/PurchaseSummary.tsx` + `PurchaseSummary.module.css`

Display-only Server Component (no `'use client'`). Renders a single-walk order summary.

**Props:**

```ts
type PurchaseSummaryProps = {
  walkTitle: string;
  walkDate: Date;
  walkLocation: string;
  quantity: number;          // ≥ 1; from OrderItem.quantity
  unitPriceKopecks: number;  // ≥ 0; from OrderItem.unitPriceKopecks
  className?: string;
};
```

**Rendering rules:**

| Field | Element / class | Format |
|-------|----------------|--------|
| Walk title | `text-h3` typography class | Verbatim string |
| Date | `text-body` | `'d MMMM, HH:mm'` in `ru-RU` locale, Europe/Moscow timezone (e.g. "12 марта, 09:00") |
| Location | `text-body` | Verbatim string |
| Quantity | `text-body` | Russian pluralisation: "1 билет", "2 билета", "5 билетов" |
| Unit price | `text-body` | `formatKopecksRu(unitPriceKopecks)` (see Technical notes) |
| Total price | `text-body-l` | `formatKopecksRu(quantity × unitPriceKopecks)` — integer arithmetic only |

No `<button>`, `<a>`, `<input>`, or `<form>` elements. The card obeys the same 454px / 358px dimensions as AuthFlow.

---

### 3. `NoticeBanner` — `components/purchase/NoticeBanner.tsx` + `NoticeBanner.module.css`

A Server Component (no `'use client'`). Actions are injected via a React node slot so the component owns no event handlers.

**Props:**

```ts
type NoticeBannerState =
  | 'SoldOut' | 'Checking' | 'Canceled'
  | 'WidgetFirst' | 'WidgetRepeated' | 'Unavailable'
  | 'Declined' | 'Expired' | 'CheckingStopped';

type NoticeBannerProps = {
  state: NoticeBannerState;
  action?: React.ReactNode; // omit for checkout-embedded contexts
  className?: string;
};
```

**State → visual variant:**

| States | Variant | Border |
|--------|---------|--------|
| `SoldOut`, `Checking`, `Canceled` | neutral | `--stroke-default` solid `--color-border` |
| `WidgetFirst`, `WidgetRepeated`, `Unavailable`, `Declined`, `Expired`, `CheckingStopped` | error | `--stroke-default` (2px) solid `--color-error` |

Message text per state: **see Open Questions #1** — copy must be confirmed from Figma before writing test assertions for message content.

**Layout (mobile-first):**

- Base (mobile): `flex-direction: column`; padding `--space-4` (16px); `action` node renders full-width (100%)
- Desktop (`min-width: 720px`): `flex-direction: row`; padding `--space-6` (32px); `max-width: var(--size-text-max)` (720px); `action` node renders at its own `min-content` width
- Border-radius: `--radius-lg`

---

## Success criteria

### AuthFlow

- [ ] `flow='sign-in'` renders an email `<Input>` and a submit `<Button>`; no name input and no code input are present in the DOM
- [ ] `flow='sign-up'` renders a name `<Input>`, an email `<Input>`, and a submit `<Button>`; no code input is present
- [ ] `flow='otp'` renders a code `<Input>` with `maxLength=6`, `inputMode="text"`, `autoComplete="one-time-code"`; the `email` prop value appears somewhere in the rendered output
- [ ] `flow='otp'` code input has no `disabled` attribute on initial render (idle sub-state)
- [ ] `context='purchase'` renders no element with a close or dismiss role (no button labelled "Закрыть" or equivalent)
- [ ] Submitting the sign-in email form calls `POST /api/auth/request-login-code` exactly once with body `{ email }`; on a 200 response `onFlowChange` is called with `('otp', email)`
- [ ] Submitting the sign-up form calls `POST /api/auth/register` with `{ name, email }` then `POST /api/auth/request-login-code` with `{ email }`; `onFlowChange('otp', email)` is called after both return successfully
- [ ] `POST /api/auth/register` returning 409 (email taken) displays `AUTH_ERRORS.emailTaken` and does not call `onFlowChange`
- [ ] Submitting the OTP code calls `signIn('login-code', { email, code, redirect: false })` with the `email` from the `email` prop
- [ ] `signIn` resolving without error calls `onSuccess()` exactly once
- [ ] `signIn` returning `{ error: 'CredentialsSignin' }` renders text equal to `AUTH_ERRORS.invalidCode`; `onSuccess` is not called
- [ ] After 5 consecutive wrong-code submissions, the code `<Input>` has `disabled={true}` and `AUTH_ERRORS.invalidCode` is no longer the sole error message (a distinct limit-reached message is shown instead)
- [ ] After the 5th failure the resend button is not rendered (or is absent)
- [ ] Clicking the resend button calls `POST /api/auth/request-login-code` once with the current email; on 200 the `AUTH_ERRORS.invalidCode` error text is no longer present
- [ ] Clicking the back/change-email control calls `onFlowChange('sign-in', email)` without making any API call
- [ ] While any API call is in flight the submit `<Button>` has `loading={true}`; the email or code `<Input>` has `disabled={true}`
- [ ] `pnpm typecheck` passes (no type errors in AuthFlow or its call sites)

### PurchaseSummary

- [ ] Renders `walkTitle` in an element with the `text-h3` CSS class
- [ ] Renders the formatted date for a UTC `Date` corresponding to "2025-03-12T06:00:00Z" (09:00 MSK) as "12 марта, 09:00"
- [ ] Renders `walkLocation` somewhere in the output
- [ ] `quantity=1` renders text containing "1 билет" (singular); `quantity=2` renders "2 билета"; `quantity=5` renders "5 билетов"
- [ ] `unitPriceKopecks=75000` renders "750,00 ₽" (Russian decimal comma, no float arithmetic)
- [ ] Total price for `quantity=2, unitPriceKopecks=75000` renders "1 500,00 ₽" (integer multiply: 150 000 kopecks)
- [ ] `unitPriceKopecks=0` renders "0,00 ₽" for unit price and "0,00 ₽" for total; no exception
- [ ] No `<button>`, `<a>`, `<input>`, or `<form>` elements are present in the rendered output
- [ ] No `'use client'` directive in the file (enforced by `pnpm build` not erroring on server-side import of this component from a Server Component tree)
- [ ] `pnpm typecheck` passes

### NoticeBanner

- [ ] States `SoldOut`, `Checking`, `Canceled` render without the error CSS class; computed border-color is not `--color-error`
- [ ] States `WidgetFirst`, `WidgetRepeated`, `Unavailable`, `Declined`, `Expired`, `CheckingStopped` render with the error CSS class; the root element's inline or module CSS applies a `--color-error` border
- [ ] When `action` is `undefined`, no extra child beyond the message is rendered
- [ ] When `action` is a `<button>` node, that button appears in the rendered output
- [ ] Base CSS (mobile) has `flex-direction: column` on the root element and `padding: 16px` (verified via CSS module class)
- [ ] Desktop CSS (`min-width: 720px`) has `flex-direction: row`, `padding: 32px`, `max-width: 720px`
- [ ] `className` prop value appears in the root element's `className` string
- [ ] No `'use client'` directive in the file
- [ ] `pnpm typecheck` passes

---

## Edge cases

- **AuthFlow `flow='otp'` without `email` prop**: The `email` prop is typed as `string | undefined`; when undefined and `flow='otp'`, the component renders an empty placeholder for the masked email. TypeScript does not enforce `email` as required specifically for `flow='otp'` (discriminated union is an implementation option — see Open Questions #5).
- **AuthFlow sign-in with an unknown email**: The API always returns 200 (enumeration protection, per OTP spec). `onFlowChange('otp', email)` is called as normal. The user reaches the OTP screen but no code arrives.
- **AuthFlow sign-up with an email that already exists**: `POST /api/auth/register` returns 409. `AUTH_ERRORS.emailTaken` is displayed on the form. `onFlowChange` is not called.
- **AuthFlow sign-up: register succeeds but `request-login-code` fails**: An error message is shown and the user stays on the sign-up step. `onFlowChange` is not called.
- **AuthFlow resend while a request is in flight**: The resend button renders with `disabled` or `aria-disabled` during loading; a second tap cannot trigger a duplicate request.
- **AuthFlow OTP sub-state persists across re-renders**: If the parent re-renders without changing `flow`, the internal sub-state (wrong/limit) is preserved. Only a `flow` prop change resets it.
- **PurchaseSummary `quantity=1` pluralisation**: Russian grammar: 1 → "билет", 2–4 → "билета", 5–20 → "билетов", and the cycle repeats for 21+. The formatting utility must implement full Slavic plural rules.
- **PurchaseSummary large amounts**: `quantity=100, unitPriceKopecks=999900` → total 99 990 000 kopecks = 999 900,00 ₽. Integer arithmetic must not overflow (JS integers are safe up to 2^53).
- **NoticeBanner in checkout — caller passes `action`**: The component renders whatever is passed. It is the caller's responsibility not to pass an `action` in checkout contexts.
- **NoticeBanner unknown `state` value**: Caught at compile time by TypeScript union exhaustiveness. No runtime fallback needed.

---

## Error cases

- **AuthFlow network error on any API call**: Display `AUTH_ERRORS.network` on the relevant form. The form remains usable for retry. `onFlowChange` and `onSuccess` are not called.
- **AuthFlow `signIn` returning an unknown error code**: Display `AUTH_ERRORS.generic`.
- **AuthFlow `signIn` returning `{ code: 'account_blocked' }`**: Display `AUTH_ERRORS.accountBlocked`.
- **PurchaseSummary negative `unitPriceKopecks`**: The type is `number`; validation is the caller's responsibility. `formatKopecksRu` with a negative input must not crash (it may render a negative value with a minus sign).
- **NoticeBanner message text missing in implementation**: If a state has no defined copy yet (pending Open Questions #1), the component must render a non-empty fallback string (e.g., the state name) rather than an empty banner, so the UI remains legible.

---

## Out of scope

- "Registered state 1/2/3" checkout screens (the authenticated-user purchase flow before and during payment) — these are the checkout page's concern, not `AuthFlow`.
- Social login, magic links, admin password login — `AuthFlow` is OTP-only.
- Password reset flow — handled by existing pages per OTP spec.
- Email verification at registration.
- `PurchaseSummary` multi-walk orders (multiple `OrderItem` rows per order).
- `PurchaseSummary` refund status, payment method, or ЮKassa widget.
- `NoticeBanner` dismiss / close control.
- All backend API routes — already specified in `dev/specs/passwordless-otp/spec.md` and `dev/specs/yookassa-payment/spec.md`.
- Storybook stories.
- Step-change animations or transitions.

---

## Technical notes

**Files to create:**
- `components/auth/AuthFlow.tsx`
- `components/auth/AuthFlow.module.css`
- `components/purchase/PurchaseSummary.tsx`
- `components/purchase/PurchaseSummary.module.css`
- `components/purchase/NoticeBanner.tsx`
- `components/purchase/NoticeBanner.module.css`
- `lib/api/auth.ts` — Axios wrapper for `POST /api/auth/request-login-code` and `POST /api/auth/register` (per project rule: HTTP calls only via `lib/api/` instances)
- `utils/formatMoney.ts` — `formatKopecksRu(kopecks: number): string` returning Russian-locale currency string (e.g. 75000 → "750,00 ₽"; 150000 → "1 500,00 ₽"). Must use integer arithmetic only — reuse the division logic from `lib/payments/money.ts` (`Math.trunc` / modulo), then format with `Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })` or manual string assembly. No `Number.toFixed` on float.
- `utils/pluralRu.ts` — `pluralRu(n: number, forms: [string, string, string]): string` implementing Slavic plural selection (1 → forms[0], 2–4 → forms[1], 5–20 → forms[2], mod-cycle for 21+).
- `__tests__/components/auth/AuthFlow.test.tsx`
- `__tests__/components/purchase/PurchaseSummary.test.tsx`
- `__tests__/components/purchase/NoticeBanner.test.tsx`
- `__tests__/utils/formatMoney.test.ts`
- `__tests__/utils/pluralRu.test.ts`

**Files likely affected:**
- `lib/auth-labels.ts` — may need additional keys for purchase-context headings (e.g. a `purchase` group for "Войти как гость", "Зарегистрироваться")
- `lib/auth-errors.ts` — already has `invalidCode`, `emailTaken`, `network`, `generic`, `accountBlocked` — no additions expected

**Constraints:**
- `AuthFlow` requires `'use client'` (event handlers, `useState` for sub-state and attempt counter, `signIn` from `next-auth/react`)
- `PurchaseSummary` and `NoticeBanner` must have no `'use client'` directive
- All HTTP calls from `AuthFlow` go through `lib/api/auth.ts` Axios instance — not inline `fetch` or `axios` imported directly
- CSS: mobile-first base styles; desktop overrides via `min-width: 1248px` for card layout, `min-width: 720px` for `NoticeBanner`
- Animate only `transform` and `opacity`; no layout-affecting property animations
- Money formatting: integer arithmetic throughout; use `formatKopecksRu` from `utils/formatMoney.ts` — do not inline the logic in the component
- `signIn` is from `next-auth/react`; import only inside the `'use client'` component

**Dependencies:** no new npm packages required.

---

## Open questions

1. **NoticeBanner message copy**: The text for each of the 9 banner states is not available without Figma access. The implementer must read copy from Figma node `1697:787` (or get it from the product owner) before writing assertions that verify message content. Tests that exercise visual variant (error vs neutral border) can be written immediately; message-text assertions must wait.

2. **Date timezone for `PurchaseSummary`**: Walk dates are stored as UTC in the DB. Should `walkDate` be displayed in Europe/Moscow time (UTC+3)? If yes, either the caller converts the date before passing it, or `PurchaseSummary` applies the `timeZone: 'Europe/Moscow'` option to `Intl.DateTimeFormat`. Confirm the contract (caller converts vs component converts) before implementation to avoid display bugs.

3. **AuthFlow card dimensions at mobile**: `--size-content-mobile` token is 328px but the Figma content width is 310px (= 358px card − 24px × 2). Confirm whether the authoritative mobile content width is 310px (Figma) or 328px (token), and whether the card has a 1px margin each side at 360px viewport or extends edge-to-edge.

4. **AuthFlow sign-up → OTP in purchase context**: `POST /api/auth/register` in the OTP spec notes a "post-register redirect to `/login?registered=1`." In the purchase context, `AuthFlow` must not redirect — it must chain to `request-login-code` and call `onFlowChange('otp', email)` in-place. Confirm that the route handler does not issue a redirect response that the Axios wrapper cannot suppress, or that the client-side call handles a 3xx correctly.

5. **AuthFlow TypeScript enforcement of `email` when `flow='otp'`**: Should the props type use a discriminated union so that `email` is required when `flow='otp'`? This is a type-safety improvement but requires a union type rather than a flat object. Decide before implementation so tests can verify the type contract.
