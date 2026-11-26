# Ch. 6 — The state that moved

A key tells React which sibling this is, between one render and the next. It is not an id, it is
not a prop, and it is not for you: React strips it off the element and the component never sees
it.

## Reorder: three rows with uncontrolled inputs

Type into the top row, then move that row to the end.

| key | mounts | unmounts | Row renders | DOM records | where the typed text ends up |
|---|---|---|---|---|---|
| `key={index}` | 0 | 0 | 3 | 6 | **in the top slot, beside different data** |
| `key={item.id}` | 0 | 0 | 3 | 2 | with the row it was typed into |

Nothing unmounted in either case, and no warning is printed in either case: index keys are
unique and stable, which is all React checks. With index keys React kept the DOM nodes where
they were and rewrote the labels; the `<input>` and everything else the DOM owns stayed with the
slot.

## Insert at the top

| key | mounts | DOM records |
|---|---|---|
| `key={index}` | 1 | 7 |
| `key={item.id}` | 1 | **1** |

Three rows. The shape does not change with length: an insert at the top of a 200-row
index-keyed list rewrites every row's contents.

## A key as a reset

The same mechanism on purpose: one mount, one unmount, uncontrolled DOM state gone. It is the
shortest correct way to reset a form when the record it edits changes.

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C6.3 | "the right keys mean fewer components re-render" | **wrong** | 3 renders either way; keys decide which component and DOM node a render is matched with, not whether the body runs |
