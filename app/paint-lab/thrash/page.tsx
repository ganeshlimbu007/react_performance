import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Thrash } from "./Thrash";

export const metadata = { title: "Paint Lab · layout thrashing" };

const MODES = ["interleave", "batch", "per-component"] as const;
type Mode = (typeof MODES)[number];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const SETUP: Record<Mode, string> = {
  interleave:
    "The wrapper's offsetWidth is read inside the loop that writes each box's width.",
  batch: "The wrapper's offsetWidth is read once, then every box is written.",
  "per-component":
    "200 child components each read the wrapper and write their own box in a useLayoutEffect when a version prop changes.",
};

export default async function ThrashPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "interleave";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "interleave"
  ) as Mode;

  return (
    <article className="page">
      <header className="sl-head">
        <h1>P2 — layout thrashing</h1>
        <p className="lead">
          1,000 boxes inside a 600 px wrapper; each pass sets every box&rsquo;s
          width from the wrapper&rsquo;s width.
        </p>
      </header>

      <p className="sl-setup">{SETUP[mode]}</p>

      <VariantSwitch
        label="mode"
        basePath="/paint-lab/thrash"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <Thrash mode={mode} />
    </article>
  );
}
