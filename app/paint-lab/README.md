# Paint Lab — the browser's half

Style, layout and paint cost that React's own tools cannot see. React's
Profiler can tell you a commit took 3 ms and be entirely correct while the
interaction takes 130 ms — the rest is the browser's half, and it lands in the
HUD's **presentation** number.

So on these stations, read the interaction's three parts first, then look at
what the main thread actually did in the Performance panel: **Recalculate
Style**, **Layout**, **Pre-paint**, **Paint**.

The five `.pl-*` CSS rules are written exactly as the brief specifies them —
the sealed expectations were measured against that markup and CSS, so do not
restyle them to match the site theme.

---

## The stations

### P1 — density · `/paint-lab/density`

5,000 seeded rows, each a flex row with a name and an email. One click toggles
the density.

| URL | What the code does |
| --- | ------------------ |
| `?change=container` | Rows are `memo`'d and take only the row object; the button toggles a font-size class (`pl-dense`) on the list container. |
| `?change=rows` | Rows are **not** memoised, receive `dense`, and each sets its own inline `padding`. |
| `&cv=1` | Adds `pl-cv` to the container: `content-visibility: auto` with `contain-intrinsic-size: auto 29px`. |

**Record:** the total interaction and its three parts for all four combinations
(container/rows × cv on/off). Then ask which combination `content-visibility`
does *not* help, and why.

### P2 — layout thrashing · `/paint-lab/thrash`

1,000 boxes inside a 600 px wrapper; a pass sets every box's width from the
wrapper's width. Each pass is timed with `performance.now()`.

| URL | What the code does |
| --- | ------------------ |
| `?mode=interleave` | Reads `wrapper.offsetWidth` **inside** the write loop. |
| `?mode=batch` | Reads once, then writes all. |
| `?mode=per-component` | 200 child components each read the wrapper and write their own box in a `useLayoutEffect` when a "Reposition" button bumps a version. The React-shaped version of the same mistake. |

**Record:** ms per pass for each mode.

### P3 — virtualisation versus DOM size · `/paint-lab/virtual`

5,000 rows with three spans each. `?mode=plain` renders every row;
`?mode=window` uses `react-window` 2's `List` (row height 24, viewport 600).

The page shows mount time (a mark before render and one in the list's layout
effect), the DOM node count inside the list, and the time for "Change theme",
which re-renders every visible row.

**Record:** mount ms, DOM nodes, theme-change ms, for both modes.

> Use the browser's find-in-page to search for the last row's name in both modes.

### P4 — animation · `/paint-lab/animate`

A 48 px box moves back and forth across 400 px for 3 seconds after "Play".

| URL | What the code does |
| --- | ------------------ |
| `?mode=state` | `setX` on every `requestAnimationFrame`, rendered as `style={{ left: x }}`. A render counter is shown. |
| `?mode=left` | A CSS keyframe animation on `left`. |
| `?mode=transform` | A CSS keyframe animation on `transform: translateX()`. |
| `&busy=1` | Also runs 30 ms of synthetic cost every 100 ms during the animation. |

**Record:** which modes stay smooth with `busy=1` and which stutter, and what
the Performance panel shows for each (renders and commits, layout and paint, or
neither).

---
## Measuring protocol

1. **Build.** `npm run build:profile && npm start`. Use a fresh window with no
   other extensions if possible. Never take numbers from `npm run dev`: Strict
   Mode double-calls bodies, so the counters double, and development builds are
   many times slower.
2. **Predict.** Fill `docs/week-2/part-3/PREDICTIONS.md` for the station before
   touching it.
3. **Record in DevTools → Performance.**
   - Throttle the CPU: 4×, or the calibrated mid-tier preset.
   - Record **one interaction**, wait a second, then stop.
   - Read the interaction's three parts first.
   - Then read React's Scheduler track, Blocking or Transition: Update / Render
     / Commit / Remaining Effects.
   - Then read the gap between Commit and the frame.
4. **Repeat.** Do each variant three times, reloading in between, and write the
   **median** in `docs/week-2/part-3/RESULTS.md`. The HUD's "Copy row" gives a
   row you can paste.
5. **Unthrottled.** Repeat once without CPU throttling. Some conclusions change
   with the CPU.
6. **Check.** Only when every row is filled, open
   `docs/week-2/part-3/EXPECTED.md`.

## Versions

React's App Router runs the React that Next **vendors**, not the version in
`package.json` — the vendored copy is the 19.3 canary
`19.3.0-canary-3f0b9e61-20260317`. Do not upgrade `next`, `react`, `react-dom`
or `typescript`.

| Package | Version |
| ------- | ------- |
| `next` | 16.2.9 |
| `react` / `react-dom` (package.json) | 19.2.4 |
| React actually running (vendored by Next) | 19.3.0-canary-3f0b9e61-20260317 |
| `@types/react` | 19.2.17 |
| `typescript` | 5.9.3 |
| `babel-plugin-react-compiler` (dev) | 1.0.0 |
| `@babel/core` (dev) | 7.29.13 |
| `@babel/plugin-syntax-typescript` (dev) | 7.29.7 |
| `eslint` (dev) | 10.15.0 |
| `eslint-plugin-react-hooks` (dev) | 7.1.1 |
| `@typescript-eslint/parser` (dev) | 8.73.0 |
| `react-window` | 2.5.4 |
| `web-vitals` | 6.2.3 |
