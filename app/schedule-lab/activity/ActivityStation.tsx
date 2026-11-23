"use client";

import { Activity, useState } from "react";
import { LabProfiler } from "../../_lab-kit/LabProfiler";
import { Details, Notes, Overview } from "./Panels";

const TABS = ["overview", "details", "notes"] as const;
type Tab = (typeof TABS)[number];

export function ActivityStation({ mode }: { mode: "unmount" | "activity" }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [version, setVersion] = useState(1);

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
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        <button onClick={() => setVersion((v) => v + 1)}>
          Bump version ({version})
        </button>
      </div>

      <LabProfiler id="panels">
        {mode === "unmount" ? (
          <>
            {tab === "overview" && <Overview version={version} />}
            {tab === "details" && <Details version={version} />}
            {tab === "notes" && <Notes version={version} />}
          </>
        ) : (
          <>
            <Activity mode={tab === "overview" ? "visible" : "hidden"}>
              <Overview version={version} />
            </Activity>
            <Activity mode={tab === "details" ? "visible" : "hidden"}>
              <Details version={version} />
            </Activity>
            <Activity mode={tab === "notes" ? "visible" : "hidden"}>
              <Notes version={version} />
            </Activity>
          </>
        )}
      </LabProfiler>
    </>
  );
}
