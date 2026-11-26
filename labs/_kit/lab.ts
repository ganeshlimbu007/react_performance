import { test, expect, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export { test, expect };
export type { Page };

/** The verdict on the SENTENCE as it is usually stated, not on the code. */
export type Verdict = 'holds' | 'partly' | 'wrong';

export type Claim = {
  id: string;
  say: string;
  book: Verdict;
  run: (page: Page) => Promise<unknown>;
  expect: unknown;
};

const VENDOR = process.env.LAB_VENDOR;

/**
 * React 18.3.1 UMD. The profiling build is production code with the Profiler's timers
 * compiled in; on react-dom.production.min.js, onRender never fires at all (C4.13).
 * UMD builds were dropped in React 19, which is why these labs pin 18.
 */
export function src(name: string) {
  if (VENDOR && existsSync(resolve(VENDOR, name))) return { path: resolve(VENDOR, name) };
  const pkg = name.startsWith('react-dom') ? 'react-dom' : 'react';
  return { url: `https://cdn.jsdelivr.net/npm/${pkg}@18.3.1/umd/${name}` };
}

/** Two frames and a tick: enough for a sync commit and its MutationObserver records. */
export const settle = (page: Page) =>
  page.evaluate(() => new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 20)))));

export type BootOptions = {
  /** the container markup the harness mounts into */
  html: string;
  /** the harness source: mounts the subjects and exposes window.__lab */
  harness: string;
  /** anything that has to run before React loads */
  pre?: string;
  build?: 'profiling' | 'production';
};

export async function boot(page: Page, o: BootOptions) {
  const build = o.build ?? 'profiling';
  await page.setContent(o.html);
  if (o.pre) await page.addScriptTag({ content: o.pre });
  await page.addScriptTag(src(`react.${build}.min.js`));
  await page.addScriptTag(src(`react-dom.${build}.min.js`));
  await page.addScriptTag({ content: o.harness });
  await page.waitForFunction('window.__ready === true');
  await settle(page);
}

/** Call a method the harness put on window.__lab. */
export function lab<T = unknown>(page: Page, fn: string, ...args: unknown[]) {
  return page.evaluate(
    ([f, a]) => (window as unknown as { __lab: Record<string, (...x: unknown[]) => unknown> }).__lab[f as string](...(a as unknown[])),
    [fn, args] as const,
  ) as Promise<T>;
}

/** Click a button by id, n times, letting each update settle. */
export async function press(page: Page, id: string, times = 1, gap = 50) {
  for (let i = 0; i < times; i++) {
    await page.click('#' + id);
    await page.waitForTimeout(gap);
  }
  await settle(page);
}

/** Keep only the named counters, defaulting a component that never ran to 0 rather than dropping it. */
export const only = (all: Record<string, number>, names: string[]) =>
  Object.fromEntries(names.map((n) => [n, all[n] ?? 0]));

/** One test per sentence. */
export function claims(group: string, start: (page: Page) => Promise<void>, list: Claim[]) {
  test.describe(group, () => {
    for (const c of list) {
      test(`${c.id} [${c.book}] ${c.say}`, async ({ page }) => {
        await start(page);
        expect(await c.run(page)).toEqual(c.expect);
      });
    }
  });
}
