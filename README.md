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

### Profiling React

To use the **React DevTools Profiler** or React's tracks in the Performance
panel, you need a profiling build:

```bash
npm run build:profile && npm start
# equivalently:
npm run build -- --profile      # the extra `--` makes npm forward the flag
```

A plain `npm run build` compiles React's profiling timing out of the bundle, so
the Profiler reports "Profiling not supported" and React writes nothing to the
Performance panel's React tracks.

Two more scripts are available:

```bash
npm run analyze      # next experimental-analyze --output → .next/diagnostics/analyze
npm run typecheck    # tsc --noEmit
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

## Performance labs

Hands-on stations for profiling. Each lab has its own README, worksheets, and a
sealed expected-answers file you open only after recording your own numbers.

Start at **`/week-2`**, which lists the whole week in order.

| Route | Lab | What it exercises |
| ----- | --- | ----------------- |
| `/week-2` | Index | The week in order, with what each lab is for |
| `/render-lab` | Render Lab | Why components re-render — React DevTools Profiler (see `app/render-lab/README.md`) |
| `/schedule-lab/keystroke` | Schedule Lab · station 1 | One keystroke four ways: `sync`, `transition`, `deferred`, `deferred-nomemo` |
| `/schedule-lab/tabs` | Schedule Lab · station 2 | A slow tab switch, `sync` vs `transition` |
| `/schedule-lab/reveal` | Schedule Lab · station 3 | The Suspense reveal throttle, with optional warm-up |
| `/schedule-lab/activity` | Schedule Lab · station 4 | `<Activity>` vs unmounting a hidden tab |
| `/schedule-lab/yield` | Schedule Lab · station 5 | Your own long task: `block`, `yield`, `timeout` |
| `/load-lab/markdown-client` | Load Lab · station 1 | Markdown rendered in a client component |
| `/load-lab/markdown-server` | Load Lab · station 2 | The same markdown rendered on the server |
| `/load-lab/hydration` | Load Lab · station 3 | Hydration cost, `mode=client` vs `mode=server` |
| `/load-lab/lazy-editor` | Load Lab · station 4 | A lazy client chunk, cold vs warmed on hover |
| `/shapes-lab/cascade` | Shapes Lab · S1 | Deriving in render vs `useEffect` vs `useLayoutEffect`, with a frame logger |
| `/shapes-lab/remount` | Shapes Lab · S2 | A row component declared at module scope vs inside the parent, compiled or not |
| `/shapes-lab/lazy-in-render` | Shapes Lab · S3 | `lazy()` called in the parent body vs at module scope |
| `/shapes-lab/keys` | Shapes Lab · S4 | Prepending a row to 1,000 memo rows, keyed by index vs id |
| `/shapes-lab/context` | Shapes Lab · S5 | Inline vs memoised vs split context, vs an external store with selectors |
| `/shapes-lab/state-bailouts` | Shapes Lab · S6 | `setState` to the same value, and a reducer noop |
| `/compiler-lab/parent` | Compiler Lab · C1 | The same component with and without `'use memo'` |
| `/compiler-lab/skips` | Compiler Lab · C2 | Annotated components that silently fail to compile |
| `/paint-lab/density` | Paint Lab · P1 | A density change on the container vs on every row, ± `content-visibility` |
| `/paint-lab/thrash` | Paint Lab · P2 | Layout thrashing: interleaved reads, batched reads, or per-component |
| `/paint-lab/virtual` | Paint Lab · P3 | 5,000 rows in full vs through `react-window` |
| `/paint-lab/animate` | Paint Lab · P4 | Animating via state, `left`, or `transform`, with a busy main thread |

Profile the labs with `npm run build:profile && npm start`. The measuring
protocol lives in each lab's README (`app/schedule-lab/`, `app/load-lab/`,
`app/shapes-lab/`, `app/compiler-lab/`, `app/paint-lab/`), the Part 3
worksheets in `docs/week-2/part-3/`, and the week's write-up template in
`PERFORMANCE.md`.

### React Compiler

`next.config.ts` enables React Compiler 1.0 in **annotation mode only**
(`reactCompiler: { compilationMode: 'annotation' }`), so a function is compiled
only when its body starts with the `'use memo'` directive. Nothing is compiled
by default and `app/render-lab/` is entirely unaffected.

```bash
npm run compiler:report            # what compiled, what failed, and why
npm run compiler:report -- --emit app/compiler-lab/parent/ParentCompiled.tsx
npm run lint:hooks                 # react-hooks rules over the Part 3 labs
```

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
├── products/                   # Incremental SSG (generateStaticParams)
├── streaming/page.tsx          # Streaming SSR with <Suspense>
├── server-component/           # RSC demo (+ LikeButton client island)
├── vitals-lab/page.tsx         # Interactive LCP / CLS / INP triggers
├── render-lab/                 # Profiler exercise (own README + worksheets)
├── _lab-kit/                   # Private folder — not a route
│   ├── burn.ts                 # Deterministic synthetic cost (busy-wait)
│   ├── seeded.ts               # Seeded PRNG + makeItems()
│   ├── counters.ts             # Body-execution counters (also window.__lab)
│   ├── LabProfiler.tsx         # <Profiler> wrapper: commits + durations
│   └── InteractionHUD.tsx      # Event Timing / LoAF / counters / INP panel
├── schedule-lab/               # Scheduling stations + worksheets
│   ├── keystroke/  tabs/  reveal/  activity/  yield/
│   └── README.md · PREDICTIONS.md · RESULTS.md · EXPECTED.md
├── load-lab/                   # Load stations + worksheets
│   ├── markdown-client/  markdown-server/  hydration/  lazy-editor/
│   ├── content.ts              # Deterministic ~25–30 KB markdown
│   └── README.md · LOAD.md · EXPECTED.md
├── shapes-lab/                 # Shapes that multiply renders
│   ├── cascade/  remount/  lazy-in-render/  keys/  context/  state-bailouts/
│   ├── Readout.tsx             # Polls counters/Profiler as a sibling
│   └── README.md
├── compiler-lab/               # React Compiler, annotation mode
│   ├── parent/  skips/
│   └── README.md
├── paint-lab/                  # Style, layout and paint
│   ├── density/  thrash/  virtual/  animate/
│   ├── data.ts                 # 5,000 seeded rows
│   └── README.md
└── week-2/page.tsx             # The week in order

scripts/compiler-report.mjs     # npm run compiler:report
eslint.config.mjs               # npm run lint:hooks (ignores render-lab)
instrumentation-client.ts       # Repo root: web-vitals INP attribution
docs/week-2/part-3/             # PREDICTIONS.md · RESULTS.md · EXPECTED.md
PERFORMANCE.md                  # The week's write-up template
```

## Suggested testing workflow

1. `npm run build:profile && npm start` (use `npm run build` only when you do
   not need the React Profiler).
2. Open DevTools → Console (full vitals payloads) and the Lighthouse panel.
3. Visit each rendering route and reload a few times to see the timestamp
   behaviour described above.
4. Open `/vitals-lab` and trigger LCP / CLS / INP while watching the dashboard.
