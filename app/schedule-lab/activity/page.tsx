import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { ActivityStation } from "./ActivityStation";

export const metadata = { title: "Schedule Lab · hidden but alive" };

const MODES = ["unmount", "activity"] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "unmount";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "unmount"
  ) as "unmount" | "activity";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 4 — hidden but alive</h1>
        <p className="lead">
          Three tabs. Details has an 80 ms synthetic render, local input state,
          and logs its mount and cleanup to the console.
        </p>
      </header>

      <p className="sl-setup">
        {mode === "unmount"
          ? "Each panel is rendered only while its tab is selected: {tab === 'details' && <Details />}."
          : "Every panel stays mounted inside <Activity>, with mode='visible' for the selected tab and mode='hidden' for the others."}{" "}
        &ldquo;Bump version&rdquo; changes a <code>version</code> prop passed to
        every panel. Marks written: <code>details-commit</code>,{" "}
        <code>visible-commit</code>.
      </p>

      <VariantSwitch
        label="mode"
        basePath="/schedule-lab/activity"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <ActivityStation mode={mode} />

      <p className="hud-note">
        The HUD&rsquo;s counters show component body executions, so a hidden
        panel that re-renders still increments its counter even though its
        effects do not run.
      </p>
    </article>
  );
}
