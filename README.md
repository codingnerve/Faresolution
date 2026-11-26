# Faresolution

Faresolution is a business software discovery and comparison site: a directory
of products by category and industry, side-by-side comparisons, alternatives,
buying guides and research. This repository is the **static showcase build**:
the public site running on typed demonstration data inside a single Next.js
app. There is no backend, no accounts and no review collection yet. Every
product has no rating and no reviews, prices are shown only where the data
states one (none do today), and the site says so wherever it matters
("No reviews yet", "Not verified", "See vendor site", and a demonstration-data
notice).

## Quick start

Requirements: Node.js 20.9 or later (Next.js 16 minimum; developed on Node 22)
and npm. No database, services or environment variables are needed.

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build and server:

```bash
npm run build
npm run start        # or: npx next start -p 3100
```

Checks (the "gate" every change should pass):

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run (unit, integrity and rendering tests)
npm run build
```

### Route smoke test

`scripts/smoke.mjs` requests paths from a running server and fails unless each
answers with the expected status and, for 200s, contains an `<h1`.

```bash
npx next start -p 3100                         # in another terminal
node scripts/smoke.mjs / /software /compare    # given paths
node scripts/smoke.mjs --sitemap               # every URL in /sitemap.xml
node scripts/smoke.mjs --expect 404 /products/nope /compare/a-vs-a
node scripts/smoke.mjs --base https://example.com --sitemap
```

With `--sitemap`, a URL also fails if the page carries a `noindex` robots tag,
and titles over 60 characters are reported as warnings. Redirects are not
followed.

On Windows, run it from PowerShell. In Git Bash, MSYS rewrites arguments that
start with `/` into file paths (`/software` becomes `C:/Program Files/Git/software`),
so prefix the command: `MSYS_NO_PATHCONV=1 node scripts/smoke.mjs /software`.
Stopping `next start` on Windows can leave a node process holding the port;
stop it by port if the next start fails.

## Project structure

```
app/                  Routes (App Router). Pages are server components.
  page.tsx            Home
  software/           Directory (+ trending, new, free, top-rated)
  categories/         Category index and /categories/[slug]
  products/[slug]/    Product profile; tabs are sub-routes (reviews, features,
                      pricing, alternatives, integrations, screenshots, faq)
  compare/            Comparison picker and /compare/[slug] (a-vs-b, up to 4)
  alternatives/       Alternatives index and /alternatives/[product]
  industries/         Industry index and /industries/[slug]
  blog/ guides/ best-software/ research/ software-buying-guides/
                      Editorial sections, each with /[slug] articles
  resources/          Hub for the editorial sections
  reviews/            How reviews will work, placeholder latest/helpful
                      listings, and /reviews/write/[product] (local draft only)
  review-guidelines/ review-verification/
                      Review guidelines and the planned verification process
  vendors/            Vendor programme pages (plans, register interest, claim
                      a listing, resources, success stories)
  saved/              Products saved in this browser
  about/ contact/ privacy/ terms/
  design/             Internal component reference (development only)
  sitemap.ts robots.ts not-found.tsx error.tsx layout.tsx
components/           UI by area (layout, directory, product, compare,
                      editorial, forms, home, ui primitives, ...)
lib/
  data/               The data layer (see below)
  route-guards.ts     Existence checks for dynamic routes (used by proxy.ts)
  seo.ts sitemap.ts jsonld.ts
                      Metadata helpers, sitemap/robots entries, JSON-LD
  search/             Client-safe search index with typo tolerance
  directory/ compare/ alternatives/ categories/ industries/ products/
                      Page data and pure logic for each area (tested)
  storage.ts submissions.ts validation.ts
                      localStorage lists that never throw, local form
                      submissions, zod schemas
