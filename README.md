# React Performance Lab ⚡

A single Next.js (App Router) playground for testing:

1. **The 3 Core Web Vitals** — LCP, CLS, INP — measured live and shown in an
   on-screen dashboard.
2. **Every major rendering technique** — CSR, SSR, SSG, ISR, and React Server
   Components.

Built with **Next.js 16 + React 19 + TypeScript**.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000  (development)
```

For **realistic performance numbers**, always test a production build — dev mode
adds overhead and disables real static caching / ISR:

```bash
npm run build
npm start            # http://localhost:3000  (production)
```

## Core Web Vitals

A floating dashboard (bottom-right) reports metrics in real time using Next.js's
`useReportWebVitals` hook. Full payloads are also logged to the browser console.

| Metric | Meaning | "Good" threshold |
| ------ | ------- | ---------------- |
| **LCP** | Largest Contentful Paint (loading) | ≤ 2.5 s |
| **CLS** | Cumulative Layout Shift (visual stability) | ≤ 0.1 |
| **INP** | Interaction to Next Paint (responsiveness) | ≤ 200 ms |

> INP replaced FID as a Core Web Vital in March 2024. FCP, TTFB and FID are also
> reported as supporting metrics.

Visit **`/vitals-lab`** to deliberately trigger each metric:

- **LCP** — toggle a large hero element.
- **CLS** — inject a banner that shoves content down.
- **INP** — run a 300 ms main-thread-blocking task on click.

The metric dots are colour-coded: 🟢 good · 🟡 needs improvement · 🔴 poor.

## Rendering techniques

| Route | Technique | How it's configured | What to observe |
| ----- | --------- | ------------------- | --------------- |
| `/csr` | **Client-Side Rendering** | `'use client'` + `fetch` in `useEffect` | "Loading…" flash on each reload |
| `/ssr` | **Server-Side Rendering** | `export const dynamic = 'force-dynamic'` | Timestamp changes on every reload |
| `/ssg` | **Static Site Generation** | `export const dynamic = 'force-static'` | Timestamp frozen at build time |
| `/isr` | **Incremental Static Regeneration** | `export const revalidate = 10` | Updates at most once per 10 s |
| `/products` + `/products/[id]` | **Incremental Static Generation** | `generateStaticParams` + `dynamicParams` | IDs 1–3 prebuilt; IDs 4+ generated on first visit, then cached |
| `/streaming` | **Streaming SSR** | independent `<Suspense>` boundaries | Shell paints instantly; widgets stream in separately |
| `/server-component` | **React Server Components** | `async` server component + client island | Only the Like button ships JS |

Run `npm run build` and watch the route summary — Next.js labels each route as
`○ (Static)` or `ƒ (Dynamic)` and shows the ISR revalidate window, confirming
the strategy each page uses.

## Project structure

```
app/
├── layout.tsx                  # Root layout: mounts vitals reporter + dashboard + nav
├── page.tsx                    # Home dashboard linking to every demo
├── globals.css                 # All styling
├── api/time/route.ts           # Dynamic route handler used by the CSR demo
├── components/
│   ├── WebVitalsReporter.tsx   # useReportWebVitals → CustomEvent bridge
│   ├── VitalsDashboard.tsx     # Live LCP/CLS/INP readout
│   ├── RenderInfo.tsx          # Shared "how this rendered" panel
│   └── Nav.tsx                 # Top navigation
├── csr/page.tsx                # CSR demo
├── ssr/page.tsx                # SSR demo
├── ssg/page.tsx                # SSG demo
├── isr/page.tsx                # ISR demo
├── server-component/           # RSC demo (+ LikeButton client island)
└── vitals-lab/page.tsx         # Interactive LCP / CLS / INP triggers
```

## Suggested testing workflow

1. `npm run build && npm start`.
2. Open DevTools → Console (full vitals payloads) and the Lighthouse panel.
3. Visit each rendering route and reload a few times to see the timestamp
   behaviour described above.
4. Open `/vitals-lab` and trigger LCP / CLS / INP while watching the dashboard.
