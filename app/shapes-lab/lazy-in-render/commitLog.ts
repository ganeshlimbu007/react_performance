"use client";

/** Records which component committed, in order, per parent update. */
export const commitLog = {
  entries: [] as string[],
};

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

export function record(what: string) {
  commitLog.entries = [...commitLog.entries, what].slice(-12);
  emit();
}

export function startUpdate() {
  commitLog.entries = [...commitLog.entries, "—"].slice(-12);
  emit();
}

export function resetLog() {
  commitLog.entries = [];
  emit();
}
