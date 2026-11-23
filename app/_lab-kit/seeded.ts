/**
 * Seeded pseudo-random data. No Math.random() anywhere in the labs, and no
 * network: every run must profile the same data.
 */

/** mulberry32 — small, fast, deterministic. */
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stable strings shaped like `item-<base36>-<index>`.
 *
 * Typing `item-1` filters them progressively: `i`, `it`, `ite`, `item` and
 * `item-` all match everything, and `item-1` narrows to the items whose token
 * starts with "1".
 */
export function makeItems(n: number, seed: number): string[] {
  const rand = mulberry32(seed);
  const items: string[] = [];
  for (let i = 0; i < n; i++) {
    const token = Math.floor(rand() * 36 ** 4)
      .toString(36)
      .padStart(4, "0");
    items.push(`item-${token}-${i}`);
  }
  return items;
}

/** A deterministic word pool, for the markdown generator in the load lab. */
export function makeWords(n: number, seed: number): string[] {
  const rand = mulberry32(seed);
  const SYLLABLES = [
    "ra", "te", "lo", "mi", "sa", "do", "ne", "ku", "vi", "pa",
    "zo", "fe", "tu", "ba", "qui", "ler", "mon", "dar", "sel", "tri",
  ];
  const words: string[] = [];
  for (let i = 0; i < n; i++) {
    const len = 2 + Math.floor(rand() * 2);
    let w = "";
    for (let j = 0; j < len; j++) {
      w += SYLLABLES[Math.floor(rand() * SYLLABLES.length)];
    }
    words.push(w);
  }
  return words;
}
