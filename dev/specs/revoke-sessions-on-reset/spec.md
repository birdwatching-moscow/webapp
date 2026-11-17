# Spec: Revoke admin sessions on password reset / block / delete

**Goal:** When an ADMIN/SUPERADMIN password is reset, every previously issued session of that account stops working; a blocked, soft-deleted or demoted admin loses admin access on the very next request.

**Depends on:** admin-2fa-login spec; PR #100 (auto sign-in after password reset) — its fresh session must stay valid.

---

## Terminology

| Term | What it is | Where it lives |
|---|---|---|
| **session** | Auth.js **JWT** in an http-only cookie, 14 days, sliding (`lib/auth.ts:39-43`, `lib/constants.ts:64-65`). There is no Session table — nothing server-side can be deleted, so revocation must be a per-request check against the DB. | signed cookie |
| **sessionVersion** | integer on `User`, bumped whenever all existing sessions must die. Copied into the JWT at sign-in. | `User.sessionVersion`, JWT claim `sessionVersion` |

> CLAUDE.md says "database sessions" — that is wrong for this codebase (being fixed separately). This spec relies only on the code.

---

## Decisions that resolve ambiguity

### D1 — Version counter plus direct status check

The guard rejects an admin token if ANY of: `sessionVersion` differs, `blockedAt != null`, `deletedAt != null`, DB role is `USER`.
- The direct `blockedAt`/`deletedAt` check makes block/delete effective immediately even for code paths that forget to bump the version.
- Block/delete ALSO bump `sessionVersion`. Reason: with the direct check alone, `unblockUser` (`app/admin/users/_actions.ts:57-60`) would resurrect every old cookie of that admin (14-day lifetime). A bump on block means unblock leaves old sessions dead; the admin must sign in again.
- `unblockUser` does NOT bump (nothing to revoke).

### D2 — Where the DB check lives

`auth.config.ts` is edge-compatible and must stay Prisma-free. It keeps only claim copying (`token.sessionVersion = user.sessionVersion` on sign-in). The DB check lives in a new Node-only module `lib/auth/sessionGuard.ts` and is wired in `lib/auth.ts` by overriding `callbacks.jwt` (`{ ...authConfig.callbacks, jwt }`: first run the config jwt callback, then the guard). `middleware.ts` already runs on `runtime: 'nodejs'` and calls `auth()` from `lib/auth`, so the guard runs for middleware, server components and server actions alike (anything calling `auth()`), including `/api/*` handlers that the middleware matcher skips (`middleware.ts:72`).

### D3 — Guard behaviour

- Runs only when `user` is absent (an existing token being re-read). On the sign-in call the token was just minted from a fresh DB read — skip, no extra query.
- Only for tokens with `role` `ADMIN` or `SUPERADMIN`. USER tokens are not checked (out of scope).
- One query: `prisma.user.findUnique({ where: { id: token.id }, select: { sessionVersion, blockedAt, deletedAt, role } })`. `role` is added to the three fields in the brief: without it, a SUPERADMIN demoted to ADMIN (or admin demoted to USER) keeps the old privilege until the cookie expires. If DB role is `ADMIN`/`SUPERADMIN` and differs from the token role, the token role is refreshed from the DB; if DB role is `USER`, the session is invalidated.
- Missing row → invalidate.
- Invalidate = jwt callback returns `null` (signed out → `middleware.ts:30-35` redirects `/admin` to login).
- `sessionVersion` is never exposed on the client `session` object.

### D4 — Legacy tokens (no `sessionVersion` claim)

Treat a missing claim as `0` (equal to the column default). Pre-migration admins stay signed in until their first reset/block, then the bump to 1 kills them. No forced mass logout on deploy.

### D5 — Fail-closed on DB error for admin tokens

If the guard query throws, return `null` and log via `createLogger`. Justification: this check is the only thing that enforces block/reset; failing open would let a blocked admin keep access exactly when the DB is flaky. Cost: admins are signed out during a DB outage — acceptable, the admin panel needs the DB anyway. Caveat: see Risks (cookie may be cleared by Auth.js).

### D6 — Atomic increments

Always `sessionVersion: { increment: 1 }` inside the existing write. Never read-modify-write.

### D7 — Post-reset auto sign-in has no race

