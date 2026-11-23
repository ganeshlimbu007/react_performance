"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import { count } from "../../_lab-kit/counters";
import { PAINT_ROWS, type PaintRow } from "../data";

const ROW_HEIGHT = 24;
const VIEWPORT = 600;

function mark(name: string) {
  try {
    performance.mark(name);
  } catch {
    // ignore
  }
}

/** react-window v2 passes { index, style, ariaAttributes, ...rowProps }. */
function WindowRow({
  index,
  style,
  rows,
}: RowComponentProps<{ rows: PaintRow[] }>) {
  count("Row");
  const row = rows[index];
  return (
    <div className="pl-row" style={style}>
      <span>{row.name}</span>
      <span>{row.email}</span>
      <span>{row.id}</span>
    </div>
  );
}

function PlainRow({ row }: { row: PaintRow }) {
  count("Row");
  return (
    <div className="pl-row">
      <span>{row.name}</span>
      <span>{row.email}</span>
      <span>{row.id}</span>
    </div>
  );
}

export function Virtual({ mode }: { mode: "plain" | "window" }) {
  const [dark, setDark] = useState(false);
  const [mountMs, setMountMs] = useState<number | null>(null);
  const [themeMs, setThemeMs] = useState<number | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const themeStart = useRef<number | null>(null);

  // A mark before the list renders, and one in its layout effect.
  if (typeof window !== "undefined" && mountMs === null) {
    mark("virtual-before-render");
  }

  useLayoutEffect(() => {
    mark("virtual-committed");
    const entries = performance.getEntriesByName("virtual-before-render");
    const before = entries[entries.length - 1];
    if (before) setMountMs(performance.now() - before.startTime);
  }, []);

  useLayoutEffect(() => {
    if (themeStart.current !== null) {
      setThemeMs(performance.now() - themeStart.current);
      themeStart.current = null;
    }
  }, [dark]);

  useEffect(() => {
    const el = hostRef.current;
    if (el) setNodes(el.querySelectorAll("*").length);
  }, [mode, dark]);

  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            themeStart.current = performance.now();
            setDark((d) => !d);
          }}
        >
          Change theme
        </button>
        <button onClick={() => setNodes(hostRef.current?.querySelectorAll("*").length ?? 0)}>
          Recount DOM nodes
        </button>
      </div>

      <div className="sl-log">
        <div className="sl-metric">
          <span>mount (before render → layout effect)</span>
          <span className="mono">
            {mountMs === null ? "—" : `${Math.round(mountMs * 10) / 10} ms`}
          </span>
        </div>
        <div className="sl-metric">
          <span>DOM nodes inside the list</span>
          <span className="mono">{nodes ?? "—"}</span>
        </div>
        <div className="sl-metric">
          <span>change theme</span>
          <span className="mono">
            {themeMs === null ? "—" : `${Math.round(themeMs * 10) / 10} ms`}
          </span>
        </div>
      </div>

      <div ref={hostRef} className={dark ? "pl-dark" : undefined}>
        {mode === "plain" ? (
          <div className="pl-list">
            {PAINT_ROWS.map((row) => (
              <PlainRow key={row.id} row={row} />
            ))}
          </div>
        ) : (
          <div className="pl-vlist">
            <List
              rowComponent={WindowRow}
              rowCount={PAINT_ROWS.length}
              rowHeight={ROW_HEIGHT}
              rowProps={{ rows: PAINT_ROWS }}
              style={{ height: VIEWPORT }}
            />
          </div>
        )}
      </div>
    </>
  );
}
