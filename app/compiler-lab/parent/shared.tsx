"use client";

import { burn } from "../../_lab-kit/burn";
import { count } from "../../_lab-kit/counters";

/** Counted and 2 ms of synthetic cost, so caching it is observable. */
export function expensive(q: string): number {
  count("expensive");
  burn(2);
  return q.length * 100;
}

/** Plain components shared by both copies of Parent. Both count their bodies. */
export function Child({
  style,
  onPick,
  label,
}: {
  style: React.CSSProperties;
  onPick: () => void;
  label: string;
}) {
  count("Child");
  return (
    <button style={style} onClick={onPick}>
      Child — label {label}
    </button>
  );
}

export function Price({ amount }: { amount: number }) {
  count("Price");
  return <span className="cl-price">Price: {amount}</span>;
}
