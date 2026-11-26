# React performance labs

Seven labs, one per chapter page. Each is one sentence, one component, and the count it produced.

| lab | chapter | what it settles |
|---|---|---|
| week01/p01-the-same-element | 1 · The Same Element | why a child re-renders, and the two ways to stop it |
| week01/p02-render-commit-paint | 2 · Render, Commit, Paint | four independent counts for one interaction |
| week01/p03-four-causes | 3 · Four Causes | what makes a component render, and how far each cause reaches |
| week02/p04-one-click-one-commit | 4 · One Click, One Commit | where the batch boundary is |
| week02/p05-one-value-every-consumer | 5 · One Value, Every Consumer | who wakes when a provider publishes |
| week02/p06-the-state-that-moved | 6 · The State That Moved | what a key matches, and what it costs to get wrong |
| week02/p07-interruptible-work | 7 · Interruptible Work | renders started, committed, and thrown away |

Run them all:

    npx playwright test -c labs/playwright.config.ts

Tags on each test: `[holds]` the sentence survives measurement, `[partly]` true in one case only,
`[wrong]` measurement contradicts it. A failure after a React upgrade means the sentence has
become wrong, not the test. Retag it; do not edit the expectation.

The shared harness is `labs/_kit/lab.ts`. Each lab is a `README.md` with its measured tables and
a `lab.spec.tsx` with its claims.

Most tests are declared by `claims()` inside the kit, so the reporter prints `_kit/lab.ts` as
their location. Filtering by path still works the normal way:

    npx playwright test -c labs/playwright.config.ts labs/week02/p05-one-value-every-consumer
