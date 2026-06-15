import type { Metadata } from "next";
import "./globals.css";
import { WebVitalsReporter } from "./components/WebVitalsReporter";
import { VitalsDashboard } from "./components/VitalsDashboard";
import { Nav } from "./components/Nav";

export const metadata: Metadata = {
  title: "React Performance Lab",
  description:
    "Playground for testing Core Web Vitals and every Next.js rendering technique (CSR, SSR, SSG, ISR, RSC).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Captures LCP / CLS / INP and broadcasts them to the dashboard */}
        <WebVitalsReporter />
        <Nav />
        <main className="container">{children}</main>
        {/* Floating live readout of the Core Web Vitals */}
        <VitalsDashboard />
      </body>
    </html>
  );
}
