import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { makeItems } from "../../_lab-kit/seeded";
import { MarkAllRead } from "./MarkAllRead";
import { ClientCard } from "./ClientCard";

export const metadata = { title: "Load Lab · hydration" };

const MODES = ["client", "server"] as const;
const CARDS = makeItems(1000, 11);

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function HydrationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "client";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "client"
  ) as "client" | "server";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 3 — hydration</h1>
        <p className="lead">
          One small client island above 1,000 cards. The island is identical in
          both modes.
        </p>
      </header>

      <p className="sl-setup">
        {mode === "client"
          ? "Each of the 1,000 cards is a client component with its own state and 0.05 ms of synthetic cost in its body, so all of them are hydrated."
          : "The same 1,000 cards are rendered as server components with no per-card client code."}{" "}
        Click <strong>Mark all read</strong> as soon as the page appears, with
        the CPU throttled, and read the input delay and{" "}
        <code>loadState</code> in the HUD and the console.
      </p>

      <VariantSwitch
        label="mode"
        basePath="/load-lab/hydration"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <MarkAllRead />

      <div className="ll-cards">
        {mode === "client"
          ? CARDS.map((label) => <ClientCard key={label} label={label} />)
          : CARDS.map((label) => (
              <div className="ll-card" key={label}>
                {label}
              </div>
            ))}
      </div>
    </article>
  );
}
