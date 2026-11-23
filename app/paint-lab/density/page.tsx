import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Density } from "./Density";

export const metadata = { title: "Paint Lab · density" };

const CHANGES = ["container", "rows"] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function DensityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawChange = one(sp.change) ?? "container";
  const change = (
    (CHANGES as readonly string[]).includes(rawChange) ? rawChange : "container"
  ) as "container" | "rows";
  const cv = one(sp.cv) === "1";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>P1 — density</h1>
        <p className="lead">
          5,000 rows, each a flex row with a name and an email. One click
          toggles the density.
        </p>
      </header>

      <p className="sl-setup">
        {change === "container"
          ? "The rows are memoised and take only the row object; the button toggles a font-size class on the list container."
          : "The rows are not memoised, receive a dense prop, and each sets its own inline padding."}{" "}
        {cv
          ? "The container also has content-visibility: auto with contain-intrinsic-size."
          : "content-visibility is off."}
      </p>

      <VariantSwitch
        label="change"
        basePath="/paint-lab/density"
        param="change"
        current={change}
        options={[...CHANGES]}
        extra={{ cv: cv ? "1" : undefined }}
      />
      <VariantSwitch
        label="cv"
        basePath="/paint-lab/density"
        param="cv"
        current={cv ? "1" : "0"}
        options={["0", "1"]}
        extra={{ change }}
      />

      <Density change={change} cv={cv} />

      <p className="hud-note">
        Read the interaction&rsquo;s three parts in the HUD: input delay,
        processing and presentation.
      </p>
    </article>
  );
}
