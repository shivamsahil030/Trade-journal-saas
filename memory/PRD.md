# Trade Journal — PRD & Status

## Original Problem
Production-ready Trade Journal SaaS: React + Tailwind + FastAPI + MongoDB. Journal every trade (setup, screenshot, logic, lesson, tags) with per-user isolation.

## Architecture
- Frontend: **Vite 5** + React 18 + Tailwind + shadcn/ui + Framer Motion + React Router 6 + Sonner
- Backend: FastAPI + MongoDB (motor) with JWT httpOnly cookies
- Screenshots stored as base64 in Mongo (2MB cap)

## Personas
- Individual retail trader logging setups privately

## Core requirements
- Landing / auth / dashboard / journal CRUD / search / dark mode / delete-confirm / auto-save draft

## Implemented (2026-02-04)
- Full landing page (nav, hero, features, benefits, why-choose, testimonials, pricing, FAQ, footer)
- Auth: register / login / logout / me / refresh / forgot / reset / brute-force lockout
- Journal CRUD with per-user isolation and case-insensitive server search
- Dashboard: grid + search + empty state + delete confirm dialog
- Journal details / edit / auto-save draft
- Profile page (name update)
- Light + dark mode via next-themes
- 404 page
- **CRA → Vite migration (iteration 2)** — Vite 5.4.11, single `npm run dev` startup

## Backlog
- P1: Emergent Google Auth (deferred from iteration 1)
- P2: Weekly review summary email (revenue/retention hook)
- P2: Trade tags autocomplete + saved filters
- P2: CSV export of all journals

## Credentials
See `/app/memory/test_credentials.md`