proxy.ts              Real 404s and canonical redirects (see below)
scripts/smoke.mjs     Route smoke test
```

### Data layer: the API swap point

Pages and components read data only through the async accessors in
`lib/data/index.ts` (`getProducts`, `getProduct`, `getCategoryTree`,
`getArticle`, ...). They never import the content arrays. Accessors return
`null` or `[]` for unknown input, and returned objects are shared read-only
references.

The content itself lives in `lib/data/content/` (products, categories,
industries, features, integrations, vendors, comparisons, vendor plans
(`plans.ts`), authors and articles, the last split across `articles-*.ts`
files and assembled in `articles.ts`), typed by `lib/data/types.ts`. `lib/data/content/slugs.ts` holds
slug-only lists so the proxy bundle stays small.

To move to a real API, reimplement the functions in `lib/data/index.ts` against
it, keeping their signatures. Nothing else should need to change, except
`lib/data/content/slugs.ts` (the route guards need a fast existence check; see
below) and the build-time `generateStaticParams` lists.

### Real 404s for unknown slugs (R12)

With `cacheComponents: true`, a page's `notFound()` for a slug that was not
prerendered runs after the response has started, so the first response would
be a 200 with a `noindex` tag. `proxy.ts` checks every dynamic route first,
using the table in `lib/route-guards.ts`, and returns a true 404 for unknown
slugs. It also issues real 308 redirects to canonical URLs: comparisons in
sorted product order (`/compare/zoho-crm-vs-hubspot-crm` goes to
`/compare/hubspot-crm-vs-zoho-crm`) and needlessly percent-encoded paths.
Pages still call `notFound()` as a second line of defence.

Adding a dynamic route means adding a guard in `lib/route-guards.ts`, a
matching entry in `config.matcher` in `proxy.ts`, and tests in
`lib/route-guards.test.ts` (a test fails if the matcher does not cover every
guarded path shape).

### SEO

`lib/seo.ts` builds page metadata (canonical URL, Open Graph, robots). Titles
use the `%s | Faresolution` template and stay within 60 characters; long
category, industry and article titles have a short `seoTitle`. `app/sitemap.ts`
and `app/robots.ts` are fed by `lib/sitemap.ts`, which lists only indexable
pages: no noindex pages (empty review and screenshot tabs, comparisons that are
not editor picks, review drafts, `/saved`, and `/software/top-rated`,
`/reviews/latest` and `/reviews/helpful` until reviews open). JSON-LD comes from
`lib/jsonld.ts`, with no `aggregateRating` unless a rating is backed by reviews
and no `offers` unless a price is known.

## Honesty rules the code enforces

These are checked by tests, mainly `lib/data/integrity.test.ts`, plus the
component, JSON-LD and sitemap tests:

- Every product has `rating: null`, `reviewCount: 0` and `verified: false`;
  every `startingPrice` and plan price is `null`. The rating component shows
  stars only for a positive rating backed by at least one review, otherwise
  "No reviews yet".
- Unknown facts render as "Not verified", never `null`, `NaN`, `undefined` or
  `0.0`. Prices without data link to the vendor's site.
- No testimonials, no invented review counts, no placeholder (lorem) text.
  Editorial shortlists are labelled as editors' picks, not rankings.
- Review-process copy is in future or planned tense: collection is not open
  and nothing is moderated or verified yet.
- Forms (newsletter, contact, review draft, vendor interest, listing claim)
  validate with zod and store entries only in this browser's localStorage,
  saying so ("This demo isn't connected to email yet ..."). They never claim
  an entry was sent.
- No emoji icons (lucide-react only), no copied brand logos (generated
  monograms from the product name and brand colour), no buttons for features
  that do not exist. Sign-in, accounts and dashboards are not built and not
  linked.

## What is deferred

Not part of this build: the monorepo layout (`apps/web`, `apps/api`,
`packages/*`); a NestJS API with product and category endpoints; PostgreSQL
with Prisma; authentication, customer accounts and real vendor registration;
the vendor dashboard; the admin dashboard with product and review moderation
and a CMS; review submission, verification and moderation, and ratings
computed from reviews; Meilisearch, Redis and BullMQ jobs; Cloudflare R2 media
storage; Resend email; advertising (sponsored placements), lead capture and
vendor subscriptions and payments; and the phase 8 work (end-to-end testing,
security hardening, performance, production deployment). Saved items, the
compare selection and form entries live in localStorage only.

### Roadmap

The master prompt plans the platform in eight phases. This static showcase is
not one complete phase. It delivers most of phase 1 (design system, branding,
public navigation and homepage, but not the monorepo), the public UI of phase 3
(directory, category pages, client-side search, filters, product profiles) and
of phase 4 (comparisons and alternatives; review pages are placeholders and
nothing is rated), and the SEO part of phase 7 (metadata, sitemap, robots,
JSON-LD). The master prompt remains the reference for each phase's scope.

| Phase | Master-prompt scope | Still to do after this showcase |
| ----- | ------------------- | ------------------------------- |
| 1 | Repository setup, monorepo, design system, branding, public navigation, homepage | Move to the monorepo (`apps/web`, `apps/api`, `packages/*`) |
| 2 | Database, backend foundation, authentication, product and category APIs | NestJS API, PostgreSQL with Prisma, authentication, product and category endpoints; reimplement `lib/data/index.ts` against the API |
| 3 | Software directory, category pages, search, filters, product profiles | Serve these pages from the API; Meilisearch for search and facets, Redis caching |
| 4 | Comparisons, alternatives, reviews, ratings | Review submission, verification and moderation jobs (BullMQ on Redis); ratings computed from published reviews; review listings, rating sort and filters switched on |
| 5 | Customer accounts, vendor registration, vendor dashboard | Buyer accounts with synced saved items and comparisons; real vendor registration and listing claims; vendor dashboard (profile and fact corrections, review responses, media on Cloudflare R2); transactional email (Resend) |
| 6 | Admin dashboard, product moderation, review moderation, CMS | Admin dashboard, product and review moderation queues, CMS for taxonomy, articles and pages |
| 7 | SEO infrastructure, advertising, leads, subscriptions | Adapt the existing SEO layer to live data (per-URL `lastModified`); labelled sponsored placements, consent-based lead capture, vendor subscriptions and payments |
| 8 | Testing, security, performance, production deployment | End-to-end tests, security review (auth, rate limits, uploads), performance work (search-index payload), production deployment with environments and secrets |

## Deployment

### Vercel

Import the repository in Vercel; it detects Next.js and runs `npm run build`.
No environment variables are needed. The build prerenders every product,
category, industry, article and editor-picked comparison; `proxy.ts` runs as
the routing proxy (middleware) for the dynamic routes.

### Self-hosting

Any host that runs Node.js 20.9+ can serve the site with the full feature set:

```bash
npm ci
npm run build
npm run start        # listens on port 3000; npm run start -- -p 8080 to change it
```

A static export (`output: "export"`) is not an option: the proxy, redirects
and request-time comparison pages need a server.

### Environment variables

None are required yet. The canonical site origin (`https://faresolution.com`)
is a constant, `SITE_URL` in `lib/utils.ts`. Planned for later phases, none of
them read by this build:

- `NEXT_PUBLIC_SITE_URL` (canonical origin per environment)
- `API_URL` (NestJS API base URL)
- `DATABASE_URL` (Postgres, used by the API)
- `REDIS_URL`, `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET`
- `RESEND_API_KEY`
- Auth and payment provider keys, once those are chosen

## Known follow-ups

- Split the largest components: `components/directory/FilterPanel.tsx`,
  `components/forms/ReviewDraftForm.tsx` and the `/vendors` page; extract a
  shared `useLocalSubmissionForm` hook for the local-storage forms.
- The search index is serialised into every page; trim its payload or load it
  on demand.
- `CATALOGUE_UPDATED_AT` in `lib/sitemap.ts` is bumped by hand, and every
  catalogue URL shares that one `lastModified` date.
- Comparisons of three or four products scroll sideways inside the table at
  320px; the page itself does not scroll.
- The legal pages (`/privacy`, `/terms`) have marked placeholders for the
  operator's legal name, address, hosting details and contacts.
- The product profile's "at a glance" aside is not sticky: it is taller than
  a typical laptop viewport minus the header and tab bar, so a sticky aside
  would hide its end until the bottom of the page.
- The title of the three-product editor pick "HubSpot CRM vs Pipedrive vs
  Salesforce Sales Cloud" is 65 characters with the site suffix (the smoke
  test warns); product names are not shortened.
- `/design` is an internal component reference with rating and button
  specimens on sample input. It renders only under `next dev` and answers 404
  in production builds; if it is needed in a deployed preview, gate it on an
  explicit flag rather than making it public.

## Demonstration data

All listings, vendor details, plan descriptions and editorial content are
demonstration data written for this showcase. They are based on public product
information but have not been verified with the vendors, and the site carries
a demonstration-data notice in the footer of every page and on listing and
product pages. Product names belong
to their owners; logos are generated monograms, not the vendors' marks. Do not
rely on this data for purchasing decisions.
