import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Keystroke } from "./Keystroke";

export const metadata = { title: "Schedule Lab · one keystroke, four ways" };

const MODES = ["sync", "transition", "deferred", "deferred-nomemo"] as const;
export type KeystrokeMode = (typeof MODES)[number];

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

const DESCRIPTION: Record<KeystrokeMode, string> = {
  sync: "One piece of state holds the query; the input and the list both read it.",
  transition:
    "The input keeps its own urgent state; a second state for the list is set inside startTransition in the same onChange.",
  deferred:
    "The list receives a deferred copy of the query and is wrapped in memo.",
  "deferred-nomemo":
    "The list receives the same deferred copy of the query, but is not wrapped in memo.",
};

export default async function KeystrokePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const rawMode = one(sp.mode) as KeystrokeMode | undefined;
  const mode: KeystrokeMode =
    rawMode && (MODES as readonly string[]).includes(rawMode)
      ? rawMode
      : "sync";

  const rows = clamp(Number(one(sp.rows) ?? 200) || 200, 50, 400);
  const cost = clamp(Number(one(sp.cost) ?? 0.25) || 0, 0, 2);
  const probe = one(sp.probe) === "1";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 1 — one keystroke, four ways</h1>
        <p className="lead">
          400 items, up to {rows} matches shown, {cost} ms synthetic cost per
          row.
        </p>
      </header>

      <p className="sl-setup">{DESCRIPTION[mode]}</p>

      <VariantSwitch
        label="mode"
        basePath="/schedule-lab/keystroke"
        param="mode"
        current={mode}
        options={[...MODES]}
        extra={{
          rows: String(rows),
          cost: String(cost),
          probe: probe ? "1" : undefined,
        }}
      />
      <VariantSwitch
        label="probe"
        basePath="/schedule-lab/keystroke"
        param="probe"
        current={probe ? "1" : "0"}
        options={["0", "1"]}
        extra={{ mode, rows: String(rows), cost: String(cost) }}
      />

      <Keystroke mode={mode} rows={rows} cost={cost} probe={probe} />
    </article>
  );
}
