# React performance labs · Weeks 1–2

One file. Seven labs, fifty-two claims, one shared harness. Drop it into
`ganeshlimbu007/react_performance`, run the extractor, run the suite.

Every expectation in here was measured before it was written down. The files below were then
extracted into a scratch repo and run as printed: **52 passed in 43.9s**, Playwright 1.65.1,
headless Chromium 1243, with `react-dom@19.2.4` installed for C4.12. Nothing here is a guess.

---

## Install and run

````bash
# 1 · write the files (fenced blocks below are marked `file=<path>`)
node extract-labs.mjs LABS-WEEK01-02.md

# 2 · once
npm i -D @playwright/test@1.65.1
npx playwright install --with-deps chromium

# 3 · the whole suite, or one lab
npx playwright test -c labs/playwright.config.ts
npx playwright test -c labs/playwright.config.ts labs/week02/p07-interruptible-work
````

The specs fetch React 18.3.1's UMD **profiling** build from jsDelivr at test time. To run with no
network, vendor it once and point `LAB_VENDOR` at the folder:

````bash
mkdir -p labs/.vendor && cd labs/.vendor
npm pack react@18.3.1 react-dom@18.3.1
for t in *.tgz; do tar xzf "$t"; done
mv package/umd/*.min.js . 2>/dev/null; cp -r react*/umd/*.min.js . 2>/dev/null; rm -rf package react react-dom *.tgz
cd ../..
LAB_VENDOR=labs/.vendor npx playwright test -c labs/playwright.config.ts
````

Add `labs/.vendor/` and `labs/test-results/` to `.gitignore`.

---

## Why these labs run React 18 and the repo runs React 19

The chapter pages and these labs both use React 18.3.1's UMD build, because UMD builds were
dropped in React 19 and a page or a `setContent` harness with no bundler cannot load 19 at all.
Everything measured here is behaviour React 19 kept, with one deliberate exception that is itself
a claim: C4.12 imports the repo's own installed `react-dom` and asserts that the legacy root is
gone.

When a test fails after a React upgrade, **the test is right and the sentence has become wrong**.
Retag the claim in that lab's README, move it into the corrections table with the value the
browser actually gave, and leave `expect` matching reality. Never edit an expectation to make a
test pass.

---

## What the instrument counts

| counter | how | why it is trustworthy |
|---|---|---|
| **renders** | a line in the component body | runs even when the render is later discarded |
| **commits** | `<Profiler onRender>` | React's own ground truth, with the mount/update phase |
| **committed** (ch. 7) | `useLayoutEffect` in the heavy component | an abandoned render never reaches it |
| **mounts / unmounts** | a mount effect and its cleanup | exact, and the only honest way to see a remount |
| **DOM writes** | `MutationObserver` on the root container | records that actually reached the document |
| **frames** (ch. 2) | a `requestAnimationFrame` ticker beside the observer | a write made in one task is always seen before the next frame |

Counts, not milliseconds. A count is the same number on a laptop and on a four-year-old phone,
which is what makes it assertable. The one place a duration appears is as evidence against
itself: the same single commit on the chapter 4 page reported 0.5 ms, then 0.1 ms, then 0 ms.

Two traps that this harness exists to avoid, both of which produced wrong numbers while it was
being built:

- `<Profiler onRender>` **never fires** on `react-dom.production.min.js`. The commit counter reads
  zero with no warning while renders and DOM writes keep working. C4.13 asserts it.
- Calling `useDeferredValue` in a lane that does not use it adds a second commit per keystroke.
  Chapter 7 gives each lane its own component for this reason.

No `StrictMode` anywhere: it double-invokes component bodies in development and would double
every render count.

---

## The corrections ledger

The point of the whole set. Each row is a sentence people repeat, and what the browser said.

| id | the sentence | verdict | measured |
|---|---|---|---|
| C1.4 | "wrap the child in `memo` and it stops re-rendering" | **wrong** | 1 render per parent press while a prop is an inline object or arrow function |
| C1.7 | "declaring a component inside a component is just untidy" | **wrong** | 1 mount and 1 unmount per parent press; the uncontrolled input lost its text |
| C2.5 | "`actualDuration` covers the update appearing on screen" | **wrong** | `onRender` always ran before the first frame after the click |
| C3.5 | "a component re-renders when its props change" | **wrong** | 5 renders out of 5 with every prop identical |
| C4.4 | "`setState` inside a `setTimeout` is not batched" | **wrong** | 1 commit on `createRoot`; 3 only on the legacy root, which React 19 removed |
| C4.11 | "setting state to its current value never re-renders" | **partly** | 0 renders from an untouched value; 1 render and 0 writes for the equal set after a real change |
| C4.13 | "`<Profiler>` counts your commits in production" | **wrong** | 0 commits reported while renders read 1 and DOM writes read 3 |
| C5.2 | "wrap the provider value in `useMemo` and consumers stop re-rendering" | **wrong** | unchanged under a plain wall: 1 render each, exactly as before |
| C5.6 | "`memo` protects a consumer from context updates" | **wrong** | the memoised reader ran on every context change |
| C6.3 | "the right keys mean fewer components re-render" | **wrong** | 3 renders either way |
| C7.3 | "a transition makes the expensive render faster" | **wrong** | every committed render still ran all 300 rows |
| C7.4 | "deferring moves the same work to later" | **wrong** | total row bodies fell from 3,000 to ~1,100 |
| C7.6 | "wrap the slow thing in `startTransition`" | **wrong** | with the loop inside one component, 10 of 10 renders completed and committed |

---

## The files

````txt file=labs/README.md
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
````

````ts file=labs/_kit/lab.ts
import { test, expect, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export { test, expect };
export type { Page };

/** The verdict on the SENTENCE as it is usually stated, not on the code. */
export type Verdict = 'holds' | 'partly' | 'wrong';

export type Claim = {
  id: string;
  say: string;
  book: Verdict;
  run: (page: Page) => Promise<unknown>;
  expect: unknown;
};

const VENDOR = process.env.LAB_VENDOR;

/**
 * React 18.3.1 UMD. The profiling build is production code with the Profiler's timers
 * compiled in; on react-dom.production.min.js, onRender never fires at all (C4.13).
 * UMD builds were dropped in React 19, which is why these labs pin 18.
 */
export function src(name: string) {
  if (VENDOR && existsSync(resolve(VENDOR, name))) return { path: resolve(VENDOR, name) };
  const pkg = name.startsWith('react-dom') ? 'react-dom' : 'react';
  return { url: `https://cdn.jsdelivr.net/npm/${pkg}@18.3.1/umd/${name}` };
}

/** Two frames and a tick: enough for a sync commit and its MutationObserver records. */
export const settle = (page: Page) =>
  page.evaluate(() => new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 20)))));

export type BootOptions = {
  /** the container markup the harness mounts into */
  html: string;
  /** the harness source: mounts the subjects and exposes window.__lab */
  harness: string;
  /** anything that has to run before React loads */
  pre?: string;
  build?: 'profiling' | 'production';
};

export async function boot(page: Page, o: BootOptions) {
  const build = o.build ?? 'profiling';
  await page.setContent(o.html);
  if (o.pre) await page.addScriptTag({ content: o.pre });
  await page.addScriptTag(src(`react.${build}.min.js`));
  await page.addScriptTag(src(`react-dom.${build}.min.js`));
  await page.addScriptTag({ content: o.harness });
  await page.waitForFunction('window.__ready === true');
  await settle(page);
}

