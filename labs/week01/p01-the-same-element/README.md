# Ch. 1 — The same element

Why a component re-renders, in one sentence: its parent made a new element for it.

Three comparisons, three outcomes:

| what React finds in the slot | what it does |
|---|---|
| the same element object as last render | skips the child without looking inside |
| the same type, different props | re-renders in place, keeps the DOM node and its state |
| a different type | unmounts the old subtree and mounts a new one, losing DOM state |

`memo` sits between the first and second rows: it compares this render's props with the previous
render's, key by key with `Object.is`, and skips when they all match.

## Measured

| case | result |
|---|---|
| parent state changes, child takes no props | Parent 1, Child 1 |
| the same child created above and passed as `children` | Parent 1, **Child 0** — no memo involved |
| memo + no props / inline object / inline function / hoisted props | **0 / 1 / 1 / 0** |
| at module scope, one parent press | 0 mounts, the typed text kept |
| declared inside the parent, one parent press | 1 mount, 1 unmount, the typed text gone |

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C1.4 | "wrap the child in `memo` and it stops re-rendering" | **wrong** | 1 render per press while a prop is an inline object or arrow function; 0 only when every prop is stable |
| C1.7 | "declaring a component inside a component is just untidy" | **wrong** | one unmount and one mount per press, and the uncontrolled input lost what was typed into it |
