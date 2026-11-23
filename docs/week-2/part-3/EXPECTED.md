# EXPECTED — open only after RESULTS.md is filled

From the Week 2 book's rig (React 19.3.0 production builds, headless Chromium, 2-core cloud
machine, real input events). Your milliseconds will differ; compare directions and ratios.
Where a line says "direction", the rig did not measure that exact page.

## Shapes
- S1 cascade (60 ms child): derive → 1 heavy render, ~72 ms. useEffect → 2 heavy renders and
  the interaction still ~72 ms, because the passive effect ran synchronously right after the
  click's commit but the update it scheduled got an ordinary lane: a frame was painted with the
  OLD value, then the second commit landed ~60 ms later (a flash INP cannot see).
  useLayoutEffect → 2 heavy renders before the first frame, ~128 ms; the Profiler reports the
  second as phase "nested-update" and the Performance panel shows "Cascading Update".
- S2 remount: a component declared in render remounts instead of rendering — the rig's
  200 rows over two parent updates gave 400 mounts and 0 re-renders, and typed text is lost.
  `module`: 0 mounts. `inline-compiled` ('use memo' on the parent, hook-free inner component):
  the compiler caches the inner function, so its type keeps its identity — the rig's 100 rows
  over one update gave 0 mounts and 100 bailouts. `inline-hooks-compiled`: an inner component
  that calls a hook makes the OUTER component fail to compile ("Hooks must be called at the top
  level in the body of a function component or custom hook, and may not be called within
  function expressions"), so the remounts remain and nothing at runtime says why.
  Lint `react-hooks/static-components` ("Cannot create components during render") flags the
  direct-JSX use (`inline-direct`) but NOT the use inside `.map()` (`inline`).
- S3 lazy declared in render: every parent update commits the fallback again, then the content
  ("fallback, content"); at module scope only "content".
- S4 keys, prepend one row to 1,000 memo rows: index keys → all 1,000 rows re-render, 3,000 text
  (characterData) records + 1 childList, ~8.8 ms; stable ids → 1 mount, 0 re-renders, 1 childList
  record, ~2.1 ms. With index keys the inputs stay with the positions: the first rows show the
  previous row's note, and the last row gets a brand-new input.
- S5 context: inline value → an unrelated bump re-renders the memo'd reader ("Context changed")
  while the memo'd non-reader bails. useMemo'd value → the reader bails on an unrelated bump,
  but changing `user` still re-renders ThemeReader (context has no selectors). Split state and
  dispatch → DispatchButton never re-renders on state changes. Store with selectors → only the
  component selecting `user` re-renders; the theme selector is cloned and bails without its body
  running; setting the same value → 0 commits.
- S6 state bailouts: set 0 on 0 → 0 commits, body not called (eager bailout); set 1 → 1 commit,
  rendered; set 1 again → 1 commit, body called, Profiler says "did not render" (the alternate
  still carried the lane, so the eager path was skipped; render-then-bail); set 1 again →
  0 commits. Reducer noop → every dispatch: 1 commit, body called, "did not render" (no eager
  path for reducers).

## Compiler (babel-plugin-react-compiler 1.0.0)
- C1: plain → Parent, expensive, Child and Price all run on an unrelated bump. Compiled → only
  Parent's body runs: `expensive(q)` is cached on `q`, the inline style and arrow become
  sentinel-initialised constants, and the <Child/> and <Price/> ELEMENTS are cached, so the
  children take the same-element bailout with no memo anywhere. The rig's compiled output for
  this shape used a 15-slot cache (`_c(15)`).
- C2: Control compiles. WritesOutside → CompileError, Immutability ("This value cannot be
  modified"). ReadsRef → CompileError, Refs ("Cannot access refs during render").
  NestedHooks → the outer component is not compiled (the hooks error above). With the default
  panicThreshold the build succeeds and nothing at runtime says so: their Child re-renders on
  every bump, and DevTools shows no Memo badge on them. 'use no memo' would report CompileSkip.

## Paint
- P1 density, 5,000 rows (one click): container font-size class → ~120–160 ms of which React's
  processing was ≤ 7 ms (e.g. 128 = 0.6 + 3.3 + 124.1); with content-visibility → ~32–64 ms
  (median 40). Per-row inline padding → ~56–96 ms (median 64) with React 13–39 ms, and
  content-visibility does NOT help (presentation ~47 vs ~49 ms): it skips off-screen contents,
  not the restyle of elements whose own declarations changed.
- P2 layout thrash, 1,000 boxes: read inside the write loop 0.87–1.7 s per pass; read once then
  write 3–5 ms. per-component: direction — the same quadratic shape, spread across 200 effects.
- P3 5,000 rows: plain mount 91 ms, 20,009 DOM nodes, first forced layout 264 ms, re-render all
  ~30 ms; react-window v2 → mount 2.5 ms, 122 nodes, 0.9 ms. Rows that aren't rendered can't be
  found with find-in-page. Virtualisation is mainly a DOM-size optimisation.
- P4 direction: `state` renders and commits every frame; `left` runs layout and paint every
  frame; `transform` runs on the compositor. With busy=1, `transform` stays smooth while `state`
  and `left` stutter, because only the compositor animation does not need the main thread.
