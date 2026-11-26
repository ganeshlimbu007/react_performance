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