/** Call a method the harness put on window.__lab. */
export function lab<T = unknown>(page: Page, fn: string, ...args: unknown[]) {
  return page.evaluate(
    ([f, a]) => (window as unknown as { __lab: Record<string, (...x: unknown[]) => unknown> }).__lab[f as string](...(a as unknown[])),
    [fn, args] as const,
  ) as Promise<T>;
}

/** Click a button by id, n times, letting each update settle. */
export async function press(page: Page, id: string, times = 1, gap = 50) {
  for (let i = 0; i < times; i++) {
    await page.click('#' + id);
    await page.waitForTimeout(gap);
  }
  await settle(page);
}

/** Keep only the named counters, defaulting a component that never ran to 0 rather than dropping it. */
export const only = (all: Record<string, number>, names: string[]) =>
  Object.fromEntries(names.map((n) => [n, all[n] ?? 0]));

/** One test per sentence. */
export function claims(group: string, start: (page: Page) => Promise<void>, list: Claim[]) {
  test.describe(group, () => {
    for (const c of list) {
      test(`${c.id} [${c.book}] ${c.say}`, async ({ page }) => {
        await start(page);
        expect(await c.run(page)).toEqual(c.expect);
      });
    }
  });
}
````

````ts file=labs/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/lab.spec.tsx',
  // The chapter 7 burst measures what React abandons under load, so these never run in parallel.
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    // LAB_CHROME lets a sandbox point at a browser it already has.
    launchOptions: { executablePath: process.env.LAB_CHROME || undefined },
  },
});
````

````js file=extract-labs.mjs
// Writes every ```` fenced block marked `file=<path>` in a labs markdown file.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const doc = process.argv[2] ?? 'LABS-WEEK01-02.md';
const md = readFileSync(doc, 'utf8');
const block = /^````[a-z]*[ \t]+file=(\S+)\n([\s\S]*?)^````$/gm;

let m;
let n = 0;
while ((m = block.exec(md))) {
  const [, path, body] = m;
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(resolve(path), body);
  console.log('wrote ' + path);
  n++;
}
console.log(n + ' files from ' + doc);
````
---

## Week 1 · Chapter 1 — The same element

````md file=labs/week01/p01-the-same-element/README.md
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
````

````tsx file=labs/week01/p01-the-same-element/lab.spec.tsx
import { boot, claims, lab, only, press, settle, type Page } from '../../_kit/lab';

const HTML = '<div id="a"></div><div id="b"></div><div id="c"></div><div id="d"></div>';

const HARNESS = `
  const h = React.createElement, S = React.useState;
  const R = {}, M = {};
  const bump = (n) => { R[n] = (R[n] || 0) + 1; };
  const mounted = (n) => React.useEffect(() => {
    M[n] = (M[n] || 0) + 1;
    return () => { M[n + ':unmount'] = (M[n + ':unmount'] || 0) + 1; };
  }, []);

  function Child() { bump('Child'); return h('b', null, 'fixed'); }

  function Parent(p) {
    const t = S(0);
    bump('Parent');
    return h('div', null,
      h('button', { id: p.tag + '-tick', onClick: () => t[1](n => n + 1) }, 'tick'),
      h('span', null, ' ' + t[0] + ' '),
      p.children || h(Child));
  }
  function Host() {
    const m = S('inside');
    const child = h(Child);                       // made here, not inside Parent
    return h('div', null,
      h('button', { id: 'host-mode', onClick: () => m[1](x => x === 'inside' ? 'passed' : 'inside') }, 'mode'),
      m[0] === 'passed' ? h(Parent, { tag: 'p3', children: child }) : h(Parent, { tag: 'p3' }));
  }

  const Plain = React.memo(function Plain() { bump('plain'); return h('b', null, 'a'); });
  const WithObj = React.memo(function WithObj() { bump('obj'); return h('b', null, 'b'); });
  const WithFn = React.memo(function WithFn() { bump('fn'); return h('b', null, 'c'); });
  const WithStable = React.memo(function WithStable() { bump('stable'); return h('b', null, 'd'); });
  function Memos() {
    const t = S(0);
    bump('MemoParent');
    const opts = React.useMemo(() => ({ dense: true }), []);
    const onPick = React.useCallback(() => {}, []);
    return h('div', null,
      h('button', { id: 'memo-tick', onClick: () => t[1](n => n + 1) }, 'tick'),
      h('span', null, ' ' + t[0] + ' '),
      h(Plain, null),
      h(WithObj, { opts: { dense: true } }),
      h(WithFn, { onPick: () => {} }),
      h(WithStable, { opts, onPick }));
  }

  function Box() { bump('Box'); mounted('Box'); return h('input', { id: 'box-input', defaultValue: '' }); }
  function Types() {
    const t = S(0);
    const m = S('module');
    bump('TypeParent');
    function InlineBox(q) { return h(Box, q); }   // a new function object every render
    const B = m[0] === 'module' ? Box : InlineBox;
    return h('div', null,
      h('button', { id: 'type-tick', onClick: () => t[1](n => n + 1) }, 'tick'),
      h('button', { id: 'type-mode', onClick: () => m[1](x => x === 'module' ? 'inline' : 'module') }, 'mode'),
      h('span', null, ' ' + t[0] + ' '),
      h(B, null));
  }

  ReactDOM.createRoot(document.getElementById('a')).render(h(Parent, { tag: 'p2' }));
  ReactDOM.createRoot(document.getElementById('b')).render(h(Host));
  ReactDOM.createRoot(document.getElementById('c')).render(h(Memos));
  ReactDOM.createRoot(document.getElementById('d')).render(h(Types));

  window.__lab = {
    reset: () => { Object.keys(R).forEach(k => R[k] = 0); Object.keys(M).forEach(k => M[k] = 0); },
    renders: () => ({ ...R }),
    mounts: () => ({ ...M }),
    inputValue: () => (document.getElementById('box-input') || {}).value,
  };
  window.__ready = true;
`;

const start = (page: Page) => boot(page, { html: HTML, harness: HARNESS });

async function pressed(page: Page, id: string, names: string[]) {
  await lab(page, 'reset');
  await press(page, id, 1, 0);
  return only(await lab<Record<string, number>>(page, 'renders'), names);
}

claims('Ch. 1 · the default is to re-render', start, [
  {
    id: 'C1.1',
    say: 'a child with no props and fixed output runs its body once per parent render',
    book: 'holds',
    run: (p) => pressed(p, 'p2-tick', ['Parent', 'Child']),
    expect: { Parent: 1, Child: 1 },
  },
  {
    id: 'C1.2',
    say: 'the same child, created above the parent and passed as children, does not re-render',
    book: 'holds',
    run: async (p) => {
      await press(p, 'host-mode', 1, 0);          // switch to <Parent><Child/></Parent>
      return pressed(p, 'p3-tick', ['Parent', 'Child']);
    },
    expect: { Parent: 1, Child: 0 },
  },
]);

claims('Ch. 1 · what memo compares', start, [
  {
    id: 'C1.3',
    say: 'memo with nothing to compare skips the body',
    book: 'holds',
    run: (p) => pressed(p, 'memo-tick', ['plain']),
    expect: { plain: 0 },
  },
  {
    id: 'C1.4',
    say: '"wrap it in memo and it stops re-rendering" — with a prop built inline',
    book: 'wrong',
    run: (p) => pressed(p, 'memo-tick', ['obj', 'fn']),
    expect: { obj: 1, fn: 1 },                    // the sentence predicts 0 and 0
  },
  {
    id: 'C1.5',
    say: 'memo skips once every prop is hoisted with useMemo and useCallback',
    book: 'holds',
    run: (p) => pressed(p, 'memo-tick', ['stable']),
    expect: { stable: 0 },
  },
]);

