# Current Feature

## Status

Spec written — awaiting Gate 1 approval

## Goals

- Replace `components/Header.tsx` stub with a mobile-first Header component matching Figma
- Desktop (≥1248px): logo left + nav row right + context-dependent CTA
- Mobile: slim bar with hamburger → full-screen overlay when open
- CTA adapts to auth state: Войти / Личный кабинет / Выйти

## Notes

- Figma file: `UPCl1IDlaoQ3lmPoKafETU`
- Header is `'use client'`: needs `useSession`, `usePathname`, `useState`
- `signOut` from `next-auth/react` with `redirectTo: '/'`
- Mobile overlay: toggle `overflow: hidden` on `document.body` via `useEffect`
- Книга → `/book`, О проекте → `/about`
- Spec: `dev/specs/header/spec.md`
