# PREDICTIONS — write these before you measure

Answer in numbers where it asks for numbers, and in mechanism where it asks why.
"It'll be faster" is not a prediction.

## Station 1 — one keystroke, four ways (type `item-1`, 4× CPU)
| Mode | Worst interaction (ms) | Long tasks | Row bodies over 6 keys | Commits over 6 keys |
| ---- | ---------------------- | ---------- | ---------------------- | ------------------- |
| sync |  |  |  |  |
| transition |  |  |  |  |
| deferred |  |  |  |  |
| deferred-nomemo |  |  |  |  |

- Which of the three interaction parts will dominate in `sync`, and why?
- What exactly does `deferred-nomemo` render in the urgent pass?
- With `probe=1`: the order of handler / render / commit / microtask for the input, and for the button.

## Station 2 — tab switch (6 clicks)
- Commits for 6 clicks in `sync` and in `transition`, and why they differ.
- What does `isPending` cost, and in which lane does it commit?

## Station 3 — reveal throttle
- `switch=plain`, `delay=20`: when does panel B appear, measured from the fallback appearing?
- Same at `delay=280` and `delay=400`.
- What changes with `switch=transition`? With `warm=1`?

## Station 4 — Activity
- In each mode: what happens to the text typed in Details, and to its effect, when you leave the tab?
- After "Bump version" with Details hidden: does Details re-render before or after the frame for the visible tab?

## Station 5 — yielding
- INP and total time for `block`, `yield`, `timeout`.
- What happens in a browser without `scheduler.yield`?
