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
