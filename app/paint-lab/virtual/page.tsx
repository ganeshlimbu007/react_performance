import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Virtual } from "./Virtual";

export const metadata = { title: "Paint Lab · virtualisation" };

const MODES = ["plain", "window"] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function VirtualPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "plain";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "plain"
  ) as "plain" | "window";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>P3 — virtualisation versus DOM size</h1>
        <p className="lead">
          5,000 rows with three spans each. &ldquo;Change theme&rdquo;
          re-renders every visible row.
        </p>
      </header>

      <p className="sl-setup">
        {mode === "plain"
          ? "Every row is rendered into the DOM."
          : "Rows are rendered by react-window's List, with a row height of 24 px in a 600 px viewport."}
      </p>

      <VariantSwitch
        label="mode"
        basePath="/paint-lab/virtual"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <Virtual mode={mode} />

      <p className="hud-note">
        Use the browser&rsquo;s find-in-page to search for the last row&rsquo;s
        name in both modes.
      </p>
    </article>
  );
}
