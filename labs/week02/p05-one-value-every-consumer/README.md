# Ch. 5 — One value, every consumer

React does not deliver a context value down through props. It tracks which components read which
context and, when a provider's value fails an `Object.is` check against the previous one, it
schedules every reader in that subtree, through any number of `memo` boundaries.

## The two-by-two

Shell with its own state, a provider, a wall, two readers. One press of the shell's button:

| provider value | wall | Shell | Wall | UserBadge | ThemeLabel |
|---|---|---|---|---|---|
| inline object | `memo` | 1 | 0 | **1** | **1** |
| `useMemo` | `memo` | 1 | 0 | 0 | 0 |
| `useMemo` | plain | 1 | 1 | **1** | **1** |
| inline object | plain | 1 | 1 | **1** | **1** |

One row out of four is clean, and it needs both halves. With a plain wall the readers re-render
as ordinary children and the value's identity never gets a say; with an inline value they
re-render as readers even though the wall held.

## Shape of the value

Both halves in place, one context holding `{ user, theme }` against two contexts holding one
thing each. Change the user:

| context shape | Shell | UserBadge | ThemeLabel |
|---|---|---|---|
| one object | 1 | 1 | **1** |
| two contexts | 1 | 1 | **0** |

A context is as coarse as its value. Split along what changes together.

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C5.2 | "wrap the provider value in `useMemo` and consumers stop re-rendering" | **wrong** | unchanged under a plain wall: 1 render each, exactly as before |
| C5.6 | "`memo` protects a consumer from context updates" | **wrong** | the memoised reader ran on every context change; its memoised sibling, which reads nothing, did not |
