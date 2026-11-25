# Faresolution — Static Showcase (Design)

Status: approved by user (2026-11-25), short design for a project-sized build done in phases.

## Intent and why
The user wants a presentable Faresolution website to show now. The full platform (NestJS API, Postgres/Prisma, Redis, Meilisearch, vendor/admin dashboards, payments) from the master prompt is deferred. This build is the public-facing site running on typed static data, structured so a real API can replace the data layer later.

## Goals
- Polished, original, premium public site per the master prompt's visual identity (navy #17243A, blue #4169E1, violet #7767D8, Inter/Geist + editorial serif, restrained motion).
- Public routes: home, /software (+ trending, top-rated, new, free), /categories(/[slug]), /products/[slug] with tabs (overview, reviews, features, pricing, alternatives, integrations, screenshots, faq), /compare(/[slug]), /alternatives(/[product]), /industries(/[slug]), /blog, /guides, /best-software, /research, /software-buying-guides (+ [slug]), /vendors marketing pages, legal/about/contact.
- Everything that is clickable works in the browser: search + autocomplete, filters, sort, pagination, list/grid, compare (max 4, URL-shareable), saved products/comparisons via localStorage, forms validated with zod/react-hook-form.
- SEO: generateMetadata, sitemap.ts, robots.ts, breadcrumbs, JSON-LD (Organization, Product without fabricated ratings, Article, Breadcrumb).
- Data access through `lib/data` functions (`getProducts`, `getProduct`, `getCategories`, ...) so pages never import raw arrays.

## Non-goals (deferred)
Real auth, vendor dashboard, admin dashboard, real review submission/moderation, payments, NestJS/Postgres/Redis/Meilisearch, monorepo move.

## Anti-goals
- No invented ratings, review counts, testimonials or reviews. Cards show "No reviews yet" + write-a-review prompt; rating UI exists and renders when data is present.
- No dead buttons: features that are deferred are omitted, not stubbed.
- No generic AI-template look, copied brand logos, lorem ipsum, emoji icons.
- Prices only where confident they are accurate; otherwise "See vendor site". Sample data labelled as demonstration data until verified.

## Constraints
- Next.js 16.4.6 has breaking changes: read `node_modules/next/dist/docs/` before writing code (AGENTS.md).
- Tailwind 4.3, React 19.3, framer-motion, lucide-react, react-hook-form, zod already installed.
- No Docker/Postgres on this machine.

## Approaches
1. **Static showcase on typed data in a single Next.js app (chosen).** Fastest, shippable on Vercel, clean swap point for a future API.
2. Next.js with route handlers + real DB now: slower, needs local services not present.
3. Full NestJS monorepo now: matches master prompt but delays anything visible.

## Decisions made (builder's calls)
- Single app at repo root; no monorepo for now.
- Generated SVG logo marks per product (initial + colour), no brand logos.
- Fonts via `next/font` (Inter + a serif for editorial headlines).
- Client components only where interaction requires; pages are server components.

## Left to the builder
Exact component breakdown, seed content wording, motion details, image/screenshot treatment (designed placeholders, not fake screenshots), build order within phase 1.
