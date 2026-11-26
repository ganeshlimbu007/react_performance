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
