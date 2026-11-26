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
