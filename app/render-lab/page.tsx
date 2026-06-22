"use client";

import { useState } from "react";
import { CONTACTS } from "./data";
import { AppProvider } from "./components/AppContext";
import { TopBar } from "./components/TopBar";
import { Filters, type StatusFilter } from "./components/Filters";
import { StatCards } from "./components/StatCards";
import { ContactList } from "./components/ContactList";
import { DetailPanel } from "./components/DetailPanel";

const COMPANY_OPTIONS = [...new Set(CONTACTS.map((c) => c.company))].sort();

// A correctly-built control: its state is colocated, so typing here only
// re-renders this widget — nothing else in the dashboard moves.
function QuickNote() {
  const [note, setNote] = useState("");
  return (
    <section className="rl-note">
      <label>Quick note</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Jot something down…"
        rows={2}
      />
    </section>
  );
}

export default function RenderLabPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [company, setCompany] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = CONTACTS.find((c) => c.id === selectedId) ?? null;

  return (
    <AppProvider>
      <div className="rl-shell">
        <TopBar />

        <p className="rl-intro">
          Contacts dashboard. Profile one interaction at a time with the React
          DevTools Profiler — see <code>app/render-lab/README.md</code>.
        </p>

        <StatCards contacts={CONTACTS} />

        <Filters
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          company={company}
          onCompany={setCompany}
          companies={COMPANY_OPTIONS}
        />

        <QuickNote />

        <div className="rl-main">
          <ContactList
            contacts={CONTACTS}
            search={search}
            status={status}
            company={company}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <DetailPanel contact={selected} />
        </div>
      </div>
    </AppProvider>
  );
}
