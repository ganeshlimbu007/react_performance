# Ch. 4 — One click, one commit

What one interaction costs, in three numbers: how many times a component body runs, how many
times React commits, and how many records reach the document.

## Batching is a property of the task, not of the handler

Three `setState` calls that finish in one task produce one render and one commit, whether they
were made in a React event handler, a `setTimeout` or a resolved promise. The root decides this:
the legacy root could only group updates it started itself.

| case | renders | commits | DOM writes |
|---|---|---|---|
| createRoot · three updates in a handler | 1 | 1 | 3 |
| createRoot · the same three in `setTimeout(0)` | 1 | 1 | 3 |
| createRoot · the same three in a promise | 1 | 1 | 3 |
| legacy root · handler | 1 | 1 | 3 |
| **legacy root · `setTimeout(0)`** | **3** | **3** | 3 |
| three separate `flushSync` calls | 3 | 3 | 3 |
| one `flushSync` around all three | 1 | 1 | 3 |

## A commit is not a DOM write

| case | renders | commits | writes |
|---|---|---|---|
| ten updates to state the view never reads | 20 | 10 | **0** |
| set state to its current value, untouched, ×3 | 0 | 0 | 0 |
| the same, after a real change | 1 | 1 | **0** |

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C4.4 | "`setState` inside a `setTimeout` is not batched" | **wrong** | 1 commit on `createRoot`; 3 only on the legacy root, which React 19 removed |
| C4.11 | "setting state to its current value never re-renders" | **partly** | 0 renders from an untouched value; after a real change the next equal set runs the body once and writes nothing |
| C4.13 | "`<Profiler>` counts your commits in production" | **wrong** | `onRender` never fires on `react-dom.production.min.js`: 0 commits reported while renders read 1 and writes read 3 |

`actualDuration` for the same single commit came back 0.5 ms, then 0.1 ms, then 0 ms. That is the
argument for counting rather than timing, in one line.