In `reset-password/route.ts` the bump is in the same `prisma.user.update` as the password (`:62-75`), which commits before the challenge is created (`:85-93`). `authorizeAdminTwoFactor` reads the user at sign-in, after the commit, so the new JWT carries the new version.

---

## What to build

1. **Prisma:** `sessionVersion Int @default(0)` on `User` (`prisma/schema.prisma:49-71`) + migration `prisma/migrations/<timestamp later than latest>_add_user_session_version/migration.sql`.
2. **Types:** add `sessionVersion: number` to `AuthorizedUser` (`types/auth`), `next-auth` `User`, and `next-auth/jwt` `JWT` (`types/next-auth.d.ts`).
3. **Authorize helpers** (`lib/auth/authorize.ts`): `authorizeLoginCode`, `authorizeAdminTwoFactor`, `authorizeCredentials` return `sessionVersion` from the user row.
4. **`auth.config.ts` jwt callback:** copy `user.sessionVersion` into `token.sessionVersion`. Session callback unchanged.
5. **`lib/auth/sessionGuard.ts`** (new): `validateAdminToken(token): Promise<JWT | null>` per D3-D5.
6. **`lib/auth.ts`:** override `callbacks.jwt` to run config callback then guard (keep the NOTE about not using `satisfies NextAuthConfig`).
7. **Reset route:** add `sessionVersion: { increment: 1 }` to the `data` of the update at `reset-password/route.ts:62`.
8. **`blockUser`:** `data: { blockedAt: new Date(), sessionVersion: { increment: 1 } }` (`_actions.ts:54`).
9. **Delete:** no soft-delete code path exists today (grep of `app/` and `lib/` finds `deletedAt` only being read). Any future one must bump `sessionVersion`; today the guard's direct `deletedAt` check covers it. No code change.

---

## Success criteria and test mapping

- [ ] `pnpm test:run`, `pnpm lint`, `pnpm typecheck`, `pnpm build` pass
- [ ] `pnpm exec prisma validate` passes and the migration adds `"sessionVersion" INTEGER NOT NULL DEFAULT 0` (manual check; no unit test)

**Sign-in stores the version** — `__tests__/lib/auth-admin-2fa.test.ts`, `__tests__/lib/auth-config.test.ts`
- [ ] `authorizeAdminTwoFactor` returns `sessionVersion` from the DB row
- [ ] `authorizeCredentials` and `authorizeLoginCode` return `sessionVersion`
- [ ] config `jwt` callback with `user` copies `sessionVersion` into the token
- [ ] config `session` callback does not put `sessionVersion` on `session.user`

**Reset bumps the version** — `__tests__/api/auth/reset-password-session-version.test.ts` (new; also keep `reset-password-auto-login.test.ts` and `reset-password-rotation.test.ts` green)
- [ ] successful reset calls `prisma.user.update` once with `data.sessionVersion = { increment: 1 }` AND `passwordHash` in the same call
- [ ] invalid/expired/used token → 400, `prisma.user.update` not called
- [ ] DB error on update → 500, no challenge created
- [ ] challenge is created only after the update resolved (call order assertion), so the auto sign-in reads the new version

**Block bumps the version** — `__tests__/admin/users-actions.test.ts`
- [ ] `blockUser` update data contains `blockedAt` and `sessionVersion: { increment: 1 }`
- [ ] `unblockUser` update data sets `blockedAt: null` and has no `sessionVersion`
- [ ] existing guards unchanged: self-block and last-active-SUPERADMIN block still throw, no update

**Guard** — `__tests__/lib/session-guard.test.ts` (new, mocks `@/lib/prisma`)
- [ ] ADMIN token, matching version, not blocked/deleted → returns token
- [ ] ADMIN token with older `sessionVersion` → `null`
- [ ] `blockedAt` set (version matching) → `null`
- [ ] `deletedAt` set (version matching) → `null`
- [ ] user row missing → `null`
- [ ] DB role `USER` for an ADMIN token → `null`
- [ ] token `SUPERADMIN`, DB `ADMIN` → returned token has `role: 'ADMIN'`
- [ ] token without `sessionVersion` claim and DB version 0 → returns token; DB version 1 → `null`
- [ ] `findUnique` called with `select` of exactly `sessionVersion`, `blockedAt`, `deletedAt`, `role`
- [ ] USER token → returns token, `prisma.user.findUnique` not called
- [ ] DB throws for an ADMIN token → `null` (fail-closed) and error logged
- [ ] DB throws for a USER token → not applicable (no query), token returned

