"use client";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { AppShell, type AppTab } from "@/components/app-shell";
import { PredictionMatchCard } from "@/components/predictions/match-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ensureSession, upsertProfile, savePicks, getUserPicks, getLeaderboard } from "./lib/supabase";
import type { LeaderboardEntry, Pick as DBPick } from "./lib/supabase";
import type { Match, ScoreVal } from "./lib/match-types";

// ─── MPP exact palette ────────────────────────────────────────────────────────
const M = {
  bg:     "#111111",
  card:   "#1C1C1E",
  border: "#2C2C2E",
  gold:   "#C8A84B",
  goldBg: "#2A2214",
  nav:    "#B08A28",
  text:   "#FFFFFF",
  sub:    "#8E8E93",
  mute:   "#3A3A3C",
  pill:   "#2E2E30",
  green:  "#32D74B",
  red:    "#FF453A",
  pink:   "#FF375F",
};

// ─── Points formula (same as before, hidden from user) ────────────────────────
function pts(pct: number) { return Math.round(22 * Math.pow(100 / Math.max(1, pct), 1.23)); }

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = AppTab;

interface PastMatch {
  id: string; day: number; date: string; gw: string;
  home: { name: string; flag: string; score: number; pct: number };
  draw: { pct: number };
  away: { name: string; flag: string; score: number; pct: number };
  myPick: { home: number; away: number } | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MATCHES: Match[] = [
  { id: "gha-pan", day: 18, time: "3:00 PM ET",  gw: "GW.1",
    home: { name: "Ghana",       flag: "🇬🇭", pct: 56 }, draw: { pct: 26 },
    away: { name: "Panama",      flag: "🇵🇦", pct: 18 } },
  { id: "uzb-col", day: 18, time: "6:00 PM ET",  gw: "GW.1",
    home: { name: "Uzbekistan",  flag: "🇺🇿", pct: 8  }, draw: { pct: 22 },
    away: { name: "Colombia",    flag: "🇨🇴", pct: 70 } },
  { id: "cze-rsa", day: 18, time: "9:00 PM ET",  gw: "GW.1",
    home: { name: "Czechia",     flag: "🇨🇿", pct: 52 }, draw: { pct: 28 },
    away: { name: "South Africa",flag: "🇿🇦", pct: 20 } },
  { id: "usa-bol", day: 19, time: "12:00 PM ET", gw: "GW.1",
    home: { name: "USA",         flag: "🇺🇸", pct: 72 }, draw: { pct: 18 },
    away: { name: "Bolivia",     flag: "🇧🇴", pct: 10 } },
  { id: "ecu-ven", day: 19, time: "3:00 PM ET",  gw: "GW.1",
    home: { name: "Ecuador",     flag: "🇪🇨", pct: 48 }, draw: { pct: 28 },
    away: { name: "Venezuela",   flag: "🇻🇪", pct: 24 } },
  { id: "mex-cam", day: 19, time: "6:00 PM ET",  gw: "GW.1",
    home: { name: "Mexico",      flag: "🇲🇽", pct: 65 }, draw: { pct: 22 },
    away: { name: "Cameroon",    flag: "🇨🇲", pct: 13 } },
  { id: "fra-aut", day: 20, time: "3:00 PM ET",  gw: "GW.2",
    home: { name: "France",      flag: "🇫🇷", pct: 68 }, draw: { pct: 20 },
    away: { name: "Austria",     flag: "🇦🇹", pct: 12 } },
  { id: "bra-arg", day: 20, time: "9:00 PM ET",  gw: "GW.2",
    home: { name: "Brazil",      flag: "🇧🇷", pct: 38 }, draw: { pct: 26 },
    away: { name: "Argentina",   flag: "🇦🇷", pct: 36 } },
  { id: "eng-irl", day: 21, time: "3:00 PM ET",  gw: "GW.2",
    home: { name: "England",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", pct: 62 }, draw: { pct: 22 },
    away: { name: "Ireland",     flag: "🇮🇪", pct: 16 } },
  { id: "esp-mar", day: 21, time: "6:00 PM ET",  gw: "GW.2",
    home: { name: "Spain",       flag: "🇪🇸", pct: 58 }, draw: { pct: 24 },
    away: { name: "Morocco",     flag: "🇲🇦", pct: 18 } },
];

const PAST: PastMatch[] = [
  { id: "mex-rsa", day: 17, date: "Jun 17", gw: "GW.1",
    home: { name: "Mexico",      flag: "🇲🇽", score: 2, pct: 58 }, draw: { pct: 24 },
    away: { name: "South Africa",flag: "🇿🇦", score: 0, pct: 18 }, myPick: { home: 2, away: 0 } },
  { id: "kor-cze", day: 17, date: "Jun 17", gw: "GW.1",
    home: { name: "South Korea", flag: "🇰🇷", score: 2, pct: 44 }, draw: { pct: 28 },
    away: { name: "Czechia",     flag: "🇨🇿", score: 1, pct: 28 }, myPick: { home: 2, away: 1 } },
  { id: "can-bih", day: 17, date: "Jun 17", gw: "GW.1",
    home: { name: "Canada",      flag: "🇨🇦", score: 1, pct: 52 }, draw: { pct: 26 },
    away: { name: "Bosnia",      flag: "🇧🇦", score: 1, pct: 22 }, myPick: { home: 1, away: 0 } },
];

const DAYS = [
  { short: "Thu", num: "17", day: 17 },
  { short: "Fri", num: "18", day: 18 },
  { short: "Sat", num: "19", day: 19, today: true },
  { short: "Sun", num: "20", day: 20 },
  { short: "Mon", num: "21", day: 21 },
  { short: "Tue", num: "22", day: 22 },
  { short: "Wed", num: "23", day: 23 },
];

// ISO kickoff times per match (ET = UTC-4)
const KICKOFF: Record<string, string> = {
  "gha-pan": "2026-06-18T15:00:00-04:00",
  "uzb-col": "2026-06-18T18:00:00-04:00",
  "cze-rsa": "2026-06-18T21:00:00-04:00",
  "usa-bol": "2026-06-19T12:00:00-04:00",
  "ecu-ven": "2026-06-19T15:00:00-04:00",
  "mex-cam": "2026-06-19T18:00:00-04:00",
  "fra-aut": "2026-06-20T15:00:00-04:00",
  "bra-arg": "2026-06-20T21:00:00-04:00",
  "eng-irl": "2026-06-21T15:00:00-04:00",
  "esp-mar": "2026-06-21T18:00:00-04:00",
};

const AVATARS = ["⚽", "🦁", "🐯", "🦊", "🐺", "🦅", "🐉", "🦄"];
const LEAGUE_CODE = "SV-2026";

// ─── Circular flag ─────────────────────────────────────────────────────────────
function CircleFlag({ flag, size = 76 }: { flag: string; size?: number }) {
  return (
    <div className="sv-flag" style={{ width: size, height: size }}>
      <span style={{ fontSize: size * 0.72, lineHeight: 1, display: "block" }}>{flag}</span>
    </div>
  );
}

// ─── Day strip ────────────────────────────────────────────────────────────────
function DayStrip({ selected, onSelect }: { selected: number; onSelect: (d: number) => void }) {
  return (
    <div className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.07] bg-[#11141b] px-2.5 py-2">
      {DAYS.map(({ short, num, day, today }) => {
        const active = day === selected;
        return (
          <button
            className={`flex min-w-12 shrink-0 flex-col items-center rounded-xl px-2 py-2 transition-colors ${
              active
                ? "bg-[#2f6bff] text-white shadow-[0_8px_18px_rgba(47,107,255,0.22)]"
                : "text-[#717a8e] hover:bg-white/[0.05] hover:text-white"
            }`}
            key={day}
            onClick={() => onSelect(day)}
            type="button"
          >
            <span className="text-[9px] font-semibold uppercase tracking-wide">
              {today ? "Today" : short}
            </span>
            <strong className="text-sm">{num}</strong>
          </button>
        );
      })}
    </div>
  );
}

// ─── Countdown ───────────────────────────────────────────────────────────────
function Countdown({ day }: { day: number }) {
  const [s, setS] = useState(0);

  useEffect(() => {
    const dayMatches = MATCHES.filter(m => m.day === day);
    const targets = dayMatches
      .map(m => KICKOFF[m.id] ? new Date(KICKOFF[m.id]).getTime() : null)
      .filter((t): t is number => t !== null && t > Date.now())
      .sort((a, b) => a - b);
    const target = targets[0];
    if (!target) {
      const timeout = setTimeout(() => setS(0), 0);
      return () => clearTimeout(timeout);
    }
    const tick = () => setS(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    const timeout = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(id);
    };
  }, [day]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  if (s === 0) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-xs font-semibold text-[#7f889c]">
        <span className="text-lg leading-none text-[#2f6bff]">◷</span>
        <span>Predictions closed</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-xs font-semibold tabular-nums text-[#a4adbf]">
      <span className="text-lg leading-none text-[#2f6bff]">◷</span>
      <span>{pad(h)} : {pad(m)} : {pad(sc)}</span>
    </div>
  );
}

// ─── Picks tab ────────────────────────────────────────────────────────────────
function PicksTab({ userId }: { userId: string | null }) {
  const [day, setDay] = useState(19);
  const [picks, setPicks] = useState<Record<string, { home: ScoreVal; away: ScoreVal }>>({});
  const [saved, setSaved] = useState(false);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getUserPicks(userId).then((dbPicks: DBPick[]) => {
      const map: Record<string, { home: ScoreVal; away: ScoreVal }> = {};
      for (const p of dbPicks) map[p.match_id] = { home: p.home_score, away: p.away_score };
      setPicks(prev => ({ ...map, ...prev }));
    });
  }, [userId]);

  const dayMatches = MATCHES.filter(m => m.day === day);
  const filled = dayMatches.filter(m => {
    const p = picks[m.id];
    return p && p.home !== "" && p.away !== "";
  }).length;

  function setPick(id: string, h: ScoreVal, a: ScoreVal) {
    setPicks(prev => ({ ...prev, [id]: { home: h, away: a } }));
  }

  async function save() {
    setSaved(true);
    if (userId) {
      const rows = dayMatches
        .filter(m => picks[m.id]?.home !== "" && picks[m.id]?.away !== "")
        .map(m => ({ matchId: m.id, homeScore: Number(picks[m.id].home), awayScore: Number(picks[m.id].away) }));
      await savePicks(userId, rows);
    }
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0d0f15]">
      <DayStrip selected={day} onSelect={setDay} />

      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3">
        <Countdown day={day} />
        <label className="flex items-center gap-2 text-xs font-semibold text-[#8992a5]">
          Market odds
          <Switch
            aria-label="Toggle market odds"
            checked={showStats}
            onCheckedChange={setShowStats}
          />
        </label>
      </div>

      {dayMatches.length > 0 && (
        <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-1">
          <span className="text-sm font-semibold text-white">
            {new Date(2026, 5, day).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
          <strong className="text-[11px] font-semibold text-[#737c8f]">
            {filled} / {dayMatches.length}
          </strong>
        </div>
      )}

      <div className="no-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3">
        {dayMatches.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-[#737c8f]">
            <span className="text-4xl">⚽</span>
            <strong className="text-sm">No games today</strong>
          </div>
        ) : (
          dayMatches.map((m, index) => (
            <PredictionMatchCard
              index={index}
              key={m.id}
              match={m}
              picks={picks[m.id] ?? { home: "", away: "" }}
              onPick={(h, a) => setPick(m.id, h, a)}
            />
          ))
        )}
        <div className="h-24" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d0f15] via-[#0d0f15]/95 to-transparent px-4 pb-3 pt-8">
        <Button
          className={`pointer-events-auto w-full ${
            saved ? "bg-[#25a95d] hover:bg-[#25a95d]" : ""
          }`}
          size="lg"
          onClick={save}
          disabled={filled === 0}
          type="button"
        >
          {saved
            ? <><Check size={16} /> Predictions locked!</>
            : filled === dayMatches.length && dayMatches.length > 0
              ? `🔒  Lock all ${filled} predictions`
              : filled > 0
                ? `Lock ${filled} of ${dayMatches.length} predictions`
                : "Enter your predictions above"}
        </Button>
      </div>
    </div>
  );
}

// ─── Results tab ──────────────────────────────────────────────────────────────
function ResultsTab() {
  const [day, setDay] = useState(17);
  const dayResults = PAST.filter(m => m.day === day);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <DayStrip selected={day} onSelect={setDay} />

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", background: M.bg }}>
        {dayResults.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
            <span style={{ fontSize: 48 }}>⏳</span>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: M.text, textTransform: "uppercase" }}>
              NO AVAILABLE DATA
            </p>
            <p style={{ margin: 0, fontSize: 13, color: M.sub }}>No results for this gameweek</p>
          </div>
        ) : dayResults.map(m => {
          const homeWon = m.home.score > m.away.score;
          const awayWon = m.away.score > m.home.score;
          const isDraw  = !homeWon && !awayWon;
          const exact   = !!m.myPick && m.myPick.home === m.home.score && m.myPick.away === m.away.score;
          const correct = !exact && !!m.myPick && (
            (homeWon && m.myPick.home > m.myPick.away) ||
            (awayWon && m.myPick.away > m.myPick.home) ||
            (isDraw  && m.myPick.home === m.myPick.away)
          );
          const winPct = homeWon ? m.home.pct : awayWon ? m.away.pct : m.draw.pct;
          const earnedPts = exact ? pts(winPct) * 3 : correct ? pts(winPct) : 0;

          return (
            <div key={m.id} style={{ background: M.card, borderBottom: `1px solid ${M.border}` }}>
              {/* Sub-header */}
              <div style={{ padding: "8px 16px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11 }}>🏆</span>
                <span style={{ fontSize: 11, color: M.sub }}>{m.gw} · {m.date}</span>
              </div>

              {/* Match row */}
              <div style={{ display: "flex", alignItems: "center", padding: "10px 12px 14px", gap: 8 }}>
                {/* Home */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <CircleFlag flag={m.home.flag} size={68} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: M.text, textAlign: "center" }}>{m.home.name}</span>
                </div>

                {/* Score + pick */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* Final score */}
                  <div style={{
                    padding: "8px 20px", borderRadius: 10,
                    background: M.mute, border: `2px solid ${exact ? M.gold : correct ? "#22C55E" : M.border}`,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: M.text, fontVariantNumeric: "tabular-nums" }}>
                      {m.home.score} : {m.away.score}
                    </span>
                  </div>

                  {/* My pick + points */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {m.myPick && (
                      <span style={{ fontSize: 11, color: M.sub }}>
                        Pick: {m.myPick.home}–{m.myPick.away}
                      </span>
                    )}
                    {earnedPts > 0 && (
                      <div style={{
                        padding: "3px 10px", borderRadius: 8,
                        background: exact ? M.gold : "#22C55E22",
                        border: `1px solid ${exact ? M.gold : "#22C55E"}`,
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: exact ? "#000" : "#22C55E" }}>
                          +{earnedPts} pts {exact ? "🎯" : "✓"}
                        </span>
                      </div>
                    )}
                    {!earnedPts && m.myPick && (
                      <span style={{ fontSize: 11, color: M.red }}>✗ miss</span>
                    )}
                  </div>
                </div>

                {/* Away */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <CircleFlag flag={m.away.flag} size={68} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: M.text, textAlign: "center" }}>{m.away.name}</span>
                </div>
              </div>

              {/* My odd / My prediction row — MPP style */}
              {m.myPick && (
                <div style={{
                  display: "flex", alignItems: "center",
                  padding: "8px 16px 12px", gap: 12,
                  borderTop: `1px solid ${M.border}`,
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: M.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>My odd</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: M.text }}>{earnedPts > 0 ? pts(winPct) : "–"}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 10, color: M.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>My prediction</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: M.text }}>{m.myPick.home} – {m.myPick.away}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

// ─── Ranking tab ──────────────────────────────────────────────────────────────
function RankingTab({ user }: { user: { name: string; avatar: string } }) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { getLeaderboard().then(setBoard); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: M.bg }}>
      {/* Table header */}
      <div style={{
        display: "flex", alignItems: "center", padding: "10px 16px",
        borderBottom: `1px solid ${M.border}`,
      }}>
        <span style={{ flex: 1, fontSize: 11, color: M.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>Players</span>
        <span style={{ width: 48, textAlign: "center", fontSize: 11, color: M.sub, textTransform: "uppercase" }}>Good</span>
        <span style={{ width: 48, textAlign: "center", fontSize: 11, color: M.sub, textTransform: "uppercase" }}>Exacts</span>
        <span style={{ width: 60, textAlign: "right", fontSize: 11, color: M.gold, textTransform: "uppercase" }}>Points</span>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        {board.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
            <span style={{ fontSize: 32 }}>🏆</span>
            <span style={{ fontSize: 13, color: M.sub }}>No picks submitted yet</span>
          </div>
        ) : board.map((p, i) => {
          const isMe = p.name === user.name;
          return (
            <div key={p.user_id} style={{
              display: "flex", alignItems: "center", padding: "14px 16px",
              borderBottom: `1px solid ${M.border}`,
              background: isMe ? "#1E1A10" : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 800, width: 20, color: i === 0 ? M.gold : M.sub }}>
                  {i + 1}
                </span>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: M.mute, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 24,
                  border: isMe ? `2px solid ${M.gold}` : "none",
                }}>{p.avatar}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: M.text }}>
                    {p.name}
                    {isMe && <span style={{ fontSize: 11, color: M.gold, marginLeft: 6 }}>· you</span>}
                  </p>
                </div>
              </div>
              <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.good_picks}</span>
              <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.exact_picks}</span>
              <span style={{ width: 60, textAlign: "right", fontSize: 18, fontWeight: 900, color: M.gold }}>{p.total_pts}</span>
            </div>
          );
        })}

      </div>
    </div>
  );
}

