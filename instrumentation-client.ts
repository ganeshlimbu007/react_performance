/**
 * Client instrumentation. Runs after the HTML loads and *before* React
 * hydration begins, which is what lets it catch an early interaction's input
 * delay and report a `loadState` other than "complete".
 *
 * This uses the project's own `web-vitals` dependency (v6), which has the v5+
 * attribution build. `app/components/WebVitalsReporter.tsx` is left alone: it
 * uses the older copy of web-vitals that Next bundles, which has no
 * attribution. Both can coexist.
 */
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  import("web-vitals/attribution")
    .then(({ onINP, onLCP }) => {
      onINP(
        (metric) => {
          const a = metric.attribution;
          const detail = {
            value: metric.value,
            rating: metric.rating,
            inputDelay: a.inputDelay,
            processingDuration: a.processingDuration,
            presentationDelay: a.presentationDelay,
            loadState: a.loadState,
            interactionTarget: a.interactionTarget,
            interactionType: a.interactionType,
            longestScriptSource: a.longestScript?.entry?.sourceURL,
            longestScriptInvoker: a.longestScript?.entry?.invoker,
            longestScriptSubpart: a.longestScript?.subpart,
          };

          // eslint-disable-next-line no-console
          console.log("[inp-attribution]", detail);

          try {
            window.dispatchEvent(
              new CustomEvent("inp-attribution", { detail }),
            );
          } catch {
            // ignore
          }
        },
        { reportAllChanges: true },
      );

      onLCP((metric) => {
        const a = metric.attribution;
        // eslint-disable-next-line no-console
        console.log("[lcp-attribution]", {
          value: metric.value,
          rating: metric.rating,
          target: a.target,
          url: a.url,
          timeToFirstByte: a.timeToFirstByte,
          resourceLoadDelay: a.resourceLoadDelay,
          resourceLoadDuration: a.resourceLoadDuration,
          elementRenderDelay: a.elementRenderDelay,
        });
      });
    })
    .catch(() => {
      // web-vitals/attribution unavailable — the labs still work without it.
    });
} catch {
  // Never let instrumentation break the app.
}
