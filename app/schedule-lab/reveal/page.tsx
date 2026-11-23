import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Reveal } from "./Reveal";

export const metadata = { title: "Schedule Lab · the Suspense reveal throttle" };

const DELAYS = ["20", "50", "150", "280", "400"] as const;
const SWITCHES = ["plain", "transition"] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function RevealPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const rawDelay = one(sp.delay) ?? "150";
  const delay = (DELAYS as readonly string[]).includes(rawDelay)
    ? Number(rawDelay)
    : 150;

  const rawSwitch = one(sp.switch) ?? "plain";
  const switchMode = (
    (SWITCHES as readonly string[]).includes(rawSwitch) ? rawSwitch : "plain"
  ) as "plain" | "transition";

  const warm = one(sp.warm) === "1";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 3 — the Suspense reveal throttle</h1>
        <p className="lead">
          Panel B&rsquo;s module is imported {delay} ms after the import starts.
        </p>
      </header>

      <p className="sl-setup">
        &ldquo;Show panel A&rdquo; mounts a Suspense boundary around lazy panel
        A. &ldquo;Switch to B&rdquo; swaps the boundary&rsquo;s child to lazy
        panel B{" "}
        {switchMode === "transition"
          ? "inside startTransition."
          : "with a normal setState."}{" "}
        {warm
          ? "Hovering or focusing the switch button starts the same import early, sharing one promise."
          : "No warm-up."}
      </p>

      <VariantSwitch
        label="delay"
        basePath="/schedule-lab/reveal"
        param="delay"
        current={String(delay)}
        options={[...DELAYS]}
        extra={{ switch: switchMode, warm: warm ? "1" : undefined }}
      />
      <VariantSwitch
        label="switch"
        basePath="/schedule-lab/reveal"
        param="switch"
        current={switchMode}
        options={[...SWITCHES]}
        extra={{ delay: String(delay), warm: warm ? "1" : undefined }}
      />
      <VariantSwitch
        label="warm"
        basePath="/schedule-lab/reveal"
        param="warm"
        current={warm ? "1" : "0"}
        options={["0", "1"]}
        extra={{ delay: String(delay), switch: switchMode }}
      />

      <Reveal delay={delay} switchMode={switchMode} warm={warm} />
    </article>
  );
}
