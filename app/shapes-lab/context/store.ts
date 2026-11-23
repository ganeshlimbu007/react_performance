"use client";

import { useSyncExternalStore } from "react";

type State = { theme: string; user: string; tick: number };

let state: State = { theme: "light", user: "ada", tick: 0 };
const subs = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const fn of subs) fn();
}

export function subscribe(fn: () => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export const actions = {
  bump: () => set({ tick: state.tick + 1 }),
  changeUser: () => set({ user: state.user === "ada" ? "grace" : "ada" }),
  sameUser: () => set({ user: state.user }),
};

/** Each reader selects a primitive, so an unrelated change bails out. */
export function useSelector<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(state),
  );
}
