import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Animate } from "./Animate";

export const metadata = { title: "Paint Lab · animation" };

const MODES = ["state", "left", "transform"] as const;
type Mode = (typeof MODES)[number];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const SETUP: Record<Mode, string> = {
  state:
    "setX runs on every requestAnimationFrame and the box is rendered with style={{ left: x }}.",
  left: "A CSS keyframe animation on the left property.",
  transform: "A CSS keyframe animation on transform: translateX().",
};

export default async function AnimatePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "state";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "state"
  ) as Mode;
  const busy = one(sp.busy) === "1";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>P4 — animation</h1>
        <p className="lead">
          A 48 px box moves back and forth across 400 px for 3 seconds after you
          press Play.
        </p>
      </header>

      <p className="sl-setup">
        {SETUP[mode]}{" "}
        {busy
          ? "busy=1 also runs 30 ms of synthetic cost every 100 ms during the animation."
          : "The main thread is otherwise idle."}
      </p>

      <VariantSwitch
        label="mode"
        basePath="/paint-lab/animate"
        param="mode"
        current={mode}
        options={[...MODES]}
        extra={{ busy: busy ? "1" : undefined }}
      />
      <VariantSwitch
        label="busy"
        basePath="/paint-lab/animate"
        param="busy"
        current={busy ? "1" : "0"}
        options={["0", "1"]}
        extra={{ mode }}
      />

      <Animate mode={mode} busy={busy} />
    </article>
  );
}
