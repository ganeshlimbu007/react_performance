import { StateBailouts } from "./StateBailouts";

export const metadata = { title: "Shapes Lab · state bailouts" };

export default function StateBailoutsPage() {
  return (
    <article className="page">
      <header className="sl-head">
        <h1>S6 — state bailouts</h1>
        <p className="lead">
          A component with <code>useState(0)</code> and buttons that set 0 and
          1, and a component whose reducer returns its current state.
        </p>
      </header>

      <p className="sl-setup">
        Both subtrees are wrapped in a Profiler, and both count their component
        bodies. Try this sequence on the first one: set 0, set 1, set 1, set 1.
      </p>

      <StateBailouts />

      <p className="hud-note">
        Compare the body counter with the Profiler&rsquo;s flame chart.
      </p>
    </article>
  );
}
