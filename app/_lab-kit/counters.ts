/**
 * Module-level counters.
 *
 * Components call `count('Row')` in their body, so these count *body
 * executions* — which is exactly what makes an abandoned/duplicated render
 * visible, rather than only the commits the Profiler reports.
 *
 * Note: in `next dev` Strict Mode double-invokes component bodies, so every
 * number here doubles. Only take readings from a production build.
 */

const counters = new Map<string, number>();
let generation = 0;

export function count(name: string): void {
  counters.set(name, (counters.get(name) ?? 0) + 1);
}

export function read(): Record<string, number> {
  return Object.fromEntries(counters);
}

export function reset(): void {
  counters.clear();
  generation++;
}

/** Bumped by reset(), so pollers can tell a cleared state from a quiet one. */
export function getGeneration(): number {
  return generation;
}

declare global {
  interface Window {
    __lab?: {
      count: typeof count;
      read: typeof read;
      reset: typeof reset;
    };
  }
}

if (typeof window !== "undefined") {
  window.__lab = { count, read, reset };
}
