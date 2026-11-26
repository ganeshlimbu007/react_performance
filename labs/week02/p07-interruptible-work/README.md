# Ch. 7 — Interruptible work

Four counts per burst, all from the same ten keystrokes 16 ms apart:

- **started** — the expensive list's body ran (counted in the body)
- **committed** — a commit included it (counted in a `useLayoutEffect`, which an abandoned
  render never reaches)
- **thrown away** — started minus committed
- **input-only commits** — total commits minus committed list renders: the moments where the
  keystroke reached the screen without waiting for the list

## One burst, three lanes

300 rows, each doing a fixed slice of real work, memoised on the text it displays.

| lane | started | committed | thrown away | row bodies | DOM records | input-only commits |
|---|---|---|---|---|---|---|
| urgent | 10 | 10 | 0 | 3,000 | 3,010 | **0** |
| `useDeferredValue` | 10 | 1 | **9** | ~1,100 | 310 | **10** |
| `useTransition` | 10 | 1 | **9** | ~1,130 | 312 | **10** |

Each lane is its own component so that only the hooks that lane needs are called: calling
`useDeferredValue` in the urgent lane adds a second commit per keystroke and quietly flatters
the comparison. That mistake was made while building this lab, and the urgent lane read
20 commits until it was fixed.

## What moved

- **The input stopped waiting.** Zero input-only commits became ten. That is the user-facing
  win, and it is a count.
- **The document was written to ten times less**: 3,010 records against 310.
- **Total work went down, not up.** 3,000 row bodies against about 1,100. Deferring did not move
  the same work later; nine of the ten intermediate lists were never needed and never finished.

## Where React can stop

A unit of work is a component. The same burst, the same total work, under `useDeferredValue`:

| shape | started | committed | thrown away | row bodies | DOM records |
|---|---|---|---|---|---|
| 300 child components | 10 | 1 | 9 | ~1,100 | 310 |
| one component with the loop inside it | 10 | **10** | **0** | 3,000 | 3,010 |

Wrapping a single expensive component in a transition changes nothing measurable except which
commit comes first. Breaking the work into components is what makes it interruptible, and that
is a refactor, not a hook.

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C7.3 | "a transition makes the expensive render faster" | **wrong** | every committed render still ran all 300 rows |
| C7.4 | "deferring moves the same work to later" | **wrong** | total row bodies fell from 3,000 to ~1,100 |
| C7.6 | "wrap the slow thing in startTransition" | **wrong** | with the work inside one component, 10 of 10 renders completed and committed |

How far an abandoned render gets before the next keystroke depends on the machine, so the tests
assert the shape — most abandoned, or almost none — and exact counts only where they are
deterministic.
