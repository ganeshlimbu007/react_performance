"use client";

import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { count } from "../../_lab-kit/counters";
import { actions, useSelector } from "./store";
import { mark, meta, startAction, subscribe, tally } from "./tally";

const CONSUMERS = ["ThemeReader", "UserReader", "NonReader", "DispatchButton"];

/* ----------------------------- single context ---------------------------- */

type Ctx = { theme: string; user: string; dispatch: (a: Action) => void };
const AppCtx = createContext<Ctx | null>(null);
const useApp = () => useContext(AppCtx)!;

const ThemeReaderCtx = memo(function ThemeReader() {
  count("ThemeReader");
  mark("ThemeReader");
  const { theme } = useApp();
  return <div className="sh-cell">ThemeReader — theme: {theme}</div>;
});

const UserReaderCtx = memo(function UserReader() {
  count("UserReader");
  mark("UserReader");
  const { user } = useApp();
  return <div className="sh-cell">UserReader — user: {user}</div>;
});

const NonReader = memo(function NonReader() {
  count("NonReader");
  mark("NonReader");
  return <div className="sh-cell">NonReader — reads no context</div>;
});

const DispatchButtonCtx = memo(function DispatchButton() {
  count("DispatchButton");
  mark("DispatchButton");
  const { dispatch } = useApp();
  return (
    <button onClick={() => dispatch({ type: "changeUser" })}>
      DispatchButton — change user
    </button>
  );
});

/* -------------------------------- reducer -------------------------------- */

type Action =
  | { type: "bump" }
  | { type: "changeUser" }
  | { type: "sameUser" };
type RState = { theme: string; user: string; tick: number };

function reducer(s: RState, a: Action): RState {
  switch (a.type) {
    case "bump":
      return { ...s, tick: s.tick + 1 };
    case "changeUser":
      return { ...s, user: s.user === "ada" ? "grace" : "ada" };
    case "sameUser":
      return { ...s, user: s.user };
    default:
      return s;
  }
}

/* ------------------------------ mode: inline ----------------------------- */

function InlineProvider() {
  const [state, dispatch] = useReducer(reducer, {
    theme: "light",
    user: "ada",
    tick: 0,
  });

  return (
    <AppCtx.Provider
      value={{ theme: state.theme, user: state.user, dispatch }}
    >
      <Buttons dispatch={dispatch} />
      <Panel />
    </AppCtx.Provider>
  );
}

/* ------------------------------- mode: memo ------------------------------ */

function MemoProvider() {
  const [state, dispatch] = useReducer(reducer, {
    theme: "light",
    user: "ada",
    tick: 0,
  });

  const value = useMemo(
    () => ({ theme: state.theme, user: state.user, dispatch }),
    [state.theme, state.user, dispatch],
  );

  return (
    <AppCtx.Provider value={value}>
      <Buttons dispatch={dispatch} />
      <Panel />
    </AppCtx.Provider>
  );
}

/* ------------------------------ mode: split ------------------------------ */

const StateCtx = createContext<{ theme: string; user: string } | null>(null);
const DispatchCtx = createContext<((a: Action) => void) | null>(null);

const ThemeReaderSplit = memo(function ThemeReader() {
  count("ThemeReader");
  mark("ThemeReader");
  const { theme } = useContext(StateCtx)!;
  return <div className="sh-cell">ThemeReader — theme: {theme}</div>;
});

const UserReaderSplit = memo(function UserReader() {
  count("UserReader");
  mark("UserReader");
  const { user } = useContext(StateCtx)!;
  return <div className="sh-cell">UserReader — user: {user}</div>;
});

const DispatchButtonSplit = memo(function DispatchButton() {
  count("DispatchButton");
  mark("DispatchButton");
  const dispatch = useContext(DispatchCtx)!;
  return (
    <button onClick={() => dispatch({ type: "changeUser" })}>
      DispatchButton — change user
    </button>
  );
});

function SplitProvider() {
  const [state, dispatch] = useReducer(reducer, {
    theme: "light",
    user: "ada",
    tick: 0,
  });

  const stateValue = useMemo(
    () => ({ theme: state.theme, user: state.user }),
    [state.theme, state.user],
  );

  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={stateValue}>
        <Buttons dispatch={dispatch} />
        <div className="sh-grid">
          <ThemeReaderSplit />
          <UserReaderSplit />
          <NonReader />
          <DispatchButtonSplit />
        </div>
      </StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

/* ------------------------------ mode: store ------------------------------ */

const ThemeReaderStore = memo(function ThemeReader() {
  count("ThemeReader");
  mark("ThemeReader");
  const theme = useSelector((s) => s.theme);
  return <div className="sh-cell">ThemeReader — theme: {theme}</div>;
});

const UserReaderStore = memo(function UserReader() {
  count("UserReader");
  mark("UserReader");
  const user = useSelector((s) => s.user);
  return <div className="sh-cell">UserReader — user: {user}</div>;
});

const DispatchButtonStore = memo(function DispatchButton() {
  count("DispatchButton");
  mark("DispatchButton");
  return (
    <button onClick={() => actions.changeUser()}>
      DispatchButton — change user
    </button>
  );
});

function StoreHost() {
  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            startAction("Bump unrelated state");
            actions.bump();
          }}
        >
          Bump unrelated state
        </button>
        <button
          onClick={() => {
            startAction("Change user");
            actions.changeUser();
          }}
        >
          Change user
        </button>
        <button
          onClick={() => {
            startAction("Set user to the same value");
            actions.sameUser();
          }}
        >
          Set user to the same value
        </button>
      </div>
      <div className="sh-grid">
        <ThemeReaderStore />
        <UserReaderStore />
        <NonReader />
        <DispatchButtonStore />
      </div>
    </>
  );
}

/* -------------------------------- shared --------------------------------- */

function Buttons({ dispatch }: { dispatch: (a: Action) => void }) {
  return (
    <div className="sl-controls">
      <button
        onClick={() => {
          startAction("Bump unrelated state");
          dispatch({ type: "bump" });
        }}
      >
        Bump unrelated state
      </button>
      <button
        onClick={() => {
          startAction("Change user");
          dispatch({ type: "changeUser" });
        }}
      >
        Change user
      </button>
      <button
        onClick={() => {
          startAction("Set user to the same value");
          dispatch({ type: "sameUser" });
        }}
      >
        Set user to the same value
      </button>
    </div>
  );
}

function Panel() {
  return (
    <div className="sh-grid">
      <ThemeReaderCtx />
      <UserReaderCtx />
      <NonReader />
      <DispatchButtonCtx />
    </div>
  );
}

function TallyTable() {
  const [, setTick] = useState(0);
  // The consumers fill the tally during render, so by the time this component
  // hydrates the numbers already differ from the server's. Render it only
  // after mounting rather than hydrating a mismatched table.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 250);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return <div className="sl-log">collecting…</div>;

  return (
    <div className="sl-log">
      <div className="sl-metric">
        <span>last button press</span>
        <span className="mono">{meta.lastAction || "—"}</span>
      </div>
      {CONSUMERS.map((name) => (
        <div className="sl-metric" key={name}>
          <span>{name} rendered</span>
          <span className="mono">{tally[name] ?? 0}×</span>
        </div>
      ))}
    </div>
  );
}

export function ContextStation({
  mode,
}: {
  mode: "inline" | "memo" | "split" | "store";
}) {
  return (
    <>
      {mode === "inline" && <InlineProvider />}
      {mode === "memo" && <MemoProvider />}
      {mode === "split" && <SplitProvider />}
      {mode === "store" && <StoreHost />}
      <TallyTable />
    </>
  );
}
