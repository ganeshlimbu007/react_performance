# Schedule Lab — when does the work happen?

Five stations about *scheduling*: where work lands relative to the frame. Every
station keeps a slower and a faster way side by side, both reachable by URL —
nothing here is "fixed", because the comparison **is** the exercise.

Write your guesses in `PREDICTIONS.md` first, your measurements in
`RESULTS.md`, and open `EXPECTED.md` only when every row is filled.

---

## The stations

### Station 1 — one keystroke, four ways · `/schedule-lab/keystroke`

400 seeded items; the filtered list shows up to `rows` matches, each costing
`cost` ms of synthetic work. The same list is driven four ways:

| URL | What the code does |
| --- | ------------------ |
| `?mode=sync` | One `useState` holds the query; the input and the list both read it. |
| `?mode=transition` | The input keeps its own urgent state; a second state for the list is set inside `startTransition` in the same `onChange`, with a quiet "updating…" while `isPending`. |
| `?mode=deferred` | The list gets `useDeferredValue(q)` and is wrapped in `memo` declared at module scope. |
| `?mode=deferred-nomemo` | The same deferred value, rendering the plain list. |

Other params: `rows` (default 200, clamped 50–400) and `cost` (default 0.25,
clamped 0–2).

**Record:** worst interaction and its three parts, long tasks, `Row` bodies over
six keystrokes, and commits. Type the same six characters every time: `item-1`.

Add **`?probe=1`** for the flush-order probe. It puts a plain button next to the
input; both the input's `onChange` and the button's `onClick` log `handler`,
queue a microtask, then set state, while the component body logs `render` and a
`useLayoutEffect` without deps logs `commit`. The sequence for the last
interaction is printed on the page. **Record both sequences** — the input's and
the button's.

### Station 2 — a slow tab switch · `/schedule-lab/tabs`

Three tabs; switching renders 200 rows that each burn `cost` ms, with row
content depending on the tab. `?mode=sync` calls `setTab` directly;
`?mode=transition` wraps it in `startTransition` and dims the panel while
`isPending`. The panel is wrapped in a Profiler, so commits per click are
visible.

**Record:** commits for six clicks in each mode, worst interaction, long tasks.

### Station 3 — the Suspense reveal throttle · `/schedule-lab/reveal`

"Show panel A" mounts a Suspense boundary around a lazy panel A. "Switch to B"
swaps the boundary's child to a lazy panel B whose module resolves `delay` ms
after the import starts.

- `?delay=20|50|150|280|400` (default 150)
- `?switch=plain` — a normal `setState`; `?switch=transition` — inside
  `startTransition`
- `?warm=1` — hovering or focusing the switch button starts the same import
  early; the warm-up and the lazy factory share one promise

The page shows *resolved at* and *revealed at*, each in ms after the fallback
committed. In transition mode there may be no fallback at all, in which case it
says so and measures from the click. Marks are written to the Performance
timeline (`reveal-click`, `reveal-fallback-commit`, `reveal-module-resolved`,
`reveal-panelB-commit`).

`lazy` caches its module, so **reload between trials** — the page says so once a
trial has run.

**Record:** revealed-at for each delay, in both switch modes, warm and cold.

### Station 4 — hidden but alive · `/schedule-lab/activity`

Three tabs: Overview, Details, Notes. Details has an 80 ms synthetic render, a
labelled text input with local state, an effect that logs `mount`/`cleanup` with
`performance.now()`, and a `useLayoutEffect` that marks `details-commit`. The
visible panel also marks `visible-commit`.

- `?mode=unmount` — `{tab === 'details' && <Details …/>}`
- `?mode=activity` — every panel stays mounted inside `<Activity>`, with
  `mode="hidden"` for the unselected ones

"Bump version" changes a `version` prop passed to every panel, so you can record
a hidden panel re-rendering while another tab is visible. The HUD counts
component **body executions**, so a hidden render still increments the counter
even though its effects do not run.

**Record:** what happens to the typed text and to the effect on leaving the tab,
in each mode; and whether the hidden render lands before or after the frame for
the visible tab.

### Station 5 — your own long task · `/schedule-lab/yield`

"Build report" processes 5,000 seeded rows in its click handler at 0.03 ms each
(about 150 ms of synthetic work), then sets state with a summary. A labelled
text input sits next to it so you can type during processing.

- `?mode=block` — one synchronous loop
- `?mode=yield` — an async loop with a 50 ms deadline; past the deadline it
  awaits `scheduler.yield()` (falling back to `setTimeout(0)`) and resets the
  deadline
- `?mode=timeout` — the same loop, always yielding with `setTimeout(0)`

The page states whether `scheduler.yield` exists in your browser (Safari lacks
it) and shows progress.

**Record:** INP and total wall-clock time for each mode, plus whether typing
stays responsive.

---

## Measuring protocol

1. **Build.** `npm run build:profile && npm start`. Use a fresh window with no
   other extensions if possible. Never take numbers from `npm run dev`: Strict
   Mode double-calls bodies, so the counters double, and development builds are
   many times slower.
2. **Predict.** Fill `PREDICTIONS.md` for the station before touching it.
3. **Record in DevTools → Performance.**
   - Throttle the CPU: 4×, or the calibrated mid-tier preset.
   - Record **one interaction**, wait a second, then stop.
   - Station 1: always type the same six characters, `item-1`.
   - Read the interaction's three parts first.
   - Then read React's Scheduler track, Blocking or Transition: Update / Render
     / Commit / Remaining Effects.
   - Then read the gap between Commit and the frame.
4. **Repeat.** Do each variant three times, reloading in between, and write the
   **median** in `RESULTS.md`. The HUD's "Copy row" gives the row.
5. **Unthrottled.** Repeat once without CPU throttling. Some conclusions change
   with the CPU.
6. **Check.** Only when every row is filled, open `EXPECTED.md`.

### The HUD

The panel in the bottom-left (clear of the site-wide Web Vitals dashboard in the
bottom-right) shows:

- **Interactions** from the Event Timing API, each split into **input delay +
  processing + presentation**, which add up to the duration. Last six plus the
  worst so far. Note that `duration` is rounded to 8 ms while the parts are not,
  and interactions under 16 ms are not reported at all.
- **Long tasks** count and the worst `long-animation-frame` blocking duration.
  Both are Chromium-only and the HUD says so in other browsers.
- **Counters**: component body executions, and Profiler commits. In a plain
  (non-profiling) build `onRender` never fires, so commits show as
  `— (needs npm run build:profile)` rather than 0.
- **Latest INP attribution** from `web-vitals/attribution`, including
  `loadState` and the longest script's source and invoker.

"Reset" clears the counters and the interaction list between trials. "Copy row"
puts one Markdown row on the clipboard in `RESULTS.md` column order (if the
clipboard is blocked, the row appears in a selectable textarea instead).

---

## Versions

React's App Router runs the React that Next **vendors**, not the version in
`package.json`. That vendored copy is the 19.3 canary
`19.3.0-canary-3f0b9e61-20260317`, which is what exports `Activity` (used by
station 4) and `ViewTransition`; `@types/react` 19.2.x types `Activity`. Do not
upgrade `next`, `react` or `react-dom` to make a station work.

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
