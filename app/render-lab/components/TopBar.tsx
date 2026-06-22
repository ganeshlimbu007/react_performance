"use client";

import { memo, useEffect, useState } from "react";
import { useApp } from "./AppContext";

function UserBadge() {
  const { currentUser, unread } = useApp();
  return (
    <div className="rl-badge">
      <span className="rl-avatar">{currentUser.name.charAt(0)}</span>
      <div>
        <div className="rl-badge-name">{currentUser.name}</div>
        <div className="rl-badge-role">{currentUser.role}</div>
      </div>
      <span className="rl-unread">{unread} unread</span>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <button className="rl-btn" onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

function SessionClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="rl-clock">{now.toLocaleTimeString()}</span>;
}

// A correctly-built control: memoized with stable primitive props, so it never
// re-renders after mount.
const AppTitle = memo(function AppTitle({ title }: { title: string }) {
  return <span className="rl-title">{title}</span>;
});

export function TopBar() {
  return (
    <header className="rl-topbar">
      <AppTitle title="Contacts CRM" />
      <div className="rl-topbar-right">
        <SessionClock />
        <UserBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}
