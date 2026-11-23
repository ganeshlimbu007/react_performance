import { mulberry32 } from "../_lab-kit/seeded";

export type PaintRow = { id: number; name: string; email: string };

/** 5,000 deterministic rows, generated once. */
function build(n: number, seed: number): PaintRow[] {
  const rand = mulberry32(seed);
  const FIRST = ["ava", "liam", "noah", "emma", "ethan", "mia", "lucas", "zoe"];
  const LAST = ["smith", "jones", "garcia", "lee", "khan", "novak", "silva"];
  const rows: PaintRow[] = [];
  for (let i = 0; i < n; i++) {
    const f = FIRST[Math.floor(rand() * FIRST.length)];
    const l = LAST[Math.floor(rand() * LAST.length)];
    rows.push({
      id: i + 1,
      name: `${f} ${l} ${i + 1}`,
      email: `${f}.${l}.${i + 1}@example.com`,
    });
  }
  return rows;
}

export const PAINT_ROWS = build(5000, 2024);
