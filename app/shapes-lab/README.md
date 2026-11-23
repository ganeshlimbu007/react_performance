# Shapes Lab — shapes that multiply renders

Six mechanisms behind most real re-render problems, each isolated on its own
page. Both the slower and the faster shape stay in the code: the comparison is
the exercise.

Every station wraps its measured subtree in `LabProfiler` and counts component
bodies with `count(name)` from the lab kit. The readouts poll their own state as
*siblings* of the measured subtree, so displaying the numbers never re-renders
what is being measured.

---

## The stations

### S1 — effect cascades · `/shapes-lab/cascade`

A button increments `n`; a `Heavy` child with 60 ms of synthetic cost shows a
value derived from it.

| URL | What the code does |
| --- | ------------------ |
| `?mode=derive` | The value is computed during render. |
| `?mode=effect` | The value is state, set inside a `useEffect` keyed on `n`. |
| `?mode=layout-effect` | The same, inside a `useLayoutEffect`. |

The page also runs a **frame logger**: on click it starts a
`requestAnimationFrame` loop for 300 ms and records the child's visible text
each frame, then prints the run-length-encoded sequence.

**Record:** `Heavy` body count, the Profiler's recent phases, the interaction's
three parts, and the frame sequence.

### S2 — components that remount · `/shapes-lab/remount`

200 rows, each an `<li>` with an uncontrolled `<input defaultValue=…>`. Each
variant's parent lives in its own file, so the directives and the compile report
stay unambiguous.

| URL | What the code does |
| --- | ------------------ |
| `?mode=module` | The row component is declared at module scope. |
| `?mode=inline` | Declared inside the parent, calls no hooks, used inside `.map()`. No directive. |
| `?mode=inline-direct` | A hook-free component declared inside the parent and used directly in the returned JSX, not in `.map()`. No directive. |
| `?mode=inline-compiled` | The same code as `inline`, with `'use memo'` starting the parent's body. |
| `?mode=inline-hooks-compiled` | `'use memo'` on the parent, and the inner row component calls `useEffect`. |

Mounts are counted with a **`MutationObserver`** on the list container, not with
an effect — a hook inside the inner component would change what the compiler
does to it, which is the thing being measured.

**Record:** element nodes added per parent update versus row body count, and what
happens to text you typed. Then cross-check with `npm run compiler:report` and
`npm run lint:hooks`.

> Type something into a few of the inputs before you click "Re-render parent".

### S3 — `lazy()` declared in render · `/shapes-lab/lazy-in-render`

A Suspense boundary around a lazy chart, with a button that re-renders the
parent. `?mode=inside` puts the `lazy()` call in the parent's body;
`?mode=module` puts it at module scope. The fallback and the chart each record
their commits in a `useLayoutEffect`.

**Record:** the commit sequence per parent update (`—` marks each update).

### S4 — keys · `/shapes-lab/keys`

1,000 memoised rows, each with an uncontrolled input naming its own row. The
button prepends one row. `?keys=index` or `?keys=id`.

A `MutationObserver` counts DOM mutation records by type (`characterData`,
`childList`, `attributes`) for the last prepend.

**Record:** row body count, records by type, the Profiler's `actualDuration` for
the prepend, and what the inputs show afterwards.

> Type into the first few inputs before prepending.

### S5 — context versus a store · `/shapes-lab/context`

A provider holds `theme`, `user` and an unrelated `tick`. Four memoised
consumers: one reads only `theme`, one only `user`, one reads no context, and
one only dispatches. Buttons: "Bump unrelated state", "Change user", "Set user
to the same value".

| URL | What the code does |
| --- | ------------------ |
| `?mode=inline` | `value={{ theme, user, dispatch }}` written inline. |
| `?mode=memo` | The same object wrapped in `useMemo`. |
| `?mode=split` | Separate contexts for state and for `dispatch`, which comes from `useReducer` and so has a stable identity. |
| `?mode=store` | No context: a small external store read through `useSyncExternalStore`, each reader selecting a primitive. |

**Record:** the per-consumer render table for the last button press, for every
mode × button combination.

### S6 — state bailouts · `/shapes-lab/state-bailouts`

A component with `useState(0)` and "set 0" / "set 1" buttons, and a component
whose reducer returns its current state.

**Record:** commits and body runs for the sequence set 0 → set 1 → set 1 → set 1,
and for repeated reducer noops. Compare the body counter with the Profiler's
flame chart.

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
