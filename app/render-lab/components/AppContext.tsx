"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type AppState = {
  theme: Theme;
  toggleTheme: () => void;
  currentUser: { name: string; role: string };
  unread: number;
};

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

const USER = { name: "Jordan Avery", role: "Account Manager" };

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setUnread((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, currentUser: USER, unread }}
    >
      {children}
    </AppContext.Provider>
  );
}
