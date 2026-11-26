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
