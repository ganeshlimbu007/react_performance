"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Subscribes to every Web Vitals metric that Next.js measures and re-broadcasts
 * it as a browser CustomEvent so any client component (e.g. the dashboard) can
 * render live values without prop-drilling or a global store.
 *
 * The three Core Web Vitals are:
 *   - LCP (Largest Contentful Paint) ...... loading performance
 *   - CLS (Cumulative Layout Shift) ....... visual stability
 *   - INP (Interaction to Next Paint) ..... responsiveness (replaced FID in 2024)
 *
 * Next.js also reports FCP, TTFB and FID, which are useful supporting metrics.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Log to the console so you can inspect the full payload while testing.
    console.log(`[web-vitals] ${metric.name}`, metric);

    window.dispatchEvent(
      new CustomEvent("web-vital", {
        detail: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating, // "good" | "needs-improvement" | "poor"
          id: metric.id,
        },
      }),
    );
  });

  return null;
}
