"use client";

/** Per-consumer render tally for the last button press. */
export const tally: Record<string, number> = {};
export const meta = { lastAction: "" };

const listeners = new Set<() => void>();
export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function emit() {
  for (const fn of listeners) fn();
}

/** Called from a consumer's body. */
export function mark(name: string) {
  tally[name] = (tally[name] ?? 0) + 1;
}

/** Called from a button handler, before the state change. */
export function startAction(label: string) {
  for (const k of Object.keys(tally)) delete tally[k];
  meta.lastAction = label;
  emit();
}
