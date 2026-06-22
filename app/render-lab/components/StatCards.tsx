"use client";

import { memo } from "react";
import type { Contact } from "../data";

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rl-card">
      <div className="rl-card-value">{value}</div>
      <div className="rl-card-label">{label}</div>
    </div>
  );
}

// A correctly-built control: memoized and given stable primitive props, so it
// stays gray in the Profiler across interactions.
const TotalCard = memo(function TotalCard({ total }: { total: number }) {
  return <Card label="Total contacts" value={total} />;
});

export function StatCards({ contacts }: { contacts: Contact[] }) {
  const active = contacts.filter((c) => c.status === "active").length;
  const inactive = contacts.length - active;

  return (
    <section className="rl-cards">
      <TotalCard total={contacts.length} />
      <Card label="Active" value={active} />
      <Card label="Inactive" value={inactive} />
    </section>
  );
}