claims('Ch. 1 · a new type is a new component', start, [
  {
    id: 'C1.6',
    say: 'at module scope a parent render keeps the DOM node and what was typed into it',
    book: 'holds',
    run: async (p) => {
      await p.fill('#box-input', 'kept');
      await lab(p, 'reset');
      await press(p, 'type-tick', 1, 0);
      return { mounts: await lab(p, 'mounts'), value: await lab(p, 'inputValue') };
    },
    expect: { mounts: { Box: 0 }, value: 'kept' },   // no unmount key: it never happened
  },
  {
    id: 'C1.7',
    say: '"declaring a component inside a component is just untidy" — it remounts the subtree',
    book: 'wrong',
    run: async (p) => {
      await press(p, 'type-mode', 1, 0);          // declare the component inside the parent
      await p.fill('#box-input', 'lost');
      await lab(p, 'reset');
      await press(p, 'type-tick', 1, 0);
      return { mounts: await lab(p, 'mounts'), value: await lab(p, 'inputValue') };
    },
    expect: { mounts: { Box: 1, 'Box:unmount': 1 }, value: '' },
  },
]);
````

---

## Week 1 · Chapter 2 — Render, commit, paint

````md file=labs/week01/p02-render-commit-paint/README.md
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
````

````tsx file=labs/week01/p02-render-commit-paint/lab.spec.tsx
import { boot, claims, expect, lab, press, settle, test, type Page } from '../../_kit/lab';

const HTML = '<div id="root"></div>';

const HARNESS = `
  const h = React.createElement, S = React.useState;
  const C = { renders: 0, commits: 0, writes: 0, frames: 0 };
  let pending = false, lastCommitAt = 0, firstFrameAfterClickAt = 0;

  new MutationObserver(r => { C.writes += r.length; pending = true; })
    .observe(document.getElementById('root'), { childList: true, subtree: true, attributes: true, characterData: true });

  // A MutationObserver callback is a microtask, so a write made in task T is always seen
  // before the frame that follows it: this counts frames that carried a change.
  (function tick() { if (pending) { pending = false; C.frames++; } requestAnimationFrame(tick); })();

  // Ordering probe: when did the first frame after a click arrive, relative to the commit?
  document.addEventListener('click', () => {
    firstFrameAfterClickAt = 0;
    requestAnimationFrame(() => { if (!firstFrameAfterClickAt) firstFrameAfterClickAt = performance.now(); });
  }, true);

  const prof = (el) => h(React.Profiler, { id: 'p', onRender: () => {
    C.commits++;
    lastCommitAt = performance.now();
  } }, el);

  function Leaf() { C.renders++; return h('b', null, 'never changes'); }
  function Quiet() {
    const n = S(0);                       // never rendered anywhere
    C.renders++;
    return h('div', null, h('button', { id: 'quiet', onClick: () => n[1](x => x + 1) }, 'tick'), h(Leaf));
  }
  function Three() {
    const a = S(0), b = S(0), d = S(0);
    C.renders++;
    const incA = () => a[1](n => n + 1), incB = () => b[1](n => n + 1), incC = () => d[1](n => n + 1);
    return h('div', null,
      h('button', { id: 'one', onClick: incA }, 'one'),
      h('button', { id: 'task', onClick: () => {
        ReactDOM.flushSync(incA); ReactDOM.flushSync(incB); ReactDOM.flushSync(incC);
      } }, 'one task'),
      h('button', { id: 'frames', onClick: () => {
        requestAnimationFrame(() => { incA(); requestAnimationFrame(() => { incB(); requestAnimationFrame(incC); }); });
      } }, 'one per frame'),
      h('b', null, 'a ' + a[0]), h('b', null, 'b ' + b[0]), h('b', null, 'c ' + d[0]));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(prof(h(window.__SUBJECT === 'quiet' ? Quiet : Three)));

  window.__lab = {
    reset: () => { C.renders = 0; C.commits = 0; C.writes = 0; C.frames = 0; pending = false; },
    read: () => ({ ...C }),
    // onRender ran in the click's own task if the first frame after the click came later
    commitBeforeFrame: () => firstFrameAfterClickAt > lastCommitAt,
  };
  window.__ready = true;
`;

const startWith = (subject: 'three' | 'quiet') => (page: Page) =>
  boot(page, { html: HTML, harness: HARNESS, pre: `window.__SUBJECT = ${JSON.stringify(subject)};` });

type Counts = { renders: number; commits: number; writes: number; frames: number };

async function act(page: Page, button: string, times = 1) {
  await lab(page, 'reset');
  await press(page, button, times, 60);
  await page.waitForTimeout(200);               // the rAF chain needs three frames
  await settle(page);
  return lab<Counts>(page, 'read');
}

claims('Ch. 2 · a render is not a write', startWith('quiet'), [
  {
    id: 'C2.1',
    say: 'ten updates to state the view never reads: twenty renders, ten commits, no writes, no frames',
    book: 'holds',
    run: (p) => act(p, 'quiet', 10),
    expect: { renders: 20, commits: 10, writes: 0, frames: 0 },
  },
]);

claims('Ch. 2 · a commit is not a frame', startWith('three'), [
  {
    id: 'C2.2',
    say: 'one update: one render, one commit, one write, one frame',
    book: 'holds',
    run: (p) => act(p, 'one'),
    expect: { renders: 1, commits: 1, writes: 1, frames: 1 },
  },
  {
    id: 'C2.3',
    say: 'three commits inside one task write three nodes and share one frame',
    book: 'holds',
    run: (p) => act(p, 'task'),
    expect: { renders: 3, commits: 3, writes: 3, frames: 1 },
  },
  {
    id: 'C2.4',
    say: 'the same three commits, one per animation frame, produce three frames',
    book: 'holds',
    run: (p) => act(p, 'frames'),
    expect: { renders: 3, commits: 3, writes: 3, frames: 3 },
  },
]);

test.describe('Ch. 2 · the Profiler stops at the commit', () => {
  test('C2.5 [wrong] "actualDuration covers the update appearing on screen" — onRender runs before any frame', async ({ page }) => {
    await startWith('three')(page);
    await page.click('#one');
    await page.waitForTimeout(150);
    // onRender fired in the click's own task, before the browser served a frame, so nothing
    // it measures can include style, layout, paint or compositing.
    expect(await lab<boolean>(page, 'commitBeforeFrame')).toBe(true);
  });
});
````

---

## Week 1 · Chapter 3 — Four causes

````md file=labs/week01/p03-four-causes/README.md
# Ch. 3 — Four causes

Four things make a component render, and each one reaches a different set of components.

| cause | who runs |
|---|---|
| 1 · its own state changed | itself, and everything under it that does not bail out |
| 2 · its parent rendered | the subtree, until a `memo` boundary with unchanged props holds |
| 3 · a context it reads changed | only readers, through any number of `memo` boundaries |
| 4 · a store it subscribes to changed | only the subscribers |

The tree under test, mounted once:

    <Shell>                       own state + the context value (memoised)
      <Ctx.Provider value={theme}>
        <Wall>                    React.memo, props never change
          <Reader />              useContext
          <Subscriber />          useSyncExternalStore
          <Quiet />               reads nothing
        </Wall>
      </Ctx.Provider>
      <Plain />                   no memo, holds its own state
    </Shell>

## Measured reach, one press at a time

