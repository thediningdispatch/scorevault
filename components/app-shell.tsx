"use client";

import { Trophy, Users } from "lucide-react";

import { cn } from "@/app/lib/utils";
import styles from "./app-shell.module.css";

export type AppTab = "picks" | "results" | "leaderboard" | "league";

const NAV: { id: AppTab; label: string }[] = [
  { id: "picks", label: "Predictions" },
  { id: "results", label: "Results" },
  { id: "leaderboard", label: "Ranking" },
  { id: "league", label: "My leagues" },
];

function NavIcon({ tab }: { tab: AppTab }) {
  if (tab === "picks") return <span className={styles.scoreIcon}>1:1</span>;
  if (tab === "results") return <span aria-hidden="true">⚽</span>;
  if (tab === "leaderboard") return <Trophy size={22} />;
  return <Users size={22} />;
}

export function AppShell({
  activeTab,
  title,
  onTabChange,
  children,
}: {
  activeTab: AppTab;
  title: string;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.viewport}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.mark}>SV</span>
            <span>BASE</span>
          </div>
          <h1 className={styles.title}>{title}</h1>
          <div aria-hidden="true" />
        </header>

        <main className={styles.content}>{children}</main>

        <nav className={styles.nav} aria-label="Primary navigation">
          {NAV.map((item) => (
            <button
              className={cn(
                styles.navButton,
                item.id === activeTab && styles.active,
              )}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              type="button"
            >
              <NavIcon tab={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
