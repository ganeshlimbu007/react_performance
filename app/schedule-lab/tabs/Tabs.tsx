"use client";

import { useState, useTransition } from "react";
import { burn } from "../../_lab-kit/burn";
import { count } from "../../_lab-kit/counters";
import { LabProfiler } from "../../_lab-kit/LabProfiler";
import type { TabsMode } from "./page";

const TABS = ["overview", "activity", "settings"] as const;
type Tab = (typeof TABS)[number];

const ROWS = 200;

function Panel({ tab, cost }: { tab: Tab; cost: number }) {
  count("Panel");
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    rows.push(
      <Row key={i} label={`${tab} · row ${i}`} cost={cost} />,
    );
  }
  return (
    <div
      className="sl-rows"
      role="tabpanel"
      id={`panel-${tab}`}
      aria-labelledby={`tab-${tab}`}
    >
      {rows}
    </div>
  );
}

function Row({ label, cost }: { label: string; cost: number }) {
  count("Row");
  burn(cost);
  return <div className="sl-row">{label}</div>;
}

export function Tabs({ mode, cost }: { mode: TabsMode; cost: number }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [isPending, startTransition] = useTransition();

  function select(next: Tab) {
    if (mode === "transition") {
      startTransition(() => setTab(next));
    } else {
      setTab(next);
    }
  }

  return (
    <>
      <div className="sl-tablist" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t}
            id={`tab-${t}`}
            role="tab"
            aria-selected={t === tab}
            aria-controls={`panel-${t}`}
            onClick={() => select(t)}
          >
            {t}
          </button>
        ))}
        {mode === "transition" && isPending && (
          <span className="sl-pending" role="status">
            updating…
          </span>
        )}
      </div>

      <div className={mode === "transition" && isPending ? "sl-dim" : undefined}>
        <LabProfiler id="panel">
          <Panel tab={tab} cost={cost} />
        </LabProfiler>
      </div>
    </>
  );
}