| press | Shell | Wall | Reader | Subscriber | Quiet | Plain |
|---|---|---|---|---|---|---|
| re-render the parent | 1 | 0 | 0 | 0 | 0 | 1 |
| change the context value | 1 | 0 | **1** | 0 | 0 | 1 |
| write to the store | 0 | 0 | 0 | **1** | 0 | 0 |
| Plain's own state | 0 | 0 | 0 | 0 | 0 | **1** |

The context row also moves Shell and Plain, because changing the value means changing Shell's
state. The news in that row is `Reader`: it ran alone, from under a `memo` boundary that held for
everything beside it. Context is not a prop, so `memo` does not stand in its way.

Chain A → B → C: setting A runs three components, B runs two, C runs one. Nothing above a piece
of state ever runs because of it, which is why moving state down a tree is the cheapest
optimisation there is.

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C3.5 | "a component re-renders when its props change" | **wrong** | five renders out of five with every prop identical; props cannot change without the parent rendering, which is already cause 2 |
````

````tsx file=labs/week01/p03-four-causes/lab.spec.tsx
import { boot, claims, lab, only, press, type Page } from '../../_kit/lab';

const HTML = '<div id="tree"></div><div id="props"></div><div id="chain"></div>';

const HARNESS = `
  const h = React.createElement, S = React.useState;
  const R = {};
  const bump = (n) => { R[n] = (R[n] || 0) + 1; };
  const Ctx = React.createContext('dark');

  // a store that lives outside React
  const store = {
    v: 0, subs: [],
    get: () => store.v,
    sub: (f) => { store.subs.push(f); return () => { store.subs = store.subs.filter(x => x !== f); }; },
    bump: () => { store.v++; store.subs.forEach(f => f()); },
  };

  function Reader() { const t = React.useContext(Ctx); bump('Reader'); return h('b', null, t); }
  function Subscriber() { const v = React.useSyncExternalStore(store.sub, store.get); bump('Subscriber'); return h('b', null, v); }
  function Quiet() { bump('Quiet'); return h('b', null, 'q'); }
  const Wall = React.memo(function Wall() {
    bump('Wall');
    return h('div', null, h(Reader), h(Subscriber), h(Quiet));
  });
  function Plain() {
    const own = S(0);
    bump('Plain');
    return h('button', { id: 'own', onClick: () => own[1](n => n + 1) }, 'own ' + own[0]);
  }
  function Shell() {
    const tick = S(0), theme = S('dark');
    bump('Shell');
    // memoised, so Shell's own state does not change the context value's identity:
    // each button moves exactly one cause
    const value = React.useMemo(() => theme[0], [theme[0]]);
    return h('div', null,
      h('button', { id: 'parent', onClick: () => tick[1](n => n + 1) }, 'parent ' + tick[0]),
      h('button', { id: 'ctx', onClick: () => theme[1](t => t === 'dark' ? 'solar' : 'dark') }, 'ctx'),
      h('button', { id: 'store', onClick: () => store.bump() }, 'store'),
      h(Ctx.Provider, { value }, h(Wall)),
      h(Plain));
  }

  // identical props, with and without memo
  function sameAsLast(prev, props) {
    if (!prev) return null;
    const a = Object.keys(prev), b = Object.keys(props);
    if (a.length !== b.length) return false;
    return b.every(k => Object.is(prev[k], props[k]));
  }
  let identical = 0;
  function Echo(props) {
    const prev = React.useRef(null);
    if (sameAsLast(prev.current, props) === true) identical++;
    prev.current = props;
    bump('Echo');
    return h('b', null, 'plain');
  }
  const MemoEcho = React.memo(function MemoEcho() { bump('MemoEcho'); return h('b', null, 'memo'); });
  function PropsParent() {
    const t = S(0);
    bump('PropsParent');
    return h('div', null,
      h('button', { id: 'props-tick', onClick: () => t[1](n => n + 1) }, 'tick ' + t[0]),
      h(Echo, { label: 'fixed', n: 7 }),
      h(MemoEcho, { label: 'fixed', n: 7 }));
  }

  // a chain, to show how far state reaches
  function C() { const s = S(0); bump('C'); return h('button', { id: 'c', onClick: () => s[1](n => n + 1) }, 'c ' + s[0]); }
  function B() { const s = S(0); bump('B'); return h('div', null, h('button', { id: 'b', onClick: () => s[1](n => n + 1) }, 'b ' + s[0]), h(C)); }
  function A() { const s = S(0); bump('A'); return h('div', null, h('button', { id: 'a', onClick: () => s[1](n => n + 1) }, 'a ' + s[0]), h(B)); }

  ReactDOM.createRoot(document.getElementById('tree')).render(h(Shell));
  ReactDOM.createRoot(document.getElementById('props')).render(h(PropsParent));
  ReactDOM.createRoot(document.getElementById('chain')).render(h(A));

  window.__lab = {
    reset: () => { Object.keys(R).forEach(k => R[k] = 0); identical = 0; },
    renders: () => ({ ...R }),
    identical: () => identical,
  };
  window.__ready = true;
`;

const start = (page: Page) => boot(page, { html: HTML, harness: HARNESS });
const TREE = ['Shell', 'Wall', 'Reader', 'Subscriber', 'Quiet', 'Plain'];

async function reach(page: Page, button: string, names: string[], times = 1) {
  await lab(page, 'reset');
  await press(page, button, times, 50);
  return only(await lab<Record<string, number>>(page, 'renders'), names);
}

claims('Ch. 3 · each cause has its own reach', start, [
  {
    id: 'C3.1',
    say: 'cause 2: a parent render stops at a memo boundary whose props did not change',
    book: 'holds',
    run: (p) => reach(p, 'parent', TREE),
    expect: { Shell: 1, Wall: 0, Reader: 0, Subscriber: 0, Quiet: 0, Plain: 1 },
  },
  {
    id: 'C3.2',
    say: 'cause 3: a context change reaches its reader through the memo boundary',
    book: 'holds',
    run: (p) => reach(p, 'ctx', TREE),
    expect: { Shell: 1, Wall: 0, Reader: 1, Subscriber: 0, Quiet: 0, Plain: 1 },
  },
  {
    id: 'C3.3',
    say: 'cause 4: a store write reaches the subscriber and nobody else',
    book: 'holds',
    run: (p) => reach(p, 'store', TREE),
    expect: { Shell: 0, Wall: 0, Reader: 0, Subscriber: 1, Quiet: 0, Plain: 0 },
  },
  {
    id: 'C3.4',
    say: 'cause 1: own state starts at the component that holds it',
    book: 'holds',
    run: (p) => reach(p, 'own', TREE),
    expect: { Shell: 0, Wall: 0, Reader: 0, Subscriber: 0, Quiet: 0, Plain: 1 },
  },
]);

claims('Ch. 3 · props are not a cause', start, [
  {
    id: 'C3.5',
    say: '"a component re-renders when its props change" — with props that never change',
    book: 'wrong',
    run: async (p) => ({
      ...(await reach(p, 'props-tick', ['Echo', 'MemoEcho'], 5)),
      identicalRenders: await lab<number>(p, 'identical'),
    }),
    // the sentence predicts Echo: 0. Five renders, every one with identical props.
    expect: { Echo: 5, MemoEcho: 0, identicalRenders: 5 },
  },
]);

