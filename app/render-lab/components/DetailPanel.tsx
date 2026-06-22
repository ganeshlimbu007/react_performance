"use client";

import type { Contact } from "../data";

export function DetailPanel({ contact }: { contact: Contact | null }) {
  if (!contact) {
    return (
      <aside className="rl-detail rl-detail-empty">
        <p>Select a contact to see details.</p>
      </aside>
    );
  }

  return (
    <aside className="rl-detail">
      <h3>{contact.name}</h3>
      <dl>
        <dt>Email</dt>
        <dd>{contact.email}</dd>
        <dt>Company</dt>
        <dd>{contact.company}</dd>
        <dt>Phone</dt>
        <dd>{contact.phone}</dd>
        <dt>Status</dt>
        <dd>
          <span className={`rl-status rl-status-${contact.status}`}>
            {contact.status}
          </span>
        </dd>
        <dt>Last contacted</dt>
        <dd>{new Date(contact.lastContacted).toLocaleDateString()}</dd>
      </dl>
    </aside>
  );
}
