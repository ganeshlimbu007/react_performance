import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Cascade } from "./Cascade";

export const metadata = { title: "Shapes Lab · effect cascades" };

const MODES = ["derive", "effect", "layout-effect"] as const;
type Mode = (typeof MODES)[number];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const SETUP: Record<Mode, string> = {
  derive: "The value shown by the heavy child is computed during render.",
  effect:
    "The value is held in state and set inside a useEffect that runs when n changes.",
  "layout-effect":
    "The value is held in state and set inside a useLayoutEffect that runs when n changes.",
};

export default async function CascadePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "derive";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "derive"
  ) as Mode;

  return (
    <article className="page">
      <header className="sl-head">
        <h1>S1 — effect cascades</h1>
        <p className="lead">
          A button increments <code>n</code>; a heavy child with 60 ms of
          synthetic cost shows a value derived from it.
        </p>
      </header>

      <p className="sl-setup">{SETUP[mode]}</p>

      <VariantSwitch
        label="mode"
        basePath="/shapes-lab/cascade"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <Cascade mode={mode} />

      <p className="hud-note">
        The frame logger reads the child&rsquo;s visible text once per animation
        frame for 300 ms after the click, so the sequence below shows what was
        actually on screen each frame.
      </p>
    </article>
  );
}