claims('Ch. 3 · state reaches downward', start, [
  {
    id: 'C3.6',
    say: 'state set in A runs A, B and C',
    book: 'holds',
    run: (p) => reach(p, 'a', ['A', 'B', 'C']),
    expect: { A: 1, B: 1, C: 1 },
  },
  {
    id: 'C3.7',
    say: 'state set in B runs B and C, and never A',
    book: 'holds',
    run: (p) => reach(p, 'b', ['A', 'B', 'C']),
    expect: { A: 0, B: 1, C: 1 },
  },
  {
    id: 'C3.8',
    say: 'state set in C runs C alone',
    book: 'holds',
    run: (p) => reach(p, 'c', ['A', 'B', 'C']),
    expect: { A: 0, B: 0, C: 1 },
  },
]);
````
---

## Week 2 · Chapter 4 — One click, one commit

````md file=labs/week02/p04-one-click-one-commit/README.md
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
````

````tsx file=labs/week02/p04-one-click-one-commit/lab.spec.tsx
import { boot, claims, expect, lab, press, settle, test, type Page } from '../../_kit/lab';
import { createRequire } from 'node:module';

const installedReactDOM = createRequire(import.meta.url)('react-dom') as { version: string; render?: unknown };

const HTML = '<div id="modern"></div><div id="legacy"></div><div id="quiet"></div><div id="same"></div>';

const HARNESS = `
  const h = React.createElement, S = React.useState;
  const mk = (id) => {
    const host = document.getElementById(id);
    const c = { renders: 0, commits: 0, writes: 0 };
    new MutationObserver(r => { c.writes += r.length; })
      .observe(host, { childList: true, subtree: true, attributes: true, characterData: true });
    window.__c[id] = c;
    return { host, c };
  };
  const prof = (c, el) => h(React.Profiler, { id: 'p', onRender: () => { c.commits++; } }, el);
  const vals = (a, b, d) => h('div', null, h('b', null, 'a ' + a), h('b', null, 'b ' + b), h('b', null, 'c ' + d));

  function Trips(p) {
    const a = S(0), b = S(0), d = S(0);
    p.c.renders++;
    const bump = () => { a[1](n => n + 1); b[1](n => n + 1); d[1](n => n + 1); };
    return h('div', null,
      h('button', { id: p.tag + '-handler', onClick: bump }, 'handler'),
      h('button', { id: p.tag + '-timeout', onClick: () => setTimeout(bump, 0) }, 'timeout'),
      h('button', { id: p.tag + '-promise', onClick: () => Promise.resolve().then(bump) }, 'promise'),
      h('button', { id: p.tag + '-flush3', onClick: () => {
        ReactDOM.flushSync(() => a[1](n => n + 1));
        ReactDOM.flushSync(() => b[1](n => n + 1));
        ReactDOM.flushSync(() => d[1](n => n + 1));
      } }, 'flush3'),
      h('button', { id: p.tag + '-flush1', onClick: () => {
        ReactDOM.flushSync(() => { a[1](n => n + 1); b[1](n => n + 1); d[1](n => n + 1); });
      } }, 'flush1'),
      vals(a[0], b[0], d[0]));
  }
  function QuietChild(p) { p.c.renders++; return h('span', null, 'this text never changes'); }
  function Quiet(p) {
    const n = S(0);
    p.c.renders++;
    return h('div', null,
      h('button', { id: 'quiet-tick', onClick: () => n[1](x => x + 1) }, 'tick'),
      h(QuietChild, { c: p.c }));
  }
  function Same(p) {
    const n = S(0);
    p.c.renders++;
    return h('div', null,
      h('button', { id: 'same-zero', onClick: () => n[1](0) }, 'set 0'),
      h('button', { id: 'same-add', onClick: () => n[1](x => x + 1) }, 'add'),
      h('b', null, 'value ' + n[0]));
  }

  window.__c = {};
  const modern = mk('modern'), legacy = mk('legacy'), quiet = mk('quiet'), same = mk('same');
  ReactDOM.createRoot(modern.host).render(prof(modern.c, h(Trips, { c: modern.c, tag: 'm' })));
  ReactDOM.render(prof(legacy.c, h(Trips, { c: legacy.c, tag: 'l' })), legacy.host);   // the React 17 root
  ReactDOM.createRoot(quiet.host).render(prof(quiet.c, h(Quiet, { c: quiet.c })));
  ReactDOM.createRoot(same.host).render(prof(same.c, h(Same, { c: same.c })));

  window.__lab = {
    reset: (id) => { const c = window.__c[id]; c.renders = 0; c.commits = 0; c.writes = 0; },
    read: (id) => ({ ...window.__c[id] }),
  };
  window.__ready = true;
`;

type Counts = { renders: number; commits: number; writes: number };

const start = (page: Page) => boot(page, { html: HTML, harness: HARNESS });
const startProduction = (page: Page) => boot(page, { html: HTML, harness: HARNESS, build: 'production' });

/** Reset one panel's counters, press a button n times, return the three numbers. */
async function act(page: Page, id: string, button: string, times = 1) {
  await lab(page, 'reset', id);
  await press(page, button, times, 60);
  return lab<Counts>(page, 'read', id);
}
const commits = async (...args: Parameters<typeof act>) => (await act(...args)).commits;

claims('Ch. 4 · batching is a property of the task', start, [
  {
    id: 'C4.1',
    say: 'three setState calls in one React event handler produce exactly one commit',
    book: 'holds',
    run: (p) => commits(p, 'modern', 'm-handler'),
    expect: 1,
  },
  {
    id: 'C4.2',
    say: 'the same three inside setTimeout still produce one commit on createRoot',
    book: 'holds',
    run: (p) => commits(p, 'modern', 'm-timeout'),
    expect: 1,
  },
  {
    id: 'C4.3',
    say: 'the same three inside a resolved promise still produce one commit on createRoot',
    book: 'holds',
    run: (p) => commits(p, 'modern', 'm-promise'),
    expect: 1,
  },
  {
    id: 'C4.4',
    say: '"setState inside a setTimeout is not batched" — as stated, of any React app',
    book: 'wrong',
    run: (p) => commits(p, 'modern', 'm-timeout'),
    expect: 1,                                   // the sentence predicts 3
  },
  {
    id: 'C4.5',
    say: 'the legacy ReactDOM.render root does commit three times for updates in a timeout',
    book: 'holds',
    run: (p) => act(p, 'legacy', 'l-timeout'),
    expect: { renders: 3, commits: 3, writes: 3 },
  },
  {
    id: 'C4.6',
    say: 'inside a React event handler the legacy root batches too, so the root is not the whole story',
    book: 'holds',
    run: (p) => commits(p, 'legacy', 'l-handler'),
    expect: 1,
  },
]);

claims('Ch. 4 · leaving the batch', start, [
  {
    id: 'C4.7',
    say: 'three separate flushSync calls produce three commits',
    book: 'holds',
    run: (p) => act(p, 'modern', 'm-flush3'),
    expect: { renders: 3, commits: 3, writes: 3 },
  },
  {
    id: 'C4.8',
    say: 'one flushSync around all three updates produces one commit',
    book: 'holds',
    run: (p) => act(p, 'modern', 'm-flush1'),
    expect: { renders: 1, commits: 1, writes: 3 },
  },
]);

claims('Ch. 4 · a commit is not a DOM write', start, [
  {
    id: 'C4.9',
    say: 'ten updates to state the view never reads: twenty renders, ten commits, zero DOM writes',
    book: 'holds',
    run: (p) => act(p, 'quiet', 'quiet-tick', 10),
    expect: { renders: 20, commits: 10, writes: 0 },
  },
  {
    id: 'C4.10',
    say: 'setting state to the value it already holds never renders — from an untouched value',
    book: 'holds',
    run: (p) => act(p, 'same', 'same-zero', 3),
    expect: { renders: 0, commits: 0, writes: 0 },
  },
  {
    id: 'C4.11',
    say: 'setting state to the value it already holds never renders — after a real change',
    book: 'partly',
    run: async (p) => {
      await act(p, 'same', 'same-add');          // value is now 1
      await act(p, 'same', 'same-zero');         // a real change back to 0
      return act(p, 'same', 'same-zero');        // the equal set: the body runs, nothing is written
    },
    expect: { renders: 1, commits: 1, writes: 0 },
  },
]);