// ─── League tab ───────────────────────────────────────────────────────────────
function LeagueTab({ user }: { user: { name: string; avatar: string } }) {
  const [sub, setSub] = useState<"ranking" | "settings">("ranking");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlist, setWaitlist] = useState<"idle" | "loading" | "done">("idle");
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { getLeaderboard().then(setBoard); }, []);

  async function submitEmail() {
    if (!email.includes("@")) return;
    setWaitlist("loading");
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setWaitlist("done");
  }

  function share() {
    const text = `Join my WC2026 picks league! Code: ${LEAGUE_CODE}`;
    if (navigator.share) {
      navigator.share({ title: "ScoreVault", text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${LEAGUE_CODE}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* League hero — MPP style blurred image header */}
      <div style={{
        background: `linear-gradient(to bottom, #2A1F0A, ${M.bg})`,
        padding: "20px 16px 0",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 18,
          background: M.mute, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 36,
          border: `2px solid ${M.gold}55`,
        }}>🏆</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: M.text, letterSpacing: "0.04em" }}>
          WC2026 SQUAD
        </h2>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "4px 12px",
          borderRadius: 20, background: M.mute,
        }}>
          <span style={{ fontSize: 13 }}>👥</span>
          <span style={{ fontSize: 12, color: M.text, fontWeight: 600 }}>{board.length}</span>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", width: "100%", marginTop: 8 }}>
          {(["ranking", "settings"] as const).map(t => (
            <button key={t} onClick={() => setSub(t)} style={{
              flex: 1, padding: "12px 0",
              background: sub === t ? M.gold : "transparent",
              border: "none", color: sub === t ? "#000" : M.sub,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              textTransform: "capitalize", transition: "all 0.15s",
            }}>
              {t === "ranking" ? "Ranking" : "Settings"}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", background: M.bg }}>
        {sub === "ranking" ? (
          <>
            {/* Table */}
            <div style={{ borderTop: `1px solid ${M.border}` }}>
              <div style={{ display: "flex", padding: "8px 16px", borderBottom: `1px solid ${M.border}` }}>
                <span style={{ flex: 1, fontSize: 11, color: M.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>Players</span>
                <span style={{ width: 48, textAlign: "center", fontSize: 11, color: M.sub, textTransform: "uppercase" }}>Good</span>
                <span style={{ width: 48, textAlign: "center", fontSize: 11, color: M.sub, textTransform: "uppercase" }}>Exacts</span>
                <span style={{ width: 56, textAlign: "right", fontSize: 11, color: M.gold, textTransform: "uppercase" }}>Points</span>
              </div>
              {board.map((p, i) => {
                const isMe = p.name === user.name;
                return (
                  <div key={p.user_id} style={{
                    display: "flex", alignItems: "center", padding: "14px 16px",
                    borderBottom: `1px solid ${M.border}`,
                    background: isMe ? "#1E1A10" : "transparent",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, width: 18, color: i === 0 ? M.gold : M.sub }}>{i + 1}</span>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", fontSize: 22,
                        background: M.mute, display: "flex", alignItems: "center", justifyContent: "center",
                        border: isMe ? `2px solid ${M.gold}` : "none",
                      }}>{p.avatar}</div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: M.text }}>
                        {p.name}{isMe && <span style={{ color: M.gold, fontSize: 11, marginLeft: 6 }}>· you</span>}
                      </span>
                    </div>
                    <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.good_picks}</span>
                    <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.exact_picks}</span>
                    <span style={{ width: 56, textAlign: "right", fontSize: 17, fontWeight: 900, color: M.gold }}>{p.total_pts}</span>
                  </div>
                );
              })}
            </div>

            {/* Invite */}
            <div style={{ padding: "16px" }}>
              <button onClick={share} style={{
                width: "100%", padding: "18px", borderRadius: 14, border: `1.5px solid ${M.border}`,
                background: "transparent", color: M.text,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                + Invite a friend
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: "16px" }}>
            {/* Copy code — MPP style full-width row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px", background: M.card, borderRadius: 0,
              borderBottom: `1px solid ${M.border}`,
            }}>
              <span style={{ fontSize: 15, color: M.text }}>Copy code</span>
              <button onClick={share} style={{
                background: "transparent", border: "none",
                fontSize: 15, fontWeight: 700, color: M.gold, cursor: "pointer",
              }}>
                {copied ? "Copied!" : LEAGUE_CODE}
              </button>
            </div>

            <div className="sv-final-cta">
              <div className="sv-final-cta-badge">LIMITED DROP · WORLD CUP 2026</div>
              <div className="sv-final-cta-hero">
                <div className="sv-final-cta-icon">🏟️</div>
                <div>
                  <p className="sv-final-cta-kicker">PLAY FOR THE FINAL</p>
                  <h3>Win 2 seats in NYC</h3>
                </div>
              </div>
              <p className="sv-final-cta-copy">
                Join the first ScoreVault money league. Lock USDC, beat your friends,
                and play for two seats at the World Cup Final.
              </p>
              <div className="sv-final-cta-prize">
                <span>Prize pool</span>
                <strong>Winner takes the pot + 2 final seats</strong>
              </div>
              {waitlist === "done" ? (
                <div className="sv-final-cta-success">
                  ✓ You&apos;re on the priority list
                </div>
              ) : (
                <div className="sv-final-cta-form">
                  <input
                    type="email" placeholder="Enter your email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitEmail()}
                  />
                  <button onClick={submitEmail} disabled={!email.includes("@") || waitlist === "loading"}>
                    {waitlist === "loading" ? "Joining…" : "Get priority access →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function Onboarding({ onDone }: { onDone: (name: string, avatar: string) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const valid = name.trim().length >= 2;

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 24px", background: M.bg,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24, marginBottom: 20,
        background: M.gold, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 40, boxShadow: `0 8px 32px ${M.gold}60`,
      }}>⚽</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: M.text, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        ScoreVault
      </h1>
      <p style={{ fontSize: 13, color: M.sub, margin: "0 0 36px", textAlign: "center", lineHeight: 1.6 }}>
        {step === 1 ? "Pick scores. Climb the board.\nChallenge your friends." : `Nice, ${name.trim()}! Pick your avatar`}
      </p>

      {step === 1 ? (
        <>
          <input
            type="text" autoFocus placeholder="Your name"
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && valid && setStep(2)}
            style={{
              width: "100%", padding: "16px 20px", marginBottom: 14,
              borderRadius: 14, outline: "none", boxSizing: "border-box",
              border: `2px solid ${valid ? M.gold : M.border}`,
              background: M.card, fontSize: 18, fontWeight: 700,
              color: M.text, transition: "border-color 0.2s",
            }}
          />
          <button onClick={() => valid && setStep(2)} disabled={!valid} style={{
            width: "100%", padding: "17px", borderRadius: 14, border: "none",
            background: valid ? M.gold : M.mute,
            color: valid ? "#000" : M.sub, fontSize: 15, fontWeight: 800,
            cursor: valid ? "pointer" : "default",
            boxShadow: valid ? `0 4px 20px ${M.gold}50` : "none",
          }}>Continue →</button>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, width: "100%", marginBottom: 20 }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                fontSize: 36, padding: "14px 0", borderRadius: 14, cursor: "pointer",
                background: avatar === a ? M.goldBg : M.card,
                border: `2px solid ${avatar === a ? M.gold : M.border}`,
              }}>{a}</button>
            ))}
          </div>
          <button onClick={() => onDone(name.trim(), avatar)} style={{
            width: "100%", padding: "17px", borderRadius: 14, border: "none",
            background: M.gold, color: "#000", fontSize: 15, fontWeight: 800,
            cursor: "pointer", boxShadow: `0 4px 20px ${M.gold}50`,
          }}>Let&apos;s play! 🚀</button>
        </>
      )}
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab]   = useState<Tab>("picks");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hydrationTimeout = setTimeout(() => {
      try {
        const savedUser = localStorage.getItem("sv_user");
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {}
      setReady(true);
    }, 0);

    ensureSession()
      .then(setUserId)
      .catch(() => setUserId(null));

    return () => clearTimeout(hydrationTimeout);
  }, []);

  async function onboard(name: string, avatar: string) {
    const u = { name, avatar };
    localStorage.setItem("sv_user", JSON.stringify(u));
    setUser(u);
    const uid = userId ?? (await ensureSession());
    if (uid) { setUserId(uid); await upsertProfile(uid, name, avatar); }
  }

  if (!ready) return null;

  const TAB_TITLES: Record<Tab, string> = {
    picks: "MY PREDICTIONS",
    results: "RESULTS",
    leaderboard: "STANDINGS",
    league: "MY LEAGUES & CHALLENGES",
  };

  return (
    !user ? (
      <div className="fixed inset-0 grid place-items-center bg-[#080a0f]">
        <div className="h-[min(100dvh,932px)] w-[min(100vw,430px)] overflow-hidden bg-[#0d0f15]">
          <Onboarding onDone={onboard} />
        </div>
      </div>
    ) : (
      <AppShell
        activeTab={tab}
        onTabChange={setTab}
        title={TAB_TITLES[tab]}
      >
        {tab === "picks"       && <PicksTab userId={userId} />}
        {tab === "results"     && <ResultsTab />}
        {tab === "leaderboard" && <RankingTab user={user} />}
        {tab === "league"      && <LeagueTab user={user} />}
      </AppShell>
    )
  );
}
