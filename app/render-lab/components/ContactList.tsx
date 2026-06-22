"use client";

import type { Contact } from "../data";
import type { StatusFilter } from "./Filters";
import { Row } from "./Row";

export function ContactList({
  contacts,
  search,
  status,
  company,
  selectedId,
  onSelect,
}: {
  contacts: Contact[];
  search: string;
  status: StatusFilter;
  company: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const term = search.trim().toLowerCase();
  const filtered = contacts
    .filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (company !== "all" && c.company !== company) return false;
      if (
        term &&
        !c.name.toLowerCase().includes(term) &&
        !c.email.toLowerCase().includes(term) &&
        !c.company.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="rl-list">
      <div className="rl-list-head">
        {filtered.length.toLocaleString()} contacts
      </div>
      <div className="rl-list-body">
        {filtered.map((c) => (
          <Row
            key={c.id}
            contact={c}
            selected={c.id === selectedId}
            style={{
              borderLeft:
                c.status === "active"
                  ? "3px solid #2ecc71"
                  : "3px solid #7f8c8d",
            }}
            onClick={() => onSelect(c.id)}
          />
        ))}
      </div>
    </section>
  );
}
