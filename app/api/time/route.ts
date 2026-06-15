import { NextResponse } from "next/server";

// Always run on each request so the CSR page gets a fresh value.
export const dynamic = "force-dynamic";

export async function GET() {
  // Simulate a little latency so client-side fetching is observable.
  await new Promise((r) => setTimeout(r, 300));
  return NextResponse.json({
    time: new Date().toISOString(),
    source: "api/time route handler (server)",
  });
}
