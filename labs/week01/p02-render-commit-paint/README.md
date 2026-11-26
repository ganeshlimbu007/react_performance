# Ch. 2 — Render, commit, paint

Three words for three jobs, done by two programs:

| stage | who does it | what it can be |
|---|---|---|
| render | your function | many, including some that change nothing |
| commit | React | fewer than renders; applies only the difference it found |
| DOM write | React | zero, even after a commit |
| frame | the browser | fewer than writes; three commits in one task share one frame |

## Measured

| case | renders | commits | writes | frames |
|---|---|---|---|---|
| ten updates to state the view never reads | 20 | 10 | **0** | **0** |
| one update | 1 | 1 | 1 | 1 |
| three commits in one task (`flushSync` ×3) | 3 | 3 | 3 | **1** |
| the same three, one per animation frame | 3 | 3 | 3 | **3** |

Each arrow can carry nothing through. That independence is why one count never describes an
interaction, and why "it re-rendered too much" is three different complaints.

## Lab observation, not a claim

Four hundred rows, one commit, four hundred attribute records either way:

| press | DOM records | style and layout forced in the next frame |
|---|---|---|
| change every row's colour | 400 | ~0.6 ms |
| change every row's width | 400 | ~2.3 ms |

The milliseconds move between runs and machines, so nothing asserts them. The point they make is
that the write count is identical and the browser's work is not: a width invalidates geometry and
every line of text has to be measured again.

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C2.5 | "`actualDuration` covers the update appearing on screen" | **wrong** | `onRender` ran in the click's own task, before the browser served a frame |
