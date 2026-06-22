# ANSWER KEY — Render Lab (SEALED)

> Do not read until you have profiled and filled in `BASELINE.md`.

Seven planted offenders, plus three correctly-built controls. Each offender is
written to surface **one** unambiguous Profiler "Why did this render?" reason
when you profile the matching interaction in isolation.

---

## Offenders

### 1 — Volatile value in a shared context

- **Component / file:** `AppProvider` in `components/AppContext.tsx`; consumed by
  `UserBadge` and `ThemeToggle` in `components/TopBar.tsx`.
- **Symptom:** Every second (the ticker), all context consumers re-render even
  though the part of the data they care about (theme, current user) hasn't
  changed.
- **Why did this render?:** **Context changed**
- **Category:** frequency
- **Interaction to profile:** Do nothing — just let the "unread" counter tick.
- **Intended fix:** Split the volatile `unread` value into its own context (or
  lift it to a dedicated provider). Keep stable values (theme, user) in a
  separate context so a 1 Hz update doesn't re-render their consumers.

### 2 — Unstable provider value

- **Component / file:** `AppProvider` in `components/AppContext.tsx` —
  `value={{ theme, toggleTheme, currentUser, unread }}` is a fresh object literal
  on every render.
- **Symptom:** Consumers re-render whenever the provider re-renders, even if the
  underlying values are identical (e.g. when the page re-renders from typing).
- **Why did this render?:** **Context changed** (value identity changed though
  data did not)
- **Category:** frequency
- **Interaction to profile:** Type in the search box and watch the TopBar
  consumers re-render even though theme/user are unchanged.
- **Intended fix:** `useMemo` the value object and wrap `toggleTheme` in
  `useCallback`, so the provider value identity is stable across renders.

### 3 — Search state lifted to the page root

- **Component / file:** `RenderLabPage` in `page.tsx` (`search`, `status`,
  `company`, `selectedId` all live here).
- **Symptom:** Typing a single character re-renders the entire dashboard subtree
  (StatCards, Filters, ContactList, DetailPanel).
- **Why did this render? (on the children):** **The parent component rendered**
- **Category:** frequency
- **Interaction to profile:** Type in the search input; inspect children like the
  non-memoized stat `Card`s or `DetailPanel`.
- **Intended fix:** Colocate the search/filter state in the list subtree (e.g. a
  `<ContactsSection>` that owns its own filter state), so typing only re-renders
  the list, not the whole page.

### 4 — `memo` busted by inline props

- **Component / file:** `Row` (`React.memo`) in `components/Row.tsx`; props passed
  by `ContactList` in `components/ContactList.tsx` — `style={{ ... }}` and
  `onClick={() => onSelect(c.id)}` are created inline.
- **Symptom:** Despite `React.memo`, every row re-renders on each parent render
  because the `style` object and `onClick` function are new references each time.
- **Why did this render?:** **Props changed (style, onClick)**
- **Category:** frequency
- **Interaction to profile:** Type in search (or select a row) and inspect any
  `Row` — the changed props are `style` and `onClick`.
- **Intended fix:** Give `Row` stable props — move the border color to a CSS class
  (or memoize the style), and pass a stable handler (e.g. `useCallback`, or have
  the row call `onSelect(id)` from a stable callback / data attribute).

### 5 — Expensive derive in the render body

- **Component / file:** `ContactList` in `components/ContactList.tsx` — the
  `filter().sort()` over 5,000 contacts runs inline in the render body with no
  `useMemo`.
- **Symptom:** High **self** render time on `ContactList`; the full filter+sort
  recomputes on every keystroke.
- **Why did this render? / signal:** Not a "why" cause per se — it shows up as
  large **self render time** for `ContactList` in the ranked chart, recomputed
  each render.
- **Category:** expense
- **Interaction to profile:** Type in search and read the ranked chart / self
  time for `ContactList`.
- **Intended fix:** `useMemo` the filtered + sorted array, keyed on
  `[contacts, search, status, company]`.

### 6 — Large un-virtualized list

- **Component / file:** `ContactList` in `components/ContactList.tsx` — maps every
  filtered contact (~5,000 with an empty search) straight to the DOM.
- **Symptom:** Wide flamegraph bar and high **commit duration**; thousands of
  `Row` nodes mounted/updated at once.
- **Why did this render? / signal:** Commit duration / flamegraph width (DOM
  size), distinct from #5's compute cost.
- **Category:** expense
- **Interaction to profile:** Load with an empty search (5,000 rows) and record a
  commit; observe the wide bar and long commit time.
- **Intended fix:** Virtualize the list (`@tanstack/react-virtual` or
  `react-window`) or paginate so only visible rows are in the DOM.

### 7 — Self-updating ticker

- **Component / file:** `SessionClock` in `components/TopBar.tsx` — owns its own
  `useState` + `setInterval`.
- **Symptom:** Re-renders itself once per second.
- **Why did this render?:** **Hooks changed** (its own `useState` updated)
- **Category:** frequency
- **Interaction to profile:** Let it run; record a few seconds and inspect
  `SessionClock`.
- **Intended fix:** This is the *benign* example — because its state is colocated,
  it only re-renders itself and nothing cascades. The lesson is the contrast with
  offender 1: a self-ticking component is fine as long as its volatile state is
  not shared via context. (If you wanted fewer renders, throttle to only update
  when the displayed value changes.)

---

## Controls (should stay gray / not re-render)

- **`AppTitle`** (`components/TopBar.tsx`) — `React.memo` with a stable string
  prop. Never re-renders after mount.
- **`TotalCard`** (`components/StatCards.tsx`) — `React.memo` with a stable
  `total={5000}` prop. Stays gray across typing and ticking.
- **`QuickNote`** (`page.tsx`) — state is colocated; typing in its textarea
  re-renders only `QuickNote`, nothing else. Direct contrast to offender 3.

---

## "Why did this render?" coverage

| Cause | Where observable |
| --- | --- |
| **First mount** | Every component on initial load |
| **Hooks changed** | `SessionClock` (offender 7) |
| **The parent component rendered** | Page children when typing (offender 3) |
| **Props changed** | `Row` — style, onClick (offender 4) |
| **Context changed** | TopBar consumers (offenders 1 & 2) |

All five causes are observable.
