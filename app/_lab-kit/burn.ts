/**
 * Deterministic synthetic cost.
 *
 * Busy-waits on performance.now() until `ms` have elapsed. Used so that every
 * station has a known, repeatable amount of main-thread work, independent of
 * machine speed in *shape* (though not in absolute ms).
 *
 * This is labelled "synthetic cost" wherever it appears in the UI.
 */
export function burn(ms: number): void {
  if (!(ms > 0)) return;
  const end = performance.now() + ms;
  // eslint-disable-next-line no-empty
  while (performance.now() < end) {}
}
