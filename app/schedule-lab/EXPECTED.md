# EXPECTED — open only after RESULTS.md is filled

These are the measurements from the Week 2 book's rig: React 19.3.0 production builds in
headless Chromium on a 2-core cloud machine, real input events, CPU throttling over CDP.
Your machine will give different milliseconds. Compare **directions and ratios**, not values.

## Station 1 — one keystroke, four ways (400 items, up to 200 rows, 0.25 ms per row, six keys)
| Mode | Worst at 1× | Worst at 4× | Long tasks (1×) | Row bodies (1×) | Commits |
| ---- | ----------- | ----------- | --------------- | --------------- | ------- |
| sync | 72 ms | 168 ms | 5 | 1,054 | 6 |
| transition | none ≥ 16 ms reported | 32 ms | 0 | 805 (260 at 4×) | 7 |
| deferred + memo | none ≥ 16 ms reported | 32 ms | 0 | 804 (259 at 4×) | 7 |
| deferred, no memo | 72 ms | 160 ms | 6 | 2,011 | 7 (12 list renders) |

- One sync keystroke read as: duration 64 = input delay 0.1 + processing 63.0 + presentation ~1.
  The synchronous render is inside the event's processing time, so it holds the frame.
- Transition and deferred: 7 commits for 6 keys = 6 urgent commits for the input + 1 background
  commit for the list; 5 background renders were started and abandoned. At 4× CPU the abandoning
  cut row bodies from ~805 to ~260 (a quarter of sync).
- Deferred without memo doubled the work: the list rendered in the urgent pass with the OLD value
  and again in the background pass with the new one.
- A background transition render (5 ms slices) added up to ~4.5 ms of input delay to the next key.
- Flush order (`probe=1`), real key press and real click, production build:
  input onChange → handler → render → commit → your microtask
  (React flushes at the end of its own listener: `finishEventHandler` → `flushSyncWork()`);
  button onClick → handler → your microtask → render → commit (React's microtask).
  Both are inside the event's dispatch, so both count as processing.

## Station 2 — tab switch (200 rows, six clicks)
- sync: 64–72 ms per click, 6 long tasks, 6 commits.
- transition: ~16 ms, 0 long tasks, 12 commits. `isPending` is an optimistic update in SyncLane
  that commits first; the result commits later in a transition lane. Same total work.

## Station 3 — reveal throttle
- Once a fallback is on screen, React holds a content reveal until 300 ms after the fallback
  appeared (`FALLBACK_THROTTLE_MS = 300`; it was 500 in React 18.3.1).
- Module resolving 20 / 50 / 150 / 280 ms after the fallback → content at ~300 ms every time;
  400 ms → ~402 ms.
- `switch=transition`: panel A stays on screen until B is ready; no fallback, no throttle.
- `warm=1`: starting the import on hover moves "resolved" earlier; if it resolves before the
  click, there is nothing to wait for.

## Station 4 — Activity (80 ms child)
- Hidden: state and DOM kept (display: none), effects cleaned up in the same commit;
  revealed: effects re-created. `mode=unmount` loses the typed text.
- Bump while hidden: the visible part commits, the frame is painted, and only then does the
  hidden subtree render (its 80 ms land after the frame, at lower priority).

## Station 5 — yielding
- Not measured by the book's rig for this handler. Expected direction from the mechanism:
  `block` is one long task about the size of the whole job, so INP ≈ the job;
  `yield` splits it into ≤ ~50 ms tasks, so INP ≈ one chunk, while total time grows a little;
  `timeout` behaves like `yield` but continuations can be overtaken by other queued tasks.
  Without `scheduler.yield` (Safari), the helper falls back to `setTimeout`.
