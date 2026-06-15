/**
 * Small presentational panel used across the rendering-technique pages to make
 * each strategy's behaviour observable (when the HTML was produced, where, and
 * what to look for on reload).
 */
export function RenderInfo({
  technique,
  renderedAt,
  where,
  observe,
}: {
  technique: string;
  renderedAt: string;
  where: "server" | "client" | "build";
  observe: string;
}) {
  return (
    <div className={`render-info where-${where}`}>
      <div className="ri-row">
        <span className="ri-key">Technique</span>
        <span className="ri-val">{technique}</span>
      </div>
      <div className="ri-row">
        <span className="ri-key">Rendered on</span>
        <span className="ri-val">{where}</span>
      </div>
      <div className="ri-row">
        <span className="ri-key">Rendered at</span>
        <span className="ri-val mono">{renderedAt}</span>
      </div>
      <div className="ri-row">
        <span className="ri-key">What to observe</span>
        <span className="ri-val">{observe}</span>
      </div>
    </div>
  );
}
