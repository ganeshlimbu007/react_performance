"use client";

import { memo, useState } from "react";
import { count } from "../../_lab-kit/counters";
import { LabProfiler } from "../../_lab-kit/LabProfiler";
import { PAINT_ROWS, type PaintRow } from "../data";

/** change=container: memoised, and takes only the row object. */
const MemoRow = memo(function MemoRow({ row }: { row: PaintRow }) {
  count("Row");
  return (
    <div className="pl-row">
      <span>{row.name}</span>
      <span>{row.email}</span>
    </div>
  );
});

/** change=rows: not memoised, receives dense, and sets inline padding. */
function DenseRow({ row, dense }: { row: PaintRow; dense: boolean }) {
  count("Row");
  return (
    <div
      className="pl-row"
      style={{ padding: dense ? "2px 8px" : "6px 8px" }}
    >
      <span>{row.name}</span>
      <span>{row.email}</span>
    </div>
  );
}

export function Density({
  change,
  cv,
}: {
  change: "container" | "rows";
  cv: boolean;
}) {
  const [dense, setDense] = useState(false);

  const classes = [
    "pl-list",
    cv ? "pl-cv" : "",
    change === "container" && dense ? "pl-dense" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="sl-controls">
        <button onClick={() => setDense((d) => !d)}>
          {dense ? "Comfortable" : "Dense"} rows
        </button>
        <span className="mono">
          {PAINT_ROWS.length.toLocaleString()} rows ·{" "}
          {cv ? "content-visibility on" : "content-visibility off"}
        </span>
      </div>

      <LabProfiler id="list">
        <div className={classes}>
          {change === "container"
            ? PAINT_ROWS.map((row) => <MemoRow key={row.id} row={row} />)
            : PAINT_ROWS.map((row) => (
                <DenseRow key={row.id} row={row} dense={dense} />
              ))}
        </div>
      </LabProfiler>
    </>
  );
}