test.describe('Ch. 4 · this repo and this instrument', () => {
  test('C4.12 [holds] React 19 removed the legacy root, so the three-commit lane cannot exist here', () => {
    expect(installedReactDOM.render).toBeUndefined();
    expect(installedReactDOM.version.startsWith('19.')).toBe(true);
  });

  test('C4.13 [wrong] "<Profiler> counts your commits in production" — onRender never fires there', async ({ page }) => {
    await startProduction(page);
    // Renders and DOM writes are unaffected; only the commit counter goes silent, with no warning.
    expect(await act(page, 'modern', 'm-handler')).toEqual({ renders: 1, commits: 0, writes: 3 });
  });
});
````

---

## Week 2 · Chapter 5 — One value, every consumer

````md file=labs/week02/p05-one-value-every-consumer/README.md
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
````

````tsx file=labs/week02/p05-one-value-every-consumer/lab.spec.tsx
import { boot, claims, lab, only, press, type Page } from '../../_kit/lab';

const HTML = '<div id="grid"></div><div id="shapes"></div><div id="consumers"></div>';

const HARNESS = `
  const h = React.createElement, S = React.useState;
  const R = {};
  const bump = (n) => { R[n] = (R[n] || 0) + 1; };
  const One = React.createContext({ user: 'ada', theme: 'dark' });
  const UserCtx = React.createContext('ada');
  const ThemeCtx = React.createContext('dark');

  function UserBadge() { const v = React.useContext(One); bump('UserBadge'); return h('b', null, v.user); }
  function ThemeLabel() { const v = React.useContext(One); bump('ThemeLabel'); return h('b', null, v.theme); }
  const Wall = React.memo(function Wall() { bump('Wall'); return h('div', null, h(UserBadge), h(ThemeLabel)); });
  function PlainWall() { bump('Wall'); return h('div', null, h(UserBadge), h(ThemeLabel)); }

  // 2x2: value identity against what else re-renders
  function Grid() {
    const tick = S(0), memoised = S(false), walled = S(true);
    bump('Shell');
    const stable = React.useMemo(() => ({ user: 'ada', theme: 'dark' }), []);
    const value = memoised[0] ? stable : { user: 'ada', theme: 'dark' };
    const W = walled[0] ? Wall : PlainWall;
    return h('div', null,
      h('button', { id: 'tick', onClick: () => tick[1](n => n + 1) }, 'tick ' + tick[0]),
      h('button', { id: 'value', onClick: () => memoised[1](x => !x) }, 'value'),
      h('button', { id: 'wall', onClick: () => walled[1](x => !x) }, 'wall'),
      h(One.Provider, { value }, h(W)));
  }

  // one context or two, both halves of the fix in place
  function SplitUser() { const u = React.useContext(UserCtx); bump('SplitUser'); return h('b', null, u); }
  function SplitTheme() { const t = React.useContext(ThemeCtx); bump('SplitTheme'); return h('b', null, t); }
  const SplitWall = React.memo(function SplitWall(p) {
    bump('SplitWall');
    return p.split ? h('div', null, h(SplitUser), h(SplitTheme)) : h('div', null, h(UserBadge), h(ThemeLabel));
  });
  function Shapes() {
    const user = S('ada'), theme = S('dark'), split = S(false);
    bump('ShapeShell');
    const one = React.useMemo(() => ({ user: user[0], theme: theme[0] }), [user[0], theme[0]]);
    const inner = h(SplitWall, { split: split[0] });
    return h('div', null,
      h('button', { id: 'user', onClick: () => user[1](u => u === 'ada' ? 'grace' : 'ada') }, 'user'),
      h('button', { id: 'theme', onClick: () => theme[1](t => t === 'dark' ? 'solar' : 'dark') }, 'theme'),
      h('button', { id: 'split', onClick: () => split[1](x => !x) }, 'split'),
      split[0]
        ? h(UserCtx.Provider, { value: user[0] }, h(ThemeCtx.Provider, { value: theme[0] }, inner))
        : h(One.Provider, { value: one }, inner));
  }

  // memo on the consumer itself
  const MemoReader = React.memo(function MemoReader() { React.useContext(ThemeCtx); bump('MemoReader'); return h('b', null, 'r'); });
  const MemoBystander = React.memo(function MemoBystander() { bump('MemoBystander'); return h('b', null, 'b'); });
  function Consumers() {
    const tick = S(0), theme = S('dark');
    bump('ConsumerShell');
    return h('div', null,
      h('button', { id: 'c-tick', onClick: () => tick[1](n => n + 1) }, 'tick ' + tick[0]),
      h('button', { id: 'c-ctx', onClick: () => theme[1](t => t === 'dark' ? 'solar' : 'dark') }, 'ctx'),
      h(ThemeCtx.Provider, { value: theme[0] }, h('div', null, h(MemoReader), h(MemoBystander))));
  }

  ReactDOM.createRoot(document.getElementById('grid')).render(h(Grid));
  ReactDOM.createRoot(document.getElementById('shapes')).render(h(Shapes));
  ReactDOM.createRoot(document.getElementById('consumers')).render(h(Consumers));

  window.__lab = {
    reset: () => Object.keys(R).forEach(k => R[k] = 0),
    renders: () => ({ ...R }),
  };
  window.__ready = true;
`;

const start = (page: Page) => boot(page, { html: HTML, harness: HARNESS });
const TREE = ['Shell', 'Wall', 'UserBadge', 'ThemeLabel'];

async function reach(page: Page, button: string, names: string[]) {
  await lab(page, 'reset');
  await press(page, button, 1, 0);
  return only(await lab<Record<string, number>>(page, 'renders'), names);
}
const flip = (page: Page, id: string) => press(page, id, 1, 0);

claims('Ch. 5 · the provider wakes every reader', start, [
  {
    id: 'C5.1',
    say: 'an inline value wakes both readers on a shell render, through a memo boundary that held',
    book: 'holds',
    run: (p) => reach(p, 'tick', TREE),
    expect: { Shell: 1, Wall: 0, UserBadge: 1, ThemeLabel: 1 },
  },
  {
    id: 'C5.2',
    say: '"wrap the provider value in useMemo and consumers stop re-rendering" — under a plain wall',
    book: 'wrong',
    run: async (p) => {
      await flip(p, 'value');                    // memoise the value
      await flip(p, 'wall');                     // but let the subtree re-render normally
      return reach(p, 'tick', TREE);
    },
    expect: { Shell: 1, Wall: 1, UserBadge: 1, ThemeLabel: 1 },   // the sentence predicts 0 and 0
  },
  {
    id: 'C5.3',
    say: 'both halves together — a memoised value under a memo boundary — do stop them',
    book: 'holds',
    run: async (p) => {
      await flip(p, 'value');
      return reach(p, 'tick', TREE);
    },
    expect: { Shell: 1, Wall: 0, UserBadge: 0, ThemeLabel: 0 },
  },
]);

