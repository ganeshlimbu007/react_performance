"use client";

import type { ComponentType } from "react";

export const editorTimeline = {
  clickedAt: null as number | null,
  committedAt: null as number | null,
  warmed: false,
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

/** One shared promise, so a warm-up and the lazy factory never load twice. */
let editorPromise:
  | Promise<{ default: ComponentType<Record<string, never>> }>
  | null = null;

export function loadEditor() {
  if (!editorPromise) {
    mark("editor-import-start");
    editorPromise = import("./Editor") as Promise<{
      default: ComponentType<Record<string, never>>;
    }>;
  }
  return editorPromise;
}

export function warmEditor() {
  if (!editorPromise) {
    editorTimeline.warmed = true;
    emit();
  }
  void loadEditor();
}

export function recordEditorClick() {
  editorTimeline.clickedAt = performance.now();
  mark("editor-click");
  emit();
}

export function recordEditorCommitted() {
  if (editorTimeline.committedAt === null) {
    editorTimeline.committedAt = performance.now();
    mark("editor-commit");
    emit();
  }
}
