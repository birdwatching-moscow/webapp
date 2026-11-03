# Current Feature

## Status

Spec written — awaiting Gate 1 approval

## Goals

- Build `components/Footer.tsx` — static, mobile-first, matching Figma
- Desktop (≥1248px): 5-column layout (logo, bird photo, 3 nav columns)
- Mobile (<1248px): stacked (logo → photo → 2-col nav → contacts)
- Dynamic `© {year}` in bottom bar
- Bird photo: manual export from Figma required (`public/images/footer-bird.png`)

## Notes

- Figma file: `o3z6B8QEOwTHCosUVizuyH`, node `1883:6481`
- Server Component — no `'use client'`
- Spec: `dev/specs/footer/spec.md`
