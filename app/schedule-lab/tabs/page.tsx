import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Tabs } from "./Tabs";

export const metadata = { title: "Schedule Lab · a slow tab switch" };

const MODES = ["sync", "transition"] as const;
export type TabsMode = (typeof MODES)[number];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}
function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export default async function TabsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) as TabsMode | undefined;
  const mode: TabsMode =
    raw && (MODES as readonly string[]).includes(raw) ? raw : "sync";
  const cost = clamp(Number(one(sp.cost) ?? 0.25) || 0, 0, 2);

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 2 — a slow tab switch</h1>
        <p className="lead">
          Each tab renders 200 rows with {cost} ms synthetic cost per row.
        </p>
      </header>

      <p className="sl-setup">
        {mode === "sync"
          ? "Clicking a tab calls setTab directly."
          : "Clicking a tab calls setTab inside startTransition, and the panel is dimmed while isPending is true."}
      </p>

      <VariantSwitch
        label="mode"
        basePath="/schedule-lab/tabs"
        param="mode"
        current={mode}
        options={[...MODES]}
        extra={{ cost: String(cost) }}
      />

      <Tabs mode={mode} cost={cost} />
    </article>
  );
}
