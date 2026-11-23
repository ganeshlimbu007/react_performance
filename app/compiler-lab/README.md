# Compiler Lab — what React Compiler does, and where it says nothing

React Compiler 1.0 is enabled in **annotation mode only**:

```ts
// next.config.ts
reactCompiler: { compilationMode: 'annotation' }
```

A function is compiled **only** when its body starts with the `'use memo'`
directive, so nothing in this repo is compiled by default and
**`app/render-lab/` is entirely unaffected** — Part 1 behaves exactly as it did
before. `grep -rn "use memo" app/render-lab` prints nothing, by design.

`panicThreshold` is left at its default (`'none'`), so a function that cannot be
compiled **fails silently** and the build still succeeds. That is how it behaves
in production, and it is the whole point of C2.

---

## The stations

### C1 — compiled versus plain · `/compiler-lab/parent`

Two identical copies of one component in separate files; only
`ParentCompiled` has the directive. `?compiled=0` renders the plain copy,
`?compiled=1` the annotated one.

`expensive(q)` is counted and burns 2 ms of synthetic cost. `Child` and `Price`
are plain components shared by both copies, and both count their bodies. Neither
is wrapped in `memo`.

**Record:** body counts for `Parent`, `expensive`, `Child` and `Price` per
"Bump unrelated state" click, in both variants.

### C2 — where it says nothing · `/compiler-lab/skips`

Four components, **all** starting with `'use memo'`, each rendering a counted
child and each with its own Bump button:

| Component | What it does |
| --- | --- |
| `Control` | Nothing unusual — the rule-abiding baseline. |
| `WritesOutside` | Writes to a module-level object during render. |
| `ReadsRef` | Reads and increments `ref.current` during render. |
| `NestedHooks` | Declares a component inside itself that calls `useEffect`, and renders it. |

**Record:** each component's child render count per bump. Then check the **React
DevTools Components tab** for the compiler's **Memo** badge, and note which of
the four have it. Finally run the report below and compare.

---

## `npm run compiler:report`

Runs `@babel/core`'s `transformAsync` over every `.tsx` under
`app/compiler-lab/` and `app/shapes-lab/remount/` with:

- `@babel/plugin-syntax-typescript` (`{ isTSX: true }`), and
- `babel-plugin-react-compiler` with
  `{ target: '19', compilationMode: 'annotation', logger: { logEvent } }`.

It prints a table of **file · function · event kind · category or reason**, where
the event kind is `CompileSuccess`, `CompileError`, `CompileSkip` or
`NotCompiled` (no directive in that file). Repeated identical details are
collapsed with a `(×n)` suffix, because the plugin logs one event per error
detail. A `CompileSuccess` row also shows `memoSlots`, which is the size of the
`_c(n)` cache.

The event field names come from the plugin's own types
(`babel-plugin-react-compiler/dist/index.d.ts`): only `CompileSuccess` carries
`fnName`, so names for error and skip events are recovered from the source line.

To read the compiled output for one file:

```bash
npm run compiler:report -- --emit app/compiler-lab/parent/ParentCompiled.tsx
```

That prints the `_c(n)` cache allocation and the
`react.memo_cache_sentinel` slots, so you can see exactly what was cached.

The script **always exits 0**: it is a report to read, not a build gate. It never
visits `app/render-lab/`.

## `npm run lint:hooks`

`eslint.config.mjs` applies `eslint-plugin-react-hooks`'s
`configs.flat.recommended` (all 16 rules) with `@typescript-eslint/parser`,
scoped by `files` to `app/shapes-lab/**`, `app/compiler-lab/**` and
`app/paint-lab/**`, and with `app/render-lab/**` in `ignores`.

Findings inside the labs are **expected** — they are the teaching material — so
the script ends in `|| true` and never fails the shell, and nothing in a lab is
suppressed with a disable comment.

Note that the lint does **not** depend on `'use memo'`: it analyses every
component, so S2's unannotated `inline` and `inline-direct` variants are linted
as they are. Which of them it flags, and which it does not, is part of the
exercise.

Two findings come from this lab's own measurement code rather than from a
planted lesson — the timing `setState`s in `/paint-lab/thrash` and
`/paint-lab/virtual`. They are left visible rather than suppressed, per the same
rule.

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
