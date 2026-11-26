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
