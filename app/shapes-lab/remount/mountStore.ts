"use client";

/**
 * Counts how many element nodes the list gains per parent update, using a
 * MutationObserver rather than an effect: a hook inside an inner component
 * would change what the compiler does to that component, which is exactly
 * what this station is measuring.
 */
export const mountStore = {
  updates: 0,
  lastAdded: 0,
  totalAdded: 0,
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

export function resetMounts() {
  mountStore.updates = 0;
  mountStore.lastAdded = 0;
  mountStore.totalAdded = 0;
  emit();
}

/** Called by the station shell when the user clicks "Re-render parent". */
export function noteUpdate() {
  mountStore.updates += 1;
  pendingAdded = 0;
}

let pendingAdded = 0;
let flushHandle: number | null = null;

export function observe(target: Element): () => void {
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) pendingAdded += 1;
      });
    }
    if (flushHandle === null) {
      flushHandle = window.setTimeout(() => {
        flushHandle = null;
        mountStore.lastAdded = pendingAdded;
        mountStore.totalAdded += pendingAdded;
        pendingAdded = 0;
        emit();
      }, 0);
    }
  });
  mo.observe(target, { childList: true, subtree: true });
  return () => mo.disconnect();
}
