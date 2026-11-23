import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { YieldStation } from "./YieldStation";

export const metadata = { title: "Schedule Lab · your own long task" };

const MODES = ["block", "yield", "timeout"] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const DESCRIPTION: Record<string, string> = {
  block:
    "The click handler processes all 5,000 rows in one synchronous loop before returning.",
  yield:
    "The click handler processes rows in an async loop with a 50 ms deadline, awaiting scheduler.yield() (or setTimeout(0) where it is unavailable) when the deadline passes.",
  timeout:
    "The same 50 ms deadline loop, but it always yields with setTimeout(0).",
};

export default async function YieldPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "block";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "block"
  ) as "block" | "yield" | "timeout";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 5 — your own long task</h1>
        <p className="lead">
          5,000 seeded rows, 0.03 ms synthetic cost each (about 150 ms of work),
          all inside a click handler.
        </p>
      </header>

      <p className="sl-setup">{DESCRIPTION[mode]}</p>

      <VariantSwitch
        label="mode"
        basePath="/schedule-lab/yield"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <YieldStation mode={mode} />
    </article>
  );
}