claims('Ch. 5 · a context is as coarse as its value', start, [
  {
    id: 'C5.4',
    say: 'one object: changing the user wakes the theme reader too',
    book: 'holds',
    run: (p) => reach(p, 'user', ['ShapeShell', 'UserBadge', 'ThemeLabel']),
    expect: { ShapeShell: 1, UserBadge: 1, ThemeLabel: 1 },
  },
  {
    id: 'C5.5',
    say: 'two contexts: changing the user wakes only the user reader',
    book: 'holds',
    run: async (p) => {
      await flip(p, 'split');
      return reach(p, 'user', ['ShapeShell', 'SplitUser', 'SplitTheme']);
    },
    expect: { ShapeShell: 1, SplitUser: 1, SplitTheme: 0 },
  },
]);

claims('Ch. 5 · memo is not a wall for context', start, [
  {
    id: 'C5.6',
    say: '"memo protects a consumer from context updates" — it does not',
    book: 'wrong',
    run: (p) => reach(p, 'c-ctx', ['MemoReader', 'MemoBystander']),
    expect: { MemoReader: 1, MemoBystander: 0 },   // the sentence predicts 0 for both
  },
  {
    id: 'C5.7',
    say: 'the same memo does hold against the parent re-rendering',
    book: 'holds',
    run: (p) => reach(p, 'c-tick', ['MemoReader', 'MemoBystander']),
    expect: { MemoReader: 0, MemoBystander: 0 },
  },
]);
````

---

## Week 2 · Chapter 6 — The state that moved

````md file=labs/week02/p06-the-state-that-moved/README.md
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
````

````tsx file=labs/week02/p06-the-state-that-moved/lab.spec.tsx
import { boot, claims, expect, lab, press, settle, test, type Page } from '../../_kit/lab';

const HTML = '<div id="root"></div><div id="holder"></div>';

const HARNESS = `
  const h = React.createElement, S = React.useState;
  const C = { renders: 0, mounts: 0, unmounts: 0, writes: 0 };
  let nextId = 100;

  new MutationObserver(r => { C.writes += r.length; })
    .observe(document.getElementById('root'), { childList: true, subtree: true, attributes: true, characterData: true });

  function Row(p) {
    C.renders++;
    React.useEffect(() => { C.mounts++; return () => { C.unmounts++; }; }, []);
    return h('div', { 'data-row': p.item.name }, h('b', null, p.item.name), h('input', { defaultValue: '' }));
  }
  function List() {
    const items = S([{ id: 1, name: 'ada' }, { id: 2, name: 'grace' }, { id: 3, name: 'linus' }]);
    const byId = S(false);
    return h('div', null,
      h('button', { id: 'rotate', onClick: () => items[1](xs => xs.slice(1).concat([xs[0]])) }, 'rotate'),
      h('button', { id: 'prepend', onClick: () => items[1](xs => { nextId++; return [{ id: nextId, name: 'new-' + nextId }].concat(xs); }) }, 'prepend'),
      h('button', { id: 'mode', onClick: () => byId[1](x => !x) }, 'mode'),
      items[0].map((item, i) => h(Row, { key: byId[0] ? item.id : i, item })));
  }

  // a key used on purpose, to reset
  function Form() {
    React.useEffect(() => { C.mounts++; return () => { C.unmounts++; }; }, []);
    return h('input', { id: 'draft', defaultValue: '' });
  }
  function Holder() {
    const tick = S(0), version = S(1);
    return h('div', null,
      h('button', { id: 'h-tick', onClick: () => tick[1](n => n + 1) }, 'tick ' + tick[0]),
      h('button', { id: 'h-key', onClick: () => version[1](n => n + 1) }, 'key'),
      h(Form, { key: version[0] }));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(List));
  ReactDOM.createRoot(document.getElementById('holder')).render(h(Holder));

  window.__lab = {
    reset: () => { C.renders = 0; C.mounts = 0; C.unmounts = 0; C.writes = 0; },
    read: () => ({ ...C }),
    // every row's label paired with what is actually in its box, read back out of the document
    pairs: () => [...document.querySelectorAll('[data-row]')]
      .map(el => [el.getAttribute('data-row'), el.querySelector('input').value]),
    draft: () => (document.getElementById('draft') || {}).value,
  };
  window.__ready = true;
`;

type Counts = { renders: number; mounts: number; unmounts: number; writes: number };

const start = (page: Page) => boot(page, { html: HTML, harness: HARNESS });
const typeTop = (page: Page, text: string) => page.locator('[data-row] input').first().fill(text);

async function act(page: Page, button: string) {
  await lab(page, 'reset');
  await press(page, button, 1, 0);
  return {
    counts: await lab<Counts>(page, 'read'),
    pairs: await lab<[string, string][]>(page, 'pairs'),
  };
}

claims('Ch. 6 · what a key matches', start, [
  {
    id: 'C6.1',
    say: 'index keys: a reorder leaves uncontrolled state in the slot, beside different data',
    book: 'holds',
    run: async (p) => {
      await typeTop(p, 'hello');
      const { counts, pairs } = await act(p, 'rotate');
      return { mounts: counts.mounts, unmounts: counts.unmounts, renders: counts.renders, pairs };
    },
    expect: {
      mounts: 0, unmounts: 0, renders: 3,
      pairs: [['grace', 'hello'], ['linus', ''], ['ada', '']],
    },
  },
  {
    id: 'C6.2',
    say: 'id keys: the same reorder moves the node, and the typed text goes with its row',
    book: 'holds',
    run: async (p) => {
      await press(p, 'mode', 1, 0);              // every key changes, so the rows remount
      await typeTop(p, 'hello');
      const { counts, pairs } = await act(p, 'rotate');
      return { mounts: counts.mounts, unmounts: counts.unmounts, renders: counts.renders, pairs };
    },
    expect: {
      mounts: 0, unmounts: 0, renders: 3,
      pairs: [['grace', ''], ['linus', ''], ['ada', 'hello']],
    },
  },
  {
    id: 'C6.3',
    say: '"the right keys mean fewer components re-render" — the render count is the same either way',
    book: 'wrong',
    run: async (p) => {
      const withIndex = await act(p, 'rotate');
      await press(p, 'mode', 1, 0);
      const withId = await act(p, 'rotate');
      return { index: withIndex.counts.renders, id: withId.counts.renders };
    },
    expect: { index: 3, id: 3 },
  },
]);

test.describe('Ch. 6 · what an insert costs', () => {
  test('C6.4 [holds] inserting at the top writes far less with id keys than with index keys', async ({ page }) => {
    await start(page);
    const withIndex = await act(page, 'prepend');
    await press(page, 'mode', 1, 0);
    const withId = await act(page, 'prepend');
    // one new row mounts either way; what differs is how much of the document was rewritten
    expect(withIndex.counts.mounts).toBe(1);
    expect(withId.counts.mounts).toBe(1);
    expect(withId.counts.writes).toBeLessThan(withIndex.counts.writes);
  });
});

claims('Ch. 6 · a key as a reset', start, [
  {
    id: 'C6.5',
    say: 'a plain parent re-render keeps the draft and mounts nothing',
    book: 'holds',
    run: async (p) => {
      await p.fill('#draft', 'draft text');
      await lab(p, 'reset');
      await press(p, 'h-tick', 1, 0);
      return { mounts: (await lab<Counts>(p, 'read')).mounts, draft: await lab(p, 'draft') };
    },
    expect: { mounts: 0, draft: 'draft text' },
  },
  {
    id: 'C6.6',
    say: 'changing the key unmounts the old child and mounts a clean one',
    book: 'holds',
    run: async (p) => {
      await p.fill('#draft', 'draft text');
      await lab(p, 'reset');
      await press(p, 'h-key', 1, 0);
      const c = await lab<Counts>(p, 'read');
      return { mounts: c.mounts, unmounts: c.unmounts, draft: await lab(p, 'draft') };
    },
    expect: { mounts: 1, unmounts: 1, draft: '' },
  },
]);
````

