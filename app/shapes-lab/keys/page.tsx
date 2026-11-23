import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Keys } from "./Keys";

export const metadata = { title: "Shapes Lab · keys" };

const OPTIONS = ["index", "id"] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function KeysPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.keys) ?? "index";
  const keys = (
    (OPTIONS as readonly string[]).includes(raw) ? raw : "index"
  ) as "index" | "id";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>S4 — keys</h1>
        <p className="lead">
          1,000 memoised rows, each with an uncontrolled input naming its own
          row. The button prepends one row.
        </p>
      </header>

      <p className="sl-setup">
        Rows are keyed by{" "}
        {keys === "index"
          ? "their array index."
          : "a stable id that belongs to the row."}{" "}
        A <code>MutationObserver</code> on the list counts DOM mutation records
        by type for the last prepend.
      </p>

      <VariantSwitch
        label="keys"
        basePath="/shapes-lab/keys"
        param="keys"
        current={keys}
        options={[...OPTIONS]}
      />

      <p className="hud-note">
        Type into the first few inputs before prepending, and watch what the
        inputs show afterwards.
      </p>

      <Keys keys={keys} />
    </article>
  );
}
