# Faresolution Static Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a polished, original Faresolution public website (software discovery, compare, alternatives, reviews shell, industries, editorial, vendor marketing) on typed static data, ready to show.

**Architecture:** Single Next.js 16 app at the repo root. All content lives in typed files under `lib/data/content/` and is read only through async functions in `lib/data/index.ts` (the future API swap point). Pages are server components; interactivity (search, filters, compare tray, saved items, forms) is small client components in Suspense. Pure logic (search, directory query, compare, alternatives) lives in `lib/` with Vitest tests.

**Tech Stack:** Next.js 16.4.6 (App Router, `cacheComponents: true`), React 19.3, TypeScript, Tailwind 4.3, framer-motion, lucide-react, react-hook-form + zod, Vitest (added in Task 1).

**Spec:** `docs/superpowers/specs/2026-11-25-static-showcase-design.md` (visual identity and route list come from the user's master prompt, summarised in Global Constraints).

## Global Constraints

- Read `node_modules/next/dist/docs/` before using any Next API (AGENTS.md). Verified facts: `params` and `searchParams` are Promises; type pages with `PageProps<'/route'>`; with `cacheComponents` a dynamic route's `generateStaticParams` must return at least one param; client components calling `useSearchParams` must sit inside `<Suspense>`; JSON-LD is a native `<script type="application/ld+json">` with `<` escaped as `<`.
- Palette (CSS tokens in `app/globals.css`): navy `#17243A`, blue `#4169E1`, violet `#7767D8`, bg `#FFFFFF`, bg-alt `#F6F7FA`, text `#202A39`, muted `#737D8C`, border `#E7EAF0`. Light theme only (remove the dark-mode block from the starter CSS). No gradients except at most one subtle use. Corner radius never above 8px.
- Fonts via `next/font/google`: Geist (UI, already installed) and Newsreader (editorial headlines).
- Brand line: "Find. Compare. Choose Better." Homepage H1: "Find the software that moves your business forward."
- No invented ratings, review counts, reviews, testimonials, or prices. Every product has `rating: null`, `reviewCount: 0`. Any fact not confidently known is `null` and the UI renders "Not verified" (never `NaN`, `$null`, `0.0`, empty stars). Sample data carries `verified: false` and the site shows a `DemoDataNotice`.
- No emoji icons (lucide-react only), no lorem ipsum, no copied brand logos (generated SVG `LogoMark` from name + `brandColor`), no dead buttons: if a feature is deferred it is not rendered. Login, register, vendor dashboard, admin dashboard and payments are NOT built and NOT linked from the nav.
- Forms (newsletter, contact, review draft, vendor claim) validate with zod and store via `lib/submissions.ts` into localStorage with the honest message "This demo isn't connected to email yet; your entry is stored only in this browser."
- Do not commit unless the user asks; each task ends with a verification checkpoint instead.
- **Verification protocol** (referred to as "gate"): `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build` must all pass; for route checks run `npm run build && npx next start -p 3100` in the background and `node scripts/smoke.mjs <paths...>` (exits non-zero unless each path returns 200 and contains an `<h1`).

## Review Focus

1. Unknown or malformed slugs (`/products/nope`, `/compare/a-vs-a`, `/compare/x-vs-y-vs-z-vs-w-vs-v`, one-product compare) return 404 or redirect to canonical, never crash. Owner: Task 9.
2. Directory query params that are invalid (`page=0`, `page=9999`, `page=abc`, unknown category, `minRating=-1`) clamp or ignore, never throw or show an empty broken page. Owner: Task 6.
3. Search input that is empty, whitespace, regex characters (`(`, `[`, `\`), 500+ characters, or matches nothing returns a clean empty result. Owner: Task 3.
4. localStorage missing, throwing (private mode) or holding corrupt JSON: compare tray, saved items and forms still render and work in-memory. Owner: Task 8.
5. Products with null pricing/rating render without `NaN`/`null` text, and Product JSON-LD omits `aggregateRating` and `offers` when unknown and escapes `<` in text. Owner: Task 8.

---

## File Structure

```
app/
  layout.tsx, globals.css, not-found.tsx, error.tsx, sitemap.ts, robots.ts
  page.tsx                                  home
  software/(page, trending, top-rated, new, free, alternatives → redirect to /alternatives, categories → redirect)
  categories/(page, [slug]/page)
  products/[slug]/(page, reviews, pricing, features, alternatives, integrations, screenshots, faq) + layout.tsx
  compare/(page, [slug]/page)
  alternatives/(page, [product]/page)
  reviews/(page, latest, helpful, write/[product]) review-guidelines/ review-verification/
  industries/(page, [slug]/page)
  blog/ guides/ best-software/ research/ software-buying-guides/ resources/   (index + [slug])
  vendors/(page, register, login→omit, claim-listing, pricing, resources, success-stories)
  about/ contact/ privacy/ terms/ saved/
components/
  ui/        Button, Badge, Container, SectionHeader, Rating, LogoMark, Logo, Breadcrumbs, EmptyState, DemoDataNotice, Tabs
  layout/    Header, MegaMenu, MobileNav, Footer, SearchBox
  product/   ProductRow, ProductTile, ProductCompact, ProductHeader, ProductTabs, PricingTable, ScreenshotFrame
  directory/ FilterPanel, SortBar, Pagination, ViewToggle
  compare/   CompareTray, CompareTable, CompareButton, ComparePicker
  editorial/ ArticleCard, ArticleBody, TableOfContents, ShareButtons
  forms/     NewsletterForm, ContactForm, ReviewDraftForm, ClaimListingForm
lib/
  data/(types.ts, index.ts, content/*.ts)   utils.ts  seo.ts  jsonld.ts  submissions.ts  storage.ts
  search/  directory/  compare/  alternatives/
scripts/smoke.mjs   vitest.config.ts
```

---

### Task 1: Tooling and design system

**Files:**
- Create: `vitest.config.ts`, `scripts/smoke.mjs`, `lib/utils.ts`, `components/ui/*` (list above), `app/design/page.tsx` (internal token/component gallery, `robots: noindex`, excluded from sitemap)
- Modify: `package.json` (add `vitest`, `@vitest/coverage-v8` not needed; scripts `test`, `typecheck`), `app/globals.css`, `app/layout.tsx`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` (clsx + tailwind-merge); `Button({variant:'primary'|'secondary'|'ghost'|'link', size:'sm'|'md'|'lg', href?, ...})` rendering `<Link>` when `href`; `Badge({tone:'neutral'|'blue'|'violet'|'success'|'sponsored'})`; `Rating({value:number|null, count:number})` rendering "No reviews yet" when `value===null`; `LogoMark({name:string, color:string, size?:number})`; `Logo()`; `Breadcrumbs({items:{label:string;href?:string}[]})` (also emits BreadcrumbList JSON-LD); `Container`; `SectionHeader({eyebrow?,title,description?,action?})`; `EmptyState({title,description,action?})`; `DemoDataNotice()`; `Tabs` (link-based, `{items:{label,href,active}[]}`).
- Tokens: Tailwind `@theme` colors `--color-navy|blue|violet|surface|surface-alt|ink|muted|line`, `--font-sans`, `--font-serif`, spacing/typography utility classes `.type-display .type-h1 .type-h2 .type-h3 .type-body .type-meta .type-label`.

- [ ] **Step 1: Baseline.** Run the gate on the untouched starter; record any pre-existing failure. Expected: all green (fix `next.config.ts` only if the build itself fails).
- [ ] **Step 2: Failing test** `lib/utils.test.ts`: `cn('a', false && 'b', 'p-2', 'p-4')` equals `'a p-4'`. Run `npx vitest run lib/utils.test.ts`; expect FAIL (module missing).
- [ ] **Step 3: Implement** `vitest.config.ts` (node env, `@` alias to repo root, include `**/*.test.ts`), `lib/utils.ts`, `scripts/smoke.mjs`. Expected: test PASS.
- [ ] **Step 4: Implement design system.** Tokens, fonts, root layout metadata (`metadataBase: https://faresolution.com`, title template `%s | Faresolution`), and the `components/ui` set. Logo: original minimal SVG mark (navy square, blue bar, violet accent) + wordmark, works single-colour. Build `/design` gallery showing every component.
- [ ] **Step 5: Gate.** Smoke `/design`. View it at 375px and 1280px with Playwright MCP screenshots; fix overflow.

### Task 2: Data model, content and access layer

**Files:**
- Create: `lib/data/types.ts`, `lib/data/index.ts`, `lib/data/content/{categories,industries,features,integrations,vendors,products,articles,authors,comparisons}.ts`
- Test: `lib/data/integrity.test.ts`

**Interfaces:**
- Produces types: `Product { slug; name; vendorSlug; tagline; description; website; categorySlugs: string[]; primaryCategory: string; industrySlugs: string[]; featureSlugs: string[]; integrationSlugs: string[]; pricing: { model: 'free'|'freemium'|'subscription'|'usage'|'one-time'|'custom'|null; freePlan: boolean|null; freeTrial: boolean|null; startingPrice: string|null; note: string|null; plans: {name:string; price:string|null; summary:string}[] }; deployment: ('cloud'|'on-premise'|'hybrid')[]; platforms: ('web'|'ios'|'android'|'windows'|'mac'|'linux'|'api')[]; companySizes: ('solo'|'small'|'mid'|'enterprise')[]; highlights: string[]; pros: string[]; cons: string[]; faq: {q:string;a:string}[]; rating: number|null; reviewCount: number; addedAt: string; featured: boolean; trendingRank: number|null; verified: boolean; brandColor: string }`; `Category { slug; name; parentSlug: string|null; intro; buyingGuide: {heading;body}[]; faq; relatedSlugs; seoTitle; seoDescription }`; `Industry`, `Vendor { slug; name; website; description; headquarters: string|null }`, `Feature`, `Integration { slug; name; website }`, `Article { kind: 'blog'|'guide'|'best-software'|'research'|'buying-guide'; slug; title; excerpt; body: Block[]; authorSlug; categoryLabel; publishedAt; updatedAt; relatedProductSlugs; relatedCategorySlugs; featured }`, `Block = {type:'h2'|'h3'|'p'|'ul'|'callout'; ...}`, `Author`, `PopularComparison { slugs: string[] }`.
- Produces async functions: `getProducts(): Promise<Product[]>`, `getProduct(slug)`, `getProductsByCategory(slug)`, `getProductsByIndustry(slug)`, `getCategories()`, `getCategory(slug)`, `getCategoryTree()`, `getIndustries()`, `getIndustry(slug)`, `getVendor(slug)`, `getFeatures()`, `getIntegration(slug)`, `getArticles(kind?)`, `getArticle(kind,slug)`, `getAuthor(slug)`, `getPopularComparisons()`. All return `null` / `[]` for unknown input.

- [ ] **Step 1: Failing test** `integrity.test.ts` with assertions: slugs unique per collection; every `categorySlugs`/`industrySlugs`/`featureSlugs`/`integrationSlugs`/`vendorSlug` resolves; `primaryCategory` ∈ `categorySlugs`; every product has `rating === null && reviewCount === 0 && verified === false`; ≥25 categories (the exact list in the master prompt), 12 industries, every category has ≥2 products and non-empty `intro`, `buyingGuide`, `faq`; products `hubspot-crm` and `zoho-crm` exist; every `PopularComparison` has 2–4 existing slugs; every article's authors/related slugs resolve; no string in content contains "lorem" (case-insensitive). Run; expect FAIL.
- [ ] **Step 2: Types and access layer.** Implement `types.ts` and `index.ts` (async wrappers over the content arrays; memoised lookup maps).
- [ ] **Step 3: Content authoring.** 55–60 products across all categories from this candidate set: HubSpot CRM, Zoho CRM, Salesforce Sales Cloud, Pipedrive, Asana, Trello, Monday.com, ClickUp, Jira, QuickBooks Online, Xero, FreshBooks, NetSuite, Odoo, BambooHR, Gusto, ADP Workforce Now, HubSpot Marketing Hub, ActiveCampaign, Mailchimp, Brevo, Klaviyo, Zendesk, Freshdesk, Intercom, Tidio, Tableau, Microsoft Power BI, Looker Studio, Google Analytics, Mixpanel, Amplitude, Zoho Inventory, Cin7, Shopify, WooCommerce, BigCommerce, Wix, Squarespace, Webflow, CrowdStrike Falcon, Okta, 1Password, Zoom, Microsoft Teams, Dropbox, Box, Outreach, Salesloft, Apollo.io, Greenhouse, Lever, Workable, MongoDB Atlas, Supabase, Slack, Notion, Confluence, Zapier, Make, n8n. Rule: only publicly well-known facts (vendor, website, category, deployment, plain-language description); free plan / free trial / pricing only when confident, else `null`. Write unique, specific category intros, buying guides (3+ sections), 4+ FAQs per category, 8+ articles across all five kinds with real, useful advice (no fabricated statistics or quotes), 2+ author profiles, ≥6 popular comparisons including `hubspot-crm`+`zoho-crm`, and 12 industry pages' copy. `trendingRank` is an editorial ordering and labelled "Editor-curated" wherever shown.
- [ ] **Step 4: Run** `npx vitest run lib/data` → PASS. Gate.

### Task 3: Search logic

**Files:** Create `lib/search/{index.ts,distance.ts}`, test `lib/search/search.test.ts`

**Interfaces:**
- Consumes: `Product`, `Category`, `Vendor`, `Feature` from Task 2.
- Produces: `buildSearchIndex(input:{products:Product[];categories:Category[];vendors:Vendor[]}): SearchIndex` (plain JSON-serialisable); `search(index:SearchIndex, query:string, opts?:{limit?:number}): SearchResults` where `SearchResults = { products: ProductHit[]; categories: CategoryHit[]; vendors: VendorHit[] }`; `popularSearches: string[]` (static list of 8 terms); `levenshtein(a,b): number`.

- [ ] **Step 1: Failing tests:** `search(idx,'hubspot')` first product is `hubspot-crm`; `'hubspt'` (typo, distance 1) still returns `hubspot-crm`; `'crm'` returns the CRM category; `'  '` and `''` return empty arrays; `'('`, `'[a-'`, `'\\'` and a 600-char string do not throw and return empty or valid results; `'zzzzqqq'` returns empty; vendor query `'zoho'` returns vendor `zoho` and its products; limit respected; ranking prefers prefix over substring over fuzzy.
- [ ] **Step 2: Implement** (no regex built from user input; normalise lowercase/trim/collapse spaces; cap query at 100 chars; typo tolerance only for tokens ≥4 chars, distance ≤1 for length 4–6, ≤2 above).
- [ ] **Step 3:** run tests → PASS; gate.

### Task 4: Global shell (header, mega menu, mobile nav, search box, footer)

**Files:** Create `components/layout/*`; Modify `app/layout.tsx`, create `app/not-found.tsx`, `app/error.tsx`

**Interfaces:** Consumes `getCategoryTree()`, `getIndustries()`, `buildSearchIndex`/`search`. `SearchBox({index:SearchIndex})` client component.

- [ ] **Step 1:** Header: logo left; centre links Software, Categories (mega menu: category groups + "View all"), Compare, Alternatives, Industries (menu), Resources (menu: blog, guides, best-software, research, buying guides); right: search icon (opens dropdown), "For Vendors". No Sign In / Create Account. Sticky; framer-motion for dropdown/menu; Escape closes, arrow keys move focus, `aria-expanded` set; mobile slide-out drawer with focus trap.
- [ ] **Step 2:** `SearchBox`: debounce-free local search, grouped results (Products, Categories, Brands, Popular searches when empty), keyboard nav (↑ ↓ Enter Esc), Enter on free text goes to `/software?q=...`. Index built once in the layout and passed as a prop.
- [ ] **Step 3:** Footer with all master-prompt link groups, newsletter form (this task creates `components/forms/NewsletterForm.tsx`, `lib/validation.ts` with `newsletterSchema`, and `lib/submissions.ts` with `saveSubmission`; Task 11 adds its tests and the other schemas, Task 14 reuses `NewsletterForm`), social links (real profile URLs left as config in `lib/site.ts`; omit any not set), `DemoDataNotice`.
- [ ] **Step 4:** `not-found.tsx` (with search) and `error.tsx`. Gate; Playwright: open mega menu, search "zoho", mobile drawer at 375px.

### Task 5: Homepage

**Files:** Modify `app/page.tsx`; create `components/home/*`

- [ ] **Step 1:** Sections in order, each visually distinct (editorial split hero, category index grid with counts, "Editor's shortlist" = `featured` products as `ProductTile`, "Popular comparisons" as paired-logo rows from `getPopularComparisons()`, industries as a typographic list, reviews call-to-action block explaining that reviews appear once verified (no fake reviews; section replaces "recent reviews" and "highest rated"), featured vendors strip from real vendor data, buying-guides + research editorial grid, newsletter, footer). Hero has the search input (reuses `SearchBox` behaviour) and the H1 from Global Constraints.
- [ ] **Step 2:** Metadata (title, description, OG) + Organization JSON-LD via `lib/jsonld.ts` (Task 15 owns the helper; create `organizationJsonLd()` here if not yet present). Gate; smoke `/`; Playwright screenshots at 375, 768, 1280; confirm no horizontal scroll.

### Task 6: Directory (query logic + /software routes)

**Files:** Create `lib/directory/{query.ts,query.test.ts}`, `components/directory/*`, `components/product/{ProductRow,ProductTile,ProductCompact}.tsx`, `app/software/{page,trending/page,top-rated/page,new/page,free/page}.tsx`, redirects for `/software/categories`→`/categories` and `/software/alternatives`→`/alternatives` (in `next.config.ts` `redirects`)

**Interfaces:**
- Produces: `type DirectoryQuery = { q:string; category?:string; priceModel?:Product['pricing']['model']; freePlan?:boolean; freeTrial?:boolean; minRating?:number; companySize?:string; deployment?:string; industry?:string; feature?:string[]; integration?:string[]; sort:'relevance'|'name'|'newest'|'rating'|'trending'; page:number; view:'grid'|'list' }`; `parseQuery(params: Record<string,string|string[]|undefined>): DirectoryQuery`; `applyQuery(products: Product[], q: DirectoryQuery, ctx:{searchIndex?:SearchIndex}): Product[]`; `paginate<T>(items:T[], page:number, pageSize=12): {items:T[]; page:number; pageCount:number; total:number}`; `facetCounts(products, query): Record<FacetKey, {value:string;count:number}[]>`; `serializeQuery(q): string`.
- Product cards show logo mark, name, vendor, tagline, `Rating` (null → "No reviews yet"), pricing line (null → "Pricing not verified"), free trial status (true/false/unknown), 3 highlights, "View details", `CompareButton` (Task 9; add after it exists).

- [ ] **Step 1: Failing tests:** `parseQuery({page:'0'}).page===1`; `'abc'`→1; `'-5'`→1; `minRating:'-1'` → undefined; unknown `sort` → `'relevance'`; `view` unknown → `'grid'`; array values collapse to first; `applyQuery` with `freeTrial:true` returns only products where `pricing.freeTrial===true` (null excluded); category filter includes products with the category in `categorySlugs`; `paginate(items,9999)` clamps to last page, empty list gives `pageCount:1`; `rating` sort places `null` ratings last without throwing; `serializeQuery(parseQuery(x))` round-trips; unknown category slug → empty result (not throw).
- [ ] **Step 2: Implement** logic, then UI. `/software` is a static server shell; `FilterPanel` (client, in Suspense) reads `useSearchParams`, writes with `router.replace`; mobile filters in a slide-over. `trending` = sort by `trendingRank` (labelled "Editor-curated"); `top-rated` = honest empty state explaining ratings arrive with verified reviews plus a "Write a review" CTA; `new` = by `addedAt`; `free` = `pricing.freePlan===true`. Pagination links are real `<a>`s with `rel=prev/next`; paginated pages beyond 1 get `noindex,follow`.
- [ ] **Step 3:** Tests PASS; gate; smoke `/software /software/trending /software/top-rated /software/new /software/free "/software?category=crm-software&page=2"`; Playwright: apply two filters, switch list/grid, mobile filter drawer.

### Task 7: Category pages

**Files:** Create `app/categories/page.tsx`, `app/categories/[slug]/page.tsx`

- [ ] **Step 1:** Index: hierarchical directory (parents with children) with product counts. Detail (`generateStaticParams` from `getCategories()`; unknown slug → `notFound()`): breadcrumbs, editorial intro, "Top products" (curated by `featured` then `trendingRank`), embedded filter+listing (reuse Task 6 components scoped to the category), buying guide, related categories, FAQ (with FAQPage JSON-LD), `generateMetadata` from `seoTitle`/`seoDescription` with canonical.
- [ ] **Step 2:** Gate; smoke every category URL (script reads slugs via `/sitemap.xml` once Task 15 exists; until then pass 3 examples); Playwright mobile check.

### Task 8: Product profile, tabs and saved items

**Files:** Create `app/products/[slug]/{layout,page,reviews/page,pricing/page,features/page,alternatives/page,integrations/page,screenshots/page,faq/page}.tsx` (shared header + `ProductTabs` in the layout), `components/product/*`, `lib/storage.ts` (+ `lib/storage.test.ts`), `lib/jsonld.ts` (+ test), `components/product/SaveButton.tsx`

**Interfaces:**
- Produces: `readList(key:string): string[]` / `writeList(key:string, list:string[]): void` that never throw (fall back to an in-memory map when localStorage is absent, throws, or holds invalid JSON/non-string arrays); `useStoredList(key): [string[], {add,remove,toggle,has}]` via `useSyncExternalStore`; `productJsonLd(p:Product): object` and `safeJsonLd(obj:unknown): string` (escapes `<`).

- [ ] **Step 1: Failing tests:** `readList` returns `[]` when `localStorage.getItem` throws, when value is `'{bad'`, and when value is `'{"a":1}'`; `writeList` does not throw when `setItem` throws and later `readList` returns the in-memory value; `productJsonLd` for a product with `rating:null` has no `aggregateRating` and, with `pricing.startingPrice:null`, no `offers`; `safeJsonLd({name:'</script><b>'})` contains no `<`; product with all-null pricing renders no "null"/"NaN" (assert on a pure `formatPricing(p): string` helper in `lib/utils.ts` returning "Pricing not verified").
- [ ] **Step 2: Implement** the tests' targets, then the profile: header (logo, name, vendor, verified-website `Visit website` with `rel="noopener nofollow sponsored"` omitted unless sponsored, `Request demo` links to the vendor website demo path only if known else to `/contact?product=slug`, `Compare`, `Write review` → `/reviews/write/[slug]`, `Save`), tabs per master prompt, overview with the 10 listed sections (empty review/rating areas use `EmptyState`), `ScreenshotFrame` designed placeholder with "Vendor screenshots appear once submitted" (no fake screenshots), `generateStaticParams` from products, `generateMetadata`, Product JSON-LD, breadcrumbs. Tab routes reuse the same data; `/products/[slug]/{reviews,pricing,...}` canonical to themselves.
- [ ] **Step 3:** Tests PASS; gate; smoke three product URLs plus all tab URLs of `hubspot-crm`; `/products/nope` returns 404 (smoke script flag `--expect 404`).

### Task 9: Compare engine

**Files:** Create `lib/compare/{slug.ts,diff.ts,compare.test.ts}`, `components/compare/*`, `app/compare/{page,[slug]/page}.tsx`

**Interfaces:**
- Produces: `parseCompareSlug(slug:string): string[]` (split on `-vs-`); `buildCompareSlug(slugs:string[]): string` (sorted alphabetically, deduped); `validateCompareSlugs(slugs:string[], known:Set<string>): {ok:true;slugs:string[]}|{ok:false;reason:'count'|'unknown'|'duplicate'}` (2–4 products); `buildRows(products:Product[]): CompareRow[]` with `CompareRow {key:string; label:string; cells:string[]; differs:boolean}` covering overview, rating, review count, pricing model, free plan, free trial, key features, deployment, platforms, integrations, support, ease of use, value for money (last three "Not rated yet" while null); `useCompare(): {slugs:string[]; add(slug):boolean; remove(slug):void; clear():void; isFull:boolean}` (max 4, backed by `useStoredList('compare')`).

- [ ] **Step 1: Failing tests:** `parseCompareSlug('hubspot-crm-vs-zoho-crm')` → `['hubspot-crm','zoho-crm']`; `buildCompareSlug(['zoho-crm','hubspot-crm'])` → `'hubspot-crm-vs-zoho-crm'`; validate: one slug → `count`, five → `count`, `['hubspot-crm','hubspot-crm']` → `duplicate`, unknown → `unknown`; `buildRows` marks `differs:false` when all cells equal and `true` otherwise; null values yield "Not verified" text.
- [ ] **Step 2: Implement.** `/compare/[slug]`: `generateStaticParams` from `getPopularComparisons()`; invalid → `notFound()`; non-canonical order → `permanentRedirect` to canonical; sticky product header, side-by-side table with highlighted differences ("Show only differences" toggle), add/remove (navigates to new slug), share (copy link via `navigator.clipboard` with fallback message), related alternatives, `generateMetadata`, canonical. `/compare`: picker with product search, uses `useCompare`, navigates to `/compare/[slug]` once ≥2 selected. `CompareButton` and floating `CompareTray` (in root layout) added to cards from Task 6 and the profile header.
- [ ] **Step 3:** Tests PASS; gate; smoke `/compare /compare/hubspot-crm-vs-zoho-crm`, `--expect 404` for `/compare/hubspot-crm`, `/compare/nope-vs-hubspot-crm`; Playwright: add 4 products from directory, fifth refused with message.

### Task 10: Alternatives

**Files:** Create `lib/alternatives/{score.ts,score.test.ts}`, `app/alternatives/{page,[product]/page}.tsx`

**Interfaces:** `getAlternatives(product:Product, all:Product[], limit=8): {product:Product; score:number; reasons:string[]}[]` weighting shared categories, shared features, pricing model, industries, deployment; never returns the product itself; deterministic tie-break by name.

- [ ] **Step 1: Failing tests:** result excludes the source; two CRMs outrank a non-CRM for `hubspot-crm`; `limit` respected; unknown-pricing products still scored (no throw); ties sorted by name; `reasons` non-empty for every result.
- [ ] **Step 2: Implement** scoring + pages (index lists products with alternatives pages; `[product]` has `generateStaticParams`, cards with logo, description, pricing, key features, compare, profile link, and an "Why it's similar" reasons line). Unknown product → `notFound()`. Gate; smoke.

### Task 11: Reviews area (honest shell)

**Files:** Create `app/reviews/{page,latest/page,helpful/page,write/[product]/page}.tsx`, `app/review-guidelines/page.tsx`, `app/review-verification/page.tsx`, `components/forms/ReviewDraftForm.tsx`, `lib/submissions.test.ts`, `lib/validation.test.ts` (extends `lib/submissions.ts` and `lib/validation.ts` from Task 4)

**Interfaces:** `saveSubmission(kind:'newsletter'|'contact'|'review-draft'|'claim', payload:Record<string,unknown>): {ok:true;id:string}` (storage failure falls back to memory, never throws); zod schemas in `lib/validation.ts`: `reviewDraftSchema` (overall/ease/value/features/support ints 1–5, headline 5–120 chars, pros, cons, experience ≥50 chars, usageLength, jobTitle, companySize, industry), `contactSchema`, `claimSchema`, `newsletterSchema`.

- [ ] **Step 1: Failing tests:** `saveSubmission` survives a throwing `setItem`; each schema rejects the invalid example and accepts a valid one (rating `6`, `0`, `3.5` rejected; headline of 4 chars rejected; email without `@` rejected).
- [ ] **Step 2: Implement.** `/reviews`, `/reviews/latest`, `/reviews/helpful`: honest empty states explaining that verified reviews are published after moderation, with how reviews work. Guidelines and verification pages: real policy copy describing the intended process, worded as policy for launch (not claiming existing verification). Write form per master prompt fields with inline errors and the honest local-storage confirmation. Unknown product → `notFound()`. Gate.

### Task 12: Industries

**Files:** Create `app/industries/{page,[slug]/page}.tsx`

- [ ] **Step 1:** Index of 12 industries; detail (`generateStaticParams`) with intro, recommended categories, products from `getProductsByIndustry`, related guides/articles, industry-specific selection advice (from content), metadata. Unknown slug → `notFound()`. Gate; smoke.

### Task 13: Editorial platform

**Files:** Create `components/editorial/*`, `lib/editorial.ts` (+ `lib/editorial.test.ts`), routes `app/{blog,guides,best-software,research,software-buying-guides}/{page,[slug]/page}.tsx`, `app/resources/page.tsx`

**Interfaces:** `readingTime(blocks:Block[]): number` (200 wpm, minimum 1); `buildToc(blocks:Block[]): {id:string;text:string;level:2|3}[]` (slugified unique ids, same ids rendered on headings); `relatedArticles(article, all, limit=3): Article[]`.

- [ ] **Step 1: Failing tests:** `readingTime` of 450 words → 3, of 0 words → 1; `buildToc` produces unique ids when two headings share text (`-2` suffix) and ignores `p`/`ul`; `relatedArticles` excludes itself and prefers shared category/products.
- [ ] **Step 2: Implement** index pages (featured article + grid + category filter + simple client-side search by title), article page (author card, reading time, table of contents with scroll-spy, related products linking to profiles, share buttons using `https://x.com/intent/tweet`, LinkedIn share URL and copy-link), Article JSON-LD, `generateStaticParams` per kind, `/resources` hub. Gate; smoke.

### Task 14: Vendor marketing, company pages and forms

**Files:** Create `app/vendors/{page,register/page,claim-listing/page,pricing/page,resources/page,success-stories/page}.tsx`, `app/{about,contact,privacy,terms}/page.tsx`, `components/forms/{ContactForm,ClaimListingForm}.tsx` (reuses `NewsletterForm` from Task 4)

- [ ] **Step 1:** Vendors landing (listing benefits, review management, lead generation, analytics, advertising, plans). `/vendors/pricing`: plans shown from a config array in `lib/data/content/plans.ts` flagged "Pricing announced at launch" with no invented prices, and a waitlist form. `/vendors/register` becomes the vendor waitlist/interest form (works via `saveSubmission`); `/vendors/claim-listing` has a product picker + claim form; `/vendors/success-stories` honest "No published stories yet" with what they will contain; `/vendors/resources` real guidance content. No vendor login route.
- [ ] **Step 2:** About, Contact (form), Privacy and Terms with real structure and clear "Draft — review with counsel before launch" notice. Gate; smoke.

### Task 15: SEO infrastructure and saved items page

**Files:** Create/Modify `lib/seo.ts` (+ test), `app/sitemap.ts`, `app/robots.ts`, `app/saved/page.tsx`; extend `next.config.ts` with `redirects()`

**Interfaces:** `siteUrl(path:string): string` (absolute, no double slashes, no trailing slash except root); `canonical(path:string, query?:Record<string,string|undefined>): string` (drops `page`, `sort`, `view`, filters); `buildMetadata({title,description,path,type?}): Metadata`.

- [ ] **Step 1: Failing tests:** `siteUrl('/products/x/')` → `https://faresolution.com/products/x`; `siteUrl('//a')` → `https://faresolution.com/a`; `canonical('/software',{page:'3',sort:'name'})` → `https://faresolution.com/software`; sitemap function returns unique URLs, includes every product/category/industry/article/popular-comparison, excludes `/design`, `/saved` and any `noindex` route.
- [ ] **Step 2: Implement** helpers, retrofit every page's `generateMetadata` to use `buildMetadata`, add sitemap and robots (disallow `/design`, `/saved`, search result URLs with `?q=`), `/saved` (saved products + compare history from local storage, empty states). Update `scripts/smoke.mjs` to accept `--sitemap` to crawl every sitemap URL. Gate; `node scripts/smoke.mjs --sitemap` passes.

### Task 16: Final QA, polish, documentation

- [ ] **Step 1:** Run `node scripts/smoke.mjs --sitemap` and the full gate; fix everything.
- [ ] **Step 2:** Playwright pass at 375 / 768 / 1280 over home, directory, category, product, compare, article, vendors; check no horizontal scroll, keyboard tab order through header/mega menu/filters, visible focus rings, colour contrast of muted text on white (≥4.5:1), image/alt text, console errors none.
- [ ] **Step 3:** Review every page for forbidden content (fake ratings, emoji icons, lorem, dead buttons, `null`/`NaN` text). Fix.
- [ ] **Step 4:** Replace `README.md` with: what this is, how to run, data layer swap point (`lib/data/index.ts`), what is deferred and the roadmap to the master-prompt phases 2–8, deployment on Vercel, and env/credentials note ("none required yet"). Final gate.