---

## Week 2 · Chapter 7 — Interruptible work

````md file=labs/week02/p07-interruptible-work/README.md
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
````

````tsx file=labs/week02/p07-interruptible-work/lab.spec.tsx
import { boot, expect, lab, test, type Page } from '../../_kit/lab';

const ROWS = 300;
const HTML = '<div id="root"></div>';

const HARNESS = `
  const h = React.createElement, S = React.useState;
  const ROWS = ${ROWS}, PER_ROW = 0.12;
  const burn = (ms) => { const t = performance.now(); while (performance.now() - t < ms) {} };
  const C = { started: 0, committed: 0, commits: 0, rowRuns: 0, keystrokes: 0, writes: 0 };

  new MutationObserver(r => { C.writes += r.length; })
    .observe(document.getElementById('root'), { childList: true, subtree: true, attributes: true, characterData: true });

  function Row(p) { C.rowRuns++; burn(PER_ROW); return h('div', null, p.text); }

  // 300 child components: React can stop between any two of them
  const List = React.memo(function List(p) {
    C.started++;
    React.useLayoutEffect(() => { C.committed++; });     // an abandoned render never gets here
    const rows = [];
    for (let i = 0; i < ROWS; i++) rows.push(h(Row, { key: i, text: (p.query || '-') + ' row ' + i }));
    return h('div', null, rows);
  });

  // the same work inside one component: nowhere to stop
  const Blob = React.memo(function Blob(p) {
    C.started++;
    React.useLayoutEffect(() => { C.committed++; });
    const rows = [];
    for (let i = 0; i < ROWS; i++) { C.rowRuns++; burn(PER_ROW); rows.push(h('div', { key: i }, (p.query || '-') + ' row ' + i)); }
    return h('div', null, rows);
  });

  const prof = (el) => h(React.Profiler, { id: 'p', onRender: () => { C.commits++; } }, el);
  let inputEl = null;
  const shell = (Heavy, value, shown, onChange) =>
    h('div', null,
      h('input', { ref: (el) => { inputEl = el || inputEl; }, value, onChange }),
      h(Heavy, { query: shown }));

  function Urgent(p) { const q = S(''); return shell(p.Heavy, q[0], q[0], e => q[1](e.target.value)); }
  function Deferred(p) {
    const q = S('');
    const d = React.useDeferredValue(q[0]);
    return shell(p.Heavy, q[0], d, e => q[1](e.target.value));
  }
  function Transition(p) {
    const q = S(''), tq = S('');
    const t = React.useTransition();
    return shell(p.Heavy, q[0], tq[0], e => {
      const v = e.target.value;
      q[1](v);
      t[1](() => tq[1](v));
    });
  }
  const BY = { urgent: Urgent, deferred: Deferred, transition: Transition };

  window.__lab = {
    mount: (mode, heavy) => {
      Object.keys(C).forEach(k => C[k] = 0);
      ReactDOM.createRoot(document.getElementById('root'))
        .render(prof(h(BY[mode], { Heavy: heavy === 'blob' ? Blob : List })));
    },
    reset: () => Object.keys(C).forEach(k => C[k] = 0),
    read: () => ({ ...C, thrownAway: C.started - C.committed, inputOnly: C.commits - C.committed }),
    // ten keystrokes 16 ms apart, dispatched as real input events
    burst: () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      const text = 'performance';
      let i = 0;
      (function step() {
        if (i >= 10) return;
        setter.call(inputEl, text.slice(0, i + 1));
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        C.keystrokes++;
        i++;
        setTimeout(step, 16);
      })();
    },
  };
  window.__ready = true;
`;

type Burst = {
  started: number; committed: number; commits: number; rowRuns: number;
  keystrokes: number; writes: number; thrownAway: number; inputOnly: number;
};

async function start(page: Page, mode: 'urgent' | 'deferred' | 'transition', heavy: 'list' | 'blob' = 'list') {
  await boot(page, { html: HTML, harness: HARNESS });
  await lab(page, 'mount', mode, heavy);
  await page.waitForTimeout(300);
  await lab(page, 'reset');
}

async function burst(page: Page) {
  await lab(page, 'burst');
  await page.waitForTimeout(2600);
  return lab<Burst>(page, 'read');
}

test.describe('Ch. 7 · a burst at urgent priority', () => {
  test('C7.1 [holds] ten keystrokes produce ten list renders, ten commits and nothing abandoned', async ({ page }) => {
    await start(page, 'urgent');
    const r = await burst(page);
    expect({ keystrokes: r.keystrokes, started: r.started, committed: r.committed, thrownAway: r.thrownAway })
      .toEqual({ keystrokes: 10, started: 10, committed: 10, thrownAway: 0 });
    // and not one commit showed the typing without also rendering the list
    expect(r.inputOnly).toBe(0);
    expect(r.rowRuns).toBe(10 * ROWS);
  });
});

test.describe('Ch. 7 · the same burst, deferred', () => {
  test('C7.2 [holds] most renders are started and thrown away, and the input commits on its own', async ({ page }) => {
    await start(page, 'deferred');
    const r = await burst(page);
    expect(r.keystrokes).toBe(10);
    expect(r.started).toBe(10);
    expect(r.thrownAway).toBeGreaterThanOrEqual(5);
    expect(r.committed).toBeLessThanOrEqual(3);
    expect(r.inputOnly).toBe(10);
  });

  test('C7.3 [wrong] "a transition makes the expensive render faster" — each committed render still runs every row', async ({ page }) => {
    await start(page, 'deferred');
    const r = await burst(page);
    // whatever committed, it paid the full price for the rows it rendered
    expect(r.rowRuns).toBeGreaterThanOrEqual(r.committed * ROWS);
  });

  test('C7.4 [wrong] "deferring moves the same work to later" — the total fell', async ({ page }) => {
    await start(page, 'urgent');
    const urgent = await burst(page);
    await start(page, 'deferred');
    const deferred = await burst(page);
    expect(deferred.rowRuns).toBeLessThan(urgent.rowRuns);
    expect(deferred.writes).toBeLessThan(urgent.writes / 3);
  });

  test('C7.5 [holds] useTransition produces the same shape as useDeferredValue', async ({ page }) => {
    await start(page, 'transition');
    const r = await burst(page);
    expect(r.thrownAway).toBeGreaterThanOrEqual(5);
    expect(r.inputOnly).toBe(10);
  });
});

test.describe('Ch. 7 · React can only stop between components', () => {
  test('C7.6 [wrong] "wrap the slow thing in startTransition" — with the loop inside one component, nothing is abandoned', async ({ page }) => {
    await start(page, 'deferred', 'blob');
    const r = await burst(page);
    expect(r.thrownAway).toBeLessThanOrEqual(2);
    expect(r.committed).toBeGreaterThanOrEqual(8);
    expect(r.rowRuns).toBe(10 * ROWS);     // the full work ran on every keystroke
  });
});
````

---

## What is not in here

The render lab is deliberately absent. Nothing in these seven labs reads
`app/render-lab/ANSWER_KEY.md`, writes a render-lab budget, or runs against `/render-lab`: that
diagnosis is yours to do first, and `docs/week-2/FIXING.md` in the Part 4–7 brief is the loop for
turning each finding into a budget that fails before the fix and passes after it.
