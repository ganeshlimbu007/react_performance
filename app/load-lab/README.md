# Load Lab — what must arrive before anything works?

Four stations about *load*: client JS per route, the server boundary, code
splitting, and hydration. As in the schedule lab, both the heavier and the
lighter way stay in the code — the comparison is the exercise.

Fill `LOAD.md` from the analyzer and DevTools, and open `EXPECTED.md` only when
every row is filled.

---

## The stations

### Station 1 — markdown on the client · `/load-lab/markdown-client`

A `force-static` server shell renders `<ClientArticle />`, a `'use client'`
component that imports `marked` and `sanitize-html` and builds the sanitised
HTML in the browser. This is the deliberate "everything client" case, and it
says so in a comment at the top of the file.

### Station 2 — markdown on the server · `/load-lab/markdown-server`

The same content (`content.ts`) and the same CSS, but the page itself — a server
component — imports both libraries and renders the sanitised HTML. Also
`force-static`. One tiny client island ("Copy link to this page") keeps the
route hydrating something, so it is not an empty-vs-nonempty comparison.

**Record:** the client JS for each route and the import chain that pulls
`sanitize-html` in — or the fact that it does not appear at all.

### Station 3 — hydration · `/load-lab/hydration`

One identical client island at the top, a "Mark all read" button that only
updates a counter inside itself, above 1,000 cards.

- `?mode=client` — each card is a client component with a small `useState`
  toggle and 0.05 ms of synthetic cost in its body, so all 1,000 are hydrated
- `?mode=server` — the same markup as server components, with no per-card
  client code

The island's own work is negligible in both modes. What you are measuring is how
long a click has to **wait**: click "Mark all read" **as soon as the page
appears**, with the CPU throttled (6×). The HUD and the console show the input
delay and the `loadState` at the time of the interaction.

**Record:** INP and its three parts, and `loadState`, for each mode.

### Station 4 — a lazy editor chunk · `/load-lab/lazy-editor`

"Open editor" mounts a module-scope `lazy(() => import('./Editor'))` inside
Suspense. `Editor` is a client component with a textarea and a live preview
using `marked` and `sanitize-html`, so it is a meaningful chunk.

- `?warm=0` — the import starts on click
- `?warm=1` — `pointerenter`/`focus` on the button starts the same import
  early; the warm-up and the lazy factory share one promise

Click → editor committed is recorded with `performance.mark`
(`editor-import-start`, `editor-click`, `editor-commit`) and shown on screen.
Throttle the network to **Slow 4G** before trying this, and reload between
trials — `lazy` caches its module.

**Record:** click → editor visible, cold and warmed.

---

## Running the analyzer

1. `npm run analyze` — runs `next experimental-analyze --output`, which writes
   `.next/diagnostics/analyze` and does **not** start the analyzer server. (Drop
   the `--output` flag, i.e. `npx next experimental-analyze`, if you would rather
   browse it on `localhost:4000` directly.)
2. Keep a copy you can compare against later:

   ```bash
   mkdir -p perf && cp -r .next/diagnostics/analyze perf/analyze-<label>
   ```

   `perf/` is git-ignored — do not commit analyzer output.
3. In the analyzer UI, **filter by route** and by **client**, then find the
   **import chain** that brings `sanitize-html` into each route. The analyzer
   traces imports across the server-to-client boundary and through dynamic
   imports, which is exactly what distinguishes stations 1, 2 and 4.

For the interaction numbers, use DevTools → Performance with CPU throttling, and
read the HUD in the bottom-left (it is clear of the site-wide Web Vitals
dashboard in the bottom-right). `instrumentation-client.ts` logs
`[inp-attribution]` to the console with `loadState`, the three INP parts, and the
longest script's source and invoker.

---

## Versions

React's App Router runs the React that Next **vendors**, not the version in
`package.json` — the vendored copy is the 19.3 canary
`19.3.0-canary-3f0b9e61-20260317`. Do not upgrade `next`, `react` or `react-dom`.

Installed when these labs were written:

| Package | Version |
| ------- | ------- |
| `next` | 16.2.9 |
| `react` / `react-dom` (package.json) | 19.2.4 |
| React actually running (vendored by Next) | 19.3.0-canary-3f0b9e61-20260317 |
| `@types/react` | 19.2.17 |
| `web-vitals` | 6.2.3 |
| `marked` | 18.2.1 |
| `sanitize-html` | 2.18.2 |
| `@types/sanitize-html` (dev) | 2.16.2 |
| `typescript` | ^5 |
