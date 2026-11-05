# Current Feature

## Status

In progress

## Goals

- Build `components/CTABand/CTABand.tsx` — reusable CTA card, mobile-first, matching Figma nodes 1697:1912 and 1697:1913
- Desktop (≥1248px): horizontal layout — text group fills remaining space, button fixed 406px
- Mobile (<1248px): stacked column, button full width
- Use in `app/birdid/page.tsx` with two instances (course + certificate)

## Notes

- Figma file: `MpZRXolbzistBaW20SYXsR`, nodes `1697:1912` and `1697:1913`
- Server Component — no `'use client'`
- Border: 2px solid `--color-border`, `--radius-lg` (12px), no background fill
- Branch: `cta-band`
