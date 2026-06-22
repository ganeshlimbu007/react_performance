"use client";

import { memo } from "react";
import type { Contact } from "../data";

function ContactRow({
  contact,
  selected,
  style,
  onClick,
}: {
  contact: Contact;
  selected: boolean;
  style: React.CSSProperties;
  onClick: () => void;
}) {
  return (
    <div
      className={`rl-row ${selected ? "rl-row-selected" : ""}`}
      style={style}
      onClick={onClick}
    >
      <span className="rl-row-name">{contact.name}</span>
      <span className="rl-row-email">{contact.email}</span>
      <span className="rl-row-company">{contact.company}</span>
      <span className={`rl-status rl-status-${contact.status}`}>
        {contact.status}
      </span>
    </div>
  );
}

export const Row = memo(ContactRow);
