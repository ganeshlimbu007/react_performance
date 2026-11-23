"use client";

import type { ComponentType } from "react";

/** Everything this station records, in ms on the performance timeline. */
export const timeline = {
  clickedAt: null as number | null,
  importStartedAt: null as number | null,
  fallbackAt: null as number | null,
  resolvedAt: null as number | null,
  revealedAt: null as number | null,
  warmed: false,
  delay: 150,
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

function mark(name: string) {
  try {
    performance.mark(name);
  } catch {
    // ignore
  }
}

export function recordClick() {
  timeline.clickedAt = performance.now();
  mark("reveal-click");
  emit();
}

export function recordFallback() {
  if (timeline.fallbackAt === null) {
    timeline.fallbackAt = performance.now();
    mark("reveal-fallback-commit");
    emit();
  }
}

export function recordResolved(now: number, start: number) {
  timeline.resolvedAt = now;
  timeline.importStartedAt = start;
  mark("reveal-module-resolved");
  emit();
}

export function recordRevealed() {
  if (timeline.revealedAt === null) {
    timeline.revealedAt = performance.now();
    mark("reveal-panelB-commit");
    emit();
  }
}

/**
 * One shared promise for panel B's delayed import. The lazy factory and the
 * hover/focus warm-up both call this, so they never start two loads.
 */
let panelBPromise:
  | Promise<{ default: ComponentType<Record<string, never>> }>
  | null = null;

export function loadPanelB() {
  if (!panelBPromise) {
    const d = Number(
      new URLSearchParams(window.location.search).get("delay") ?? 150,
    );
    timeline.delay = d;
    const start = performance.now();
    timeline.importStartedAt = start;
    mark("reveal-import-start");
    panelBPromise = new Promise<void>((r) => setTimeout(r, d))
      .then(() => import("./PanelB"))
      .then((m) => {
        recordResolved(performance.now(), start);
        return m as { default: ComponentType<Record<string, never>> };
      });
  }
  return panelBPromise;
}

/** Called from onPointerEnter / onFocus when warm=1. */
export function warmPanelB() {
  if (!panelBPromise) {
    timeline.warmed = true;
    emit();
  }
  void loadPanelB();
}

export function hasStartedLoad() {
  return panelBPromise !== null;
}