**Wiring** — `__tests__/lib/auth-config.test.ts` (or `auth-providers.test.ts`)
- [ ] `authOptions.callbacks.jwt` with `user` set does NOT call the guard / Prisma
- [ ] `authOptions.callbacks.jwt` without `user` calls the guard; its `null` is returned as `null`
- [ ] `auth.config.ts` still imports nothing from Prisma/Node-only modules (assert on module source or import in edge-like test)

**Middleware** — `__tests__/middleware.test.ts`
- [ ] with `req.auth = null` (what a revoked session yields) `/admin/walks` redirects to `LOGIN_PATH` with the return-URL param (regression guard; likely already covered, extend if not)

---

## Edge cases

| Scenario | Expected behaviour |
|---|---|
| Token issued before migration (no claim) | D4: treated as version 0; valid until first bump |
| Password reset while admin has other devices signed in | Other devices: next request has stale version, guard returns `null`, redirect to login |
| Reset completes and page auto-signs in (PR #100) | New JWT carries bumped version, stays valid (D7) |
| Same reset link submitted from two tabs | Token is single-use: second call gets 400 `invalid_link`; version bumped once |
| Two different valid reset links used back to back | Both succeed, version +2; the session from the first auto sign-in dies, the second tab's survives. Correct, accepted |
| Reset, then challenge creation fails (`route.ts:95-99`) | Password and version already changed; all sessions revoked; page falls back to `/login` |
| Admin demoted ADMIN→USER while signed in | Guard sees DB role `USER` → `null` |
| SUPERADMIN demoted to ADMIN while signed in | Token role refreshed to `ADMIN` on next request; `/admin/users` then redirects per `middleware.ts:39-41` |
| USER promoted to ADMIN while signed in | USER token is unchecked, role stays `USER` until re-login (safe direction) |
| Admin blocks themselves | Already rejected by `blockUser` (`:42`) |
| Last active SUPERADMIN | Already protected from block (`:47-52`) |
| SUPERADMIN unblocks an admin | Old sessions stay dead (bump happened at block); admin signs in anew |
| Sliding renewal (`updateAge`) | Renewed token is re-checked like any other; no bypass |
| Many concurrent requests | One PK lookup each; no cache by design, a cache would delay revocation |

## Error cases

- DB error during the guard → session treated as signed out, error logged with `createLogger` (D5).
- DB error in reset update → existing 500 path; no partial state (version bump is in the same write).
- Guard receives a token with no `id` → invalidate (`null`).

## Out of scope

- "Sign out everywhere" button / self-service revocation
- Revoking or checking USER sessions (passwordless, no password to reset)
- Bumping `sessionVersion` on role change (guard compares role directly)
- Revoking unused `AdminLoginChallenge` rows on reset (they still require the new password)
- Caching the guard lookup, rate-limiting
- Switching to database sessions; fixing CLAUDE.md

## Technical notes

**Files likely affected:** `prisma/schema.prisma` + new migration, `types/auth`, `types/next-auth.d.ts`, `auth.config.ts`, `lib/auth.ts`, `lib/auth/authorize.ts`, new `lib/auth/sessionGuard.ts`, `app/api/auth/8qfzgof9uev06a/reset-password/route.ts`, `app/admin/users/_actions.ts`.
**Constraints:** `auth.config.ts` stays edge-safe; Prisma `select` only the four fields; no `any`; named constants, no magic numbers.
**Dependencies:** none new.

## Risks

- **Cookie clearing on null:** in Auth.js v5 a `null` from the `jwt` callback ends the session and clears the cookie. On a transient DB error (D5) the admin is therefore fully signed out rather than just denied once. Implementer must verify this behaviour against the installed `next-auth` version (Context7) and confirm the `null` path really yields `req.auth === null` in middleware.
- Per-request DB hit for admin tokens (every matched request, including public pages they browse).
- `lib/auth.ts` typing quirk (see its NOTE): the overriding `jwt` callback must keep the `next-auth/jwt` augmentation visible.

## Resolved questions (approved 2026-11-17)

1. `role` is selected and checked as the 4th field — yes (demotions must take effect).
2. Fail-closed on DB error, even though it signs the admin out — yes (admin panel needs the DB anyway).
3. Legacy tokens without the claim count as version 0 — yes, no mass logout on deploy.
