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
