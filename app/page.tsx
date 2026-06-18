"use client";
import { useState, useEffect } from "react";
import { ensureSession, upsertProfile, savePicks, getUserPicks, getLeaderboard } from "./lib/supabase";
import type { LeaderboardEntry, Pick as DBPick } from "./lib/supabase";

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:      "#e9ecf8",
  canvas:  "#f5f6fb",
  white:   "#ffffff",
  border:  "#e4e6ef",
  blue:    "#3157f6",
  blueBg:  "#eef0ff",
  ink:     "#171927",
  muted:   "#777b8e",
  gray:    "#f4f5f9",
  green:   "#15a957",
  greenBg: "rgba(21,169,87,0.10)",
  red:     "#df5353",
};

// ── Points formula ────────────────────────────────────────────────────────────
function pts(pct: number) { return Math.round(22 * Math.pow(100 / Math.max(1, pct), 1.23)); }

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "picks" | "results" | "ranking" | "profile";
type ScoreVal = number | "";

interface Match {
  id: string; day: number; time: string; gw: string;
  home: { name: string; flag: string; pct: number };
  draw: { pct: number };
  away: { name: string; flag: string; pct: number };
}
interface PastMatch {
  id: string; day: number; date: string; gw: string;
  home: { name: string; flag: string; score: number; pct: number };
  draw: { pct: number };
  away: { name: string; flag: string; score: number; pct: number };
  myPick: { home: number; away: number } | null;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const MATCHES: Match[] = [
  { id: "gha-pan", day: 18, time: "3:00 PM ET",  gw: "GW.1", home: { name: "Ghana",        flag: "🇬🇭", pct: 56 }, draw: { pct: 26 }, away: { name: "Panama",       flag: "🇵🇦", pct: 18 } },
  { id: "uzb-col", day: 18, time: "6:00 PM ET",  gw: "GW.1", home: { name: "Uzbekistan",   flag: "🇺🇿", pct: 8  }, draw: { pct: 22 }, away: { name: "Colombia",     flag: "🇨🇴", pct: 70 } },
  { id: "cze-rsa", day: 18, time: "9:00 PM ET",  gw: "GW.1", home: { name: "Czechia",      flag: "🇨🇿", pct: 52 }, draw: { pct: 28 }, away: { name: "South Africa", flag: "🇿🇦", pct: 20 } },
  { id: "usa-bol", day: 19, time: "12:00 PM ET", gw: "GW.1", home: { name: "USA",           flag: "🇺🇸", pct: 72 }, draw: { pct: 18 }, away: { name: "Bolivia",      flag: "🇧🇴", pct: 10 } },
  { id: "ecu-ven", day: 19, time: "3:00 PM ET",  gw: "GW.1", home: { name: "Ecuador",      flag: "🇪🇨", pct: 48 }, draw: { pct: 28 }, away: { name: "Venezuela",    flag: "🇻🇪", pct: 24 } },
  { id: "mex-cam", day: 19, time: "6:00 PM ET",  gw: "GW.1", home: { name: "Mexico",       flag: "🇲🇽", pct: 65 }, draw: { pct: 22 }, away: { name: "Cameroon",     flag: "🇨🇲", pct: 13 } },
  { id: "fra-aut", day: 20, time: "3:00 PM ET",  gw: "GW.2", home: { name: "France",       flag: "🇫🇷", pct: 68 }, draw: { pct: 20 }, away: { name: "Austria",      flag: "🇦🇹", pct: 12 } },
  { id: "bra-arg", day: 20, time: "9:00 PM ET",  gw: "GW.2", home: { name: "Brazil",       flag: "🇧🇷", pct: 38 }, draw: { pct: 26 }, away: { name: "Argentina",    flag: "🇦🇷", pct: 36 } },
  { id: "eng-irl", day: 21, time: "3:00 PM ET",  gw: "GW.2", home: { name: "England",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", pct: 62 }, draw: { pct: 22 }, away: { name: "Ireland",      flag: "🇮🇪", pct: 16 } },
  { id: "esp-mar", day: 21, time: "6:00 PM ET",  gw: "GW.2", home: { name: "Spain",        flag: "🇪🇸", pct: 58 }, draw: { pct: 24 }, away: { name: "Morocco",      flag: "🇲🇦", pct: 18 } },
];

const PAST: PastMatch[] = [
  { id: "mex-rsa", day: 17, date: "Jun 17", gw: "GW.1", home: { name: "Mexico",      flag: "🇲🇽", score: 2, pct: 58 }, draw: { pct: 24 }, away: { name: "South Africa", flag: "🇿🇦", score: 0, pct: 18 }, myPick: null },
  { id: "kor-cze", day: 17, date: "Jun 17", gw: "GW.1", home: { name: "South Korea", flag: "🇰🇷", score: 2, pct: 44 }, draw: { pct: 28 }, away: { name: "Czechia",      flag: "🇨🇿", score: 1, pct: 28 }, myPick: null },
  { id: "can-bih", day: 17, date: "Jun 17", gw: "GW.1", home: { name: "Canada",      flag: "🇨🇦", score: 1, pct: 52 }, draw: { pct: 26 }, away: { name: "Bosnia",       flag: "🇧🇦", score: 1, pct: 22 }, myPick: null },
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

// ── Shared: flag circle ───────────────────────────────────────────────────────
function Flag({ emoji, size = 72 }: { emoji: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: P.gray, display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 12px rgba(31,39,84,0.08)",
    }}>
      <span style={{ fontSize: size * 0.68, lineHeight: 1 }}>{emoji}</span>
    </div>
  );
}

// ── Shared: day strip ─────────────────────────────────────────────────────────
function DayStrip({ selected, onSelect }: { selected: number; onSelect: (d: number) => void }) {
  return (
    <div className="no-scrollbar" style={{
      display: "flex", gap: 4, overflowX: "auto", flexShrink: 0,
      padding: "8px 10px", background: P.white, borderBottom: `1px solid ${P.border}`,
    }}>
      {DAYS.map(({ short, num, day, today }) => {
        const active = day === selected;
        return (
          <button key={day} onClick={() => onSelect(day)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            minWidth: 48, padding: "8px 5px", border: "none", cursor: "pointer",
            borderRadius: 11, background: active ? P.blueBg : "transparent",
            color: active ? P.blue : P.muted,
            boxShadow: active ? "inset 0 0 0 1px #dce0ff" : "none",
          }}>
            <span style={{ fontSize: 10, fontWeight: 650 }}>{today ? "Today" : short}</span>
            <strong style={{ fontSize: 15, fontWeight: 800, color: active ? P.blue : P.ink }}>{num}</strong>
          </button>
        );
      })}
    </div>
  );
}

// ── Shared: countdown pill ────────────────────────────────────────────────────
function Countdown({ day }: { day: number }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const targets = MATCHES
      .filter(m => m.day === day && KICKOFF[m.id])
      .map(m => new Date(KICKOFF[m.id]).getTime())
      .filter(t => t > Date.now())
      .sort((a, b) => a - b);
    const target = targets[0];
    if (!target) { setS(0); return; }
    const tick = () => setS(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [day]);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
      borderRadius: 999, background: P.white, border: `1px solid ${P.border}`,
      fontSize: 13, color: "#5f6375", boxShadow: "0 3px 12px rgba(32,39,78,0.04)",
    }}>
      <span style={{ fontSize: 18, color: P.blue, lineHeight: 1 }}>◷</span>
      {s === 0
        ? <span>Predictions closed</span>
        : <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {pad(Math.floor(s / 3600))} : {pad(Math.floor((s % 3600) / 60))} : {pad(s % 60)}
          </span>
      }
    </div>
  );
}

// ── Picks: match card ─────────────────────────────────────────────────────────
function MatchCard({ match: m, pick, onPick }: {
  match: Match;
  pick: { home: ScoreVal; away: ScoreVal };
  onPick: (h: ScoreVal, a: ScoreVal) => void;
}) {
  const total = m.home.pct + m.draw.pct + m.away.pct;
  const hPct = Math.round((m.home.pct / total) * 100);
  const dPct = Math.round((m.draw.pct / total) * 100);
  const aPct = 100 - hPct - dPct;
  const maxP = Math.max(hPct, dPct, aPct);

  function OddPill({ label, pct }: { label: string; pct: number }) {
    const fav = pct === maxP;
    const under = pct < 25 && label !== "X";
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        padding: "6px 0", borderRadius: 8, gap: 2,
        background: fav ? "rgba(21,169,87,0.08)" : under ? "rgba(223,83,83,0.07)" : P.gray,
        border: `1px solid ${fav ? "rgba(21,169,87,0.25)" : under ? "rgba(223,83,83,0.18)" : "transparent"}`,
      }}>
        <span style={{ fontSize: 8, fontWeight: 800, opacity: 0.6 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: fav ? P.green : under ? P.red : P.ink }}>{pct}%</span>
      </div>
    );
  }

  const inputSt = (val: ScoreVal) => ({
    width: 52, height: 58, padding: 0, textAlign: "center" as const,
    fontSize: 24, fontWeight: 700, outline: "none", border: "none",
    borderRadius: 10, transition: "all 0.15s",
    background: val !== "" ? P.blueBg : P.gray,
    color: val !== "" ? P.blue : P.ink,
    boxShadow: val !== "" ? `inset 0 0 0 1.5px ${P.blue}` : `inset 0 0 0 1.5px ${P.border}`,
  });

  return (
    <div style={{
      background: P.white, borderRadius: 16, border: `1px solid ${P.border}`,
      boxShadow: "0 5px 18px rgba(31,39,84,0.055)", marginBottom: 10, overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 13px 0", color: P.muted, fontSize: 11 }}>
        <span>{m.gw} · {m.time}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c2c5d0", display: "inline-block" }} />
          Open
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 1fr", alignItems: "center", padding: "8px 8px 14px", gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <Flag emoji={m.home.flag} size={68} />
          <span style={{ fontSize: 13, fontWeight: 650, color: P.ink, textAlign: "center" }}>{m.home.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="number" min={0} max={99} value={pick.home}
              onChange={e => onPick(e.target.value === "" ? "" : Math.min(99, parseInt(e.target.value) || 0), pick.away)}
              style={inputSt(pick.home)}
            />
            <span style={{ fontSize: 16, fontWeight: 700, color: P.muted }}>:</span>
            <input
              type="number" min={0} max={99} value={pick.away}
              onChange={e => onPick(pick.home, e.target.value === "" ? "" : Math.min(99, parseInt(e.target.value) || 0))}
              style={inputSt(pick.away)}
            />
          </div>
          <div style={{ display: "flex", gap: 4, width: "100%" }}>
              <OddPill label="1" pct={hPct} />
              <OddPill label="X" pct={dPct} />
              <OddPill label="2" pct={aPct} />
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <Flag emoji={m.away.flag} size={68} />
          <span style={{ fontSize: 13, fontWeight: 650, color: P.ink, textAlign: "center" }}>{m.away.name}</span>
        </div>
      </div>
    </div>
  );
}

// ── Picks tab ─────────────────────────────────────────────────────────────────
function PicksTab({ userId }: { userId: string | null }) {
  const [day, setDay] = useState(19);
  const [picks, setPicks] = useState<Record<string, { home: ScoreVal; away: ScoreVal }>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getUserPicks(userId).then((rows: DBPick[]) => {
      const map: Record<string, { home: ScoreVal; away: ScoreVal }> = {};
      for (const r of rows) map[r.match_id] = { home: r.home_score, away: r.away_score };
      setPicks(map);
    });
  }, [userId]);

  const dayMatches = MATCHES.filter(m => m.day === day);
  const filled = dayMatches.filter(m => { const p = picks[m.id]; return p && p.home !== "" && p.away !== ""; }).length;

  async function save() {
    if (!userId || filled === 0) return;
    setSaved(true);
    const rows = dayMatches
      .filter(m => picks[m.id]?.home !== "" && picks[m.id]?.away !== "")
      .map(m => ({ matchId: m.id, homeScore: Number(picks[m.id].home), awayScore: Number(picks[m.id].away) }));
    await savePicks(userId, rows);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P.canvas, position: "relative" }}>
      <DayStrip selected={day} onSelect={setDay} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "10px 16px 6px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: P.muted }}>
          Odds powered by
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://polymarket.com/images/brand/logo-black.png" alt="Polymarket" style={{ height: 11, opacity: 0.45, display: "block" }} />
        </span>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "4px 12px 0" }}>
        {dayMatches.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 240, gap: 12, color: P.muted }}>
            <span style={{ fontSize: 40 }}>⚽</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>No games this day</span>
          </div>
        ) : dayMatches.map(m => (
          <MatchCard
            key={m.id} match={m}
            pick={picks[m.id] ?? { home: "", away: "" }}
            onPick={(h, a) => setPicks(prev => ({ ...prev, [m.id]: { home: h, away: a } }))}
          />
        ))}
        <div style={{ height: 88 }} />
      </div>

      <div style={{
        position: "absolute", inset: "auto 0 0 0", padding: "26px 16px 12px",
        background: `linear-gradient(to top, ${P.canvas} 60%, transparent)`,
        pointerEvents: "none",
      }}>
        <button onClick={save} disabled={filled === 0 || saved} style={{
          width: "100%", minHeight: 52, borderRadius: 13, border: "none",
          cursor: filled === 0 ? "default" : "pointer", fontSize: 14, fontWeight: 750,
          background: saved ? P.green : filled === 0 ? P.border : `linear-gradient(180deg, #4265ff, ${P.blue})`,
          color: filled === 0 ? P.muted : "#fff",
          boxShadow: filled > 0 && !saved ? "0 9px 24px rgba(49,87,246,0.24)" : "none",
          transition: "all 0.2s", pointerEvents: "auto",
        }}>
          {saved ? "✓ Predictions saved!" : filled === 0 ? "Enter a prediction above" : `🔒 Lock ${filled} of ${dayMatches.length} predictions`}
        </button>
      </div>
    </div>
  );
}

// ── Results tab ───────────────────────────────────────────────────────────────
function ResultsTab() {
  const [day, setDay] = useState(17);
  const dayResults = PAST.filter(m => m.day === day);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <DayStrip selected={day} onSelect={setDay} />
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", background: P.canvas, padding: "12px 12px 0" }}>
        {dayResults.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 240, gap: 12, color: P.muted }}>
            <span style={{ fontSize: 40 }}>⏳</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>No results yet</span>
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
          const winPct    = homeWon ? m.home.pct : awayWon ? m.away.pct : m.draw.pct;
          const earnedPts = exact ? pts(winPct) * 3 : correct ? pts(winPct) : 0;

          return (
            <div key={m.id} style={{
              background: P.white, borderRadius: 16, border: `1px solid ${P.border}`,
              boxShadow: "0 5px 18px rgba(31,39,84,0.055)", marginBottom: 10, overflow: "hidden",
            }}>
              <div style={{ padding: "10px 13px 0", display: "flex", gap: 6, alignItems: "center", color: P.muted, fontSize: 11 }}>
                <span>🏆</span><span>{m.gw} · {m.date}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "10px 12px 14px", gap: 8 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Flag emoji={m.home.flag} size={68} />
                  <span style={{ fontSize: 12, fontWeight: 650, color: P.ink, textAlign: "center" }}>{m.home.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    padding: "8px 20px", borderRadius: 10, background: P.gray,
                    border: `2px solid ${exact ? P.blue : correct ? P.green : P.border}`,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: P.ink, fontVariantNumeric: "tabular-nums" }}>
                      {m.home.score} : {m.away.score}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {m.myPick && <span style={{ fontSize: 11, color: P.muted }}>Pick: {m.myPick.home}–{m.myPick.away}</span>}
                    {earnedPts > 0 && (
                      <div style={{ padding: "3px 10px", borderRadius: 8, background: exact ? P.blue : P.greenBg, border: `1px solid ${exact ? P.blue : P.green}` }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: exact ? "#fff" : P.green }}>+{earnedPts} pts {exact ? "🎯" : "✓"}</span>
                      </div>
                    )}
                    {!earnedPts && m.myPick && <span style={{ fontSize: 11, color: P.red }}>✗ miss</span>}
                    {!m.myPick && <span style={{ fontSize: 11, color: P.muted }}>No pick</span>}
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Flag emoji={m.away.flag} size={68} />
                  <span style={{ fontSize: 12, fontWeight: 650, color: P.ink, textAlign: "center" }}>{m.away.name}</span>
                </div>
              </div>
              {m.myPick && (
                <div style={{ display: "flex", gap: 20, padding: "8px 16px 12px", borderTop: `1px solid ${P.border}` }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 9, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 800 }}>My odd</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: P.ink }}>{earnedPts > 0 ? pts(winPct) : "–"}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 9, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 800 }}>My prediction</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: P.ink }}>{m.myPick.home} – {m.myPick.away}</p>
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

// ── Ranking tab ───────────────────────────────────────────────────────────────
function RankingTab({ user }: { user: { name: string; avatar: string } }) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { getLeaderboard().then(setBoard); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P.canvas }}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${P.border}`, background: P.white }}>
        <span style={{ flex: 1, fontSize: 10, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 800 }}>Players</span>
        <span style={{ width: 44, textAlign: "center", fontSize: 10, color: P.muted, textTransform: "uppercase", fontWeight: 800 }}>Good</span>
        <span style={{ width: 44, textAlign: "center", fontSize: 10, color: P.muted, textTransform: "uppercase", fontWeight: 800 }}>Exact</span>
        <span style={{ width: 56, textAlign: "right", fontSize: 10, color: P.blue, textTransform: "uppercase", fontWeight: 800 }}>Pts</span>
      </div>
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        {board.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 240, gap: 12, color: P.muted }}>
            <span style={{ fontSize: 40 }}>🏆</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>No picks yet</span>
          </div>
        ) : board.map((p, i) => {
          const isMe = p.name === user.name;
          return (
            <div key={p.user_id} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${P.border}`, background: isMe ? P.blueBg : P.white }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, width: 20, color: i === 0 ? P.blue : P.muted }}>{i + 1}</span>
                <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: P.gray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `2px solid ${isMe ? P.blue : "transparent"}` }}>{p.avatar}</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: P.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}{isMe && <span style={{ fontSize: 11, color: P.blue, marginLeft: 6 }}>· you</span>}
                </span>
              </div>
              <span style={{ width: 44, textAlign: "center", fontSize: 13, color: P.muted }}>{p.good_picks}</span>
              <span style={{ width: 44, textAlign: "center", fontSize: 13, color: P.muted }}>{p.exact_picks}</span>
              <span style={{ width: 56, textAlign: "right", fontSize: 17, fontWeight: 900, color: P.blue }}>{p.total_pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── League tab ────────────────────────────────────────────────────────────────
function ProfileTab({ user }: { user: { name: string; avatar: string } }) {
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { getLeaderboard().then(setBoard); }, []);

  const myRank = board.findIndex(p => p.name === user.name) + 1;

  function share() {
    if (navigator.share) {
      navigator.share({ title: "ScoreVault", text: `Join my WC2026 picks league! Code: ${LEAGUE_CODE}`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(LEAGUE_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const RULES = [
    { icon: "⚽", title: "Predict the score", body: "Enter the exact scoreline for each match before kick-off." },
    { icon: "🔒", title: "Lock before kick-off", body: "Picks are locked once the match starts — no edits." },
    { icon: "📊", title: "Earn points", body: "Exact score = maximum points (rarity-weighted). Correct result = partial points." },
    { icon: "🏆", title: "Top score wins", body: "Most points at the end of the tournament takes the prize." },
  ];

  return (
    <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", background: P.canvas }}>

      {/* Profile header */}
      <div style={{ background: `linear-gradient(to bottom, rgba(49,87,246,0.07), ${P.canvas})`, padding: "22px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: P.white, border: `3px solid ${P.blue}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 6px 20px rgba(49,87,246,0.18)" }}>{user.avatar}</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 900, color: P.ink }}>{user.name}</h2>
        {myRank > 0 && <div style={{ fontSize: 12, color: P.blue, fontWeight: 700 }}>#{myRank} in your league</div>}
      </div>

      <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>

        {/* League standings */}
        <div style={{ background: P.white, borderRadius: 16, border: `1px solid ${P.border}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: P.ink, letterSpacing: "0.04em" }}>MY LEAGUE</span>
            <span style={{ fontSize: 11, color: P.muted }}>{board.length} player{board.length !== 1 ? "s" : ""}</span>
          </div>
          {board.slice(0, 5).map((p, i) => {
            const isMe = p.name === user.name;
            return (
              <div key={p.user_id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderTop: `1px solid ${P.border}`, background: isMe ? P.blueBg : "transparent" }}>
                <span style={{ fontSize: 12, fontWeight: 800, width: 18, color: i === 0 ? "#f59e0b" : P.muted }}>{i === 0 ? "🥇" : i + 1}</span>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: P.gray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, margin: "0 9px", border: `2px solid ${isMe ? P.blue : "transparent"}` }}>{p.avatar}</div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: P.ink }}>{p.name}{isMe && <span style={{ color: P.blue, fontSize: 10, marginLeft: 5 }}>· you</span>}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: P.blue }}>{p.total_pts} pts</span>
              </div>
            );
          })}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${P.border}`, display: "flex", gap: 8 }}>
            <button onClick={share} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${P.border}`, background: "none", color: P.ink, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              + Invite
            </button>
            <button onClick={share} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: P.blueBg, color: P.blue, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "Copied!" : `Code: ${LEAGUE_CODE}`}
            </button>
          </div>
        </div>

        {/* How to play */}
        <div style={{ background: P.white, borderRadius: 16, border: `1px solid ${P.border}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${P.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: P.ink, letterSpacing: "0.04em" }}>HOW TO PLAY</span>
          </div>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            {RULES.map(r => (
              <div key={r.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, marginBottom: 1 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.5 }}>{r.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LT vision */}
        <div style={{ borderRadius: 16, padding: 18, background: "linear-gradient(145deg, #253ccf, #3157f6 52%, #172784)", boxShadow: "0 12px 32px rgba(49,87,246,0.22)" }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.09em", color: "#1637d5", background: "#fff", width: "fit-content", padding: "4px 8px", borderRadius: 4, marginBottom: 12 }}>COMING SOON</div>
          <h3 style={{ margin: "0 0 8px", fontFamily: "Impact, sans-serif", fontSize: 22, color: "#fff", letterSpacing: "0.02em" }}>ScoreVault v2</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#c8d0ff", lineHeight: 1.6 }}>
            Stake USDC · on-chain scoring · real prizes.<br />
            Top scorer at WC2026 Final wins <strong style={{ color: "#fff" }}>2 seats in NYC</strong>.<br />
            Built on Base — trustless, transparent, no middleman.
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({ onDone }: { onDone: (name: string, avatar: string) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const valid = name.trim().length >= 2;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", background: P.canvas }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 20, background: P.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: "0 8px 32px rgba(49,87,246,0.4)" }}>⚽</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: P.ink, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>ScoreVault</h1>
      <p style={{ fontSize: 13, color: P.muted, margin: "0 0 36px", textAlign: "center", lineHeight: 1.6 }}>
        {step === 1 ? "Pick scores. Climb the board. Challenge your friends." : `Nice, ${name.trim()}! Pick your avatar`}
      </p>
      {step === 1 ? (
        <>
          <input autoFocus placeholder="Your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && valid && setStep(2)}
            style={{ width: "100%", padding: "16px 20px", marginBottom: 14, borderRadius: 14, outline: "none", boxSizing: "border-box", border: `2px solid ${valid ? P.blue : P.border}`, background: P.white, fontSize: 18, fontWeight: 700, color: P.ink, transition: "border-color 0.2s" }} />
          <button onClick={() => valid && setStep(2)} disabled={!valid}
            style={{ width: "100%", padding: 17, borderRadius: 14, border: "none", background: valid ? P.blue : P.border, color: valid ? "#fff" : P.muted, fontSize: 15, fontWeight: 800, cursor: valid ? "pointer" : "default", boxShadow: valid ? "0 4px 20px rgba(49,87,246,0.35)" : "none" }}>
            Continue →
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, width: "100%", marginBottom: 20 }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)}
                style={{ fontSize: 36, padding: "14px 0", borderRadius: 14, cursor: "pointer", background: avatar === a ? P.blueBg : P.white, border: `2px solid ${avatar === a ? P.blue : P.border}` }}>{a}</button>
            ))}
          </div>
          <button onClick={() => onDone(name.trim(), avatar)}
            style={{ width: "100%", padding: 17, borderRadius: 14, border: "none", background: P.blue, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(49,87,246,0.35)" }}>
            Let&apos;s play! 🚀
          </button>
        </>
      )}
    </div>
  );
}

// ── Bottom nav ────────────────────────────────────────────────────────────────
const TAB_TITLES: Record<Tab, string> = {
  picks: "MY PREDICTIONS", results: "RESULTS", ranking: "STANDINGS", profile: "PROFILE",
};

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: string | React.JSX.Element }[] = [
    { id: "picks", label: "Predictions", icon: (
      <div style={{ width: 26, height: 22, borderRadius: 6, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", background: tab === "picks" ? P.blue : "#a8abba", color: "#fff" }}>1:1</div>
    )},
    { id: "results", label: "Results", icon: <span style={{ fontSize: 22, filter: tab === "results" ? "none" : "grayscale(1) opacity(0.5)" }}>⚽</span> },
    { id: "ranking", label: "Ranking", icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === "ranking" ? P.blue : "#9a9eaf"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    )},
    { id: "profile", label: "Profile", icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === "profile" ? P.blue : "#9a9eaf"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    )},
  ];

  return (
    <nav style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", minHeight: 68, background: P.white, borderTop: `1px solid ${P.border}`, boxShadow: "0 -8px 24px rgba(38,45,82,0.06)", paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
      {items.map(item => (
        <button key={item.id} onClick={() => setTab(item.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, border: "none", cursor: "pointer", background: "transparent", padding: "8px 2px",
          color: tab === item.id ? P.blue : "#9a9eaf",
          borderTop: `3px solid ${tab === item.id ? P.blue : "transparent"}`,
          transition: "color 0.15s",
        }}>
          {item.icon}
          <span style={{ fontSize: 10, fontWeight: tab === item.id ? 700 : 500, lineHeight: 1 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── InstallBanner ─────────────────────────────────────────────────────────────
function InstallBanner({ onDismiss }: { onDismiss: () => void }) {
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  // iOS share icon SVG (box + arrow up)
  const ShareIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
  // Android menu icon (⋮)
  const MenuIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={P.blue} stroke="none">
      <circle cx="12" cy="5"  r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
    </svg>
  );

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%",
      width: "min(100vw, 430px)", zIndex: 998,
      animation: "sv-slide-up 0.5s cubic-bezier(0.34,1.46,0.64,1) forwards",
      paddingBottom: "env(safe-area-inset-bottom, 0)",
    }}>
      {/* main card */}
      <div style={{
        margin: "0 10px 10px",
        borderRadius: 20,
        background: P.white,
        boxShadow: "0 -2px 40px rgba(31,39,84,0.16), 0 0 0 1px rgba(30,37,72,0.06)",
        padding: "18px 18px 16px",
        position: "relative",
      }}>
        {/* × */}
        <button onClick={onDismiss} style={{
          position: "absolute", top: 12, right: 12,
          width: 28, height: 28, borderRadius: "50%",
          border: "none", background: P.gray,
          color: P.muted, fontSize: 18, lineHeight: 1,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>

        {/* header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: P.blue, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 14px rgba(49,87,246,0.35)",
          }}>⚽</div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: P.ink }}>Add to Home Screen</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: P.muted }}>Keep ScoreVault one tap away</p>
          </div>
        </div>

        {/* step */}
        <div style={{
          padding: "12px 14px", borderRadius: 12,
          background: P.blueBg, border: `1px solid #d9ddff`,
          display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
        }}>
          <span style={{ animation: "sv-tap-pulse 1.4s ease-in-out infinite", display: "flex" }}>
            {isIOS ? ShareIcon : MenuIcon}
          </span>
          <span style={{ fontSize: 13, color: P.ink, lineHeight: 1.45 }}>
            {isIOS
              ? <><strong>Tap Share</strong> at the bottom, then <strong>"Add to Home Screen"</strong></>
              : <><strong>Tap ⋮ Menu</strong> in your browser, then <strong>"Add to Home Screen"</strong></>
            }
          </span>
        </div>

        {/* actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onDismiss} style={{
            flex: 1, padding: "11px 0", borderRadius: 10,
            border: `1px solid ${P.border}`, background: "none",
            color: P.muted, fontSize: 13, cursor: "pointer",
          }}>Maybe later</button>
          <button onClick={onDismiss} style={{
            flex: 2, padding: "11px 0", borderRadius: 10,
            border: "none", background: P.blue,
            color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer",
          }}>Got it ✓</button>
        </div>
      </div>

      {/* bouncing arrow pointing at browser chrome below */}
      <div style={{
        textAlign: "center", fontSize: 20, color: P.blue,
        marginBottom: 6, lineHeight: 1,
        animation: "sv-bounce-down 1.1s ease-in-out infinite",
      }}>↓</div>
    </div>
  );
}

// ── PromoPopup ────────────────────────────────────────────────────────────────
function PromoPopup({ onDismiss }: { onDismiss: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit() {
    if (!email.includes("@") || status !== "idle") return;
    setStatus("loading");
    await new Promise(r => setTimeout(r, 900));
    setStatus("done");
  }

  return (
    <div
      onClick={onDismiss}
      style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(15,18,45,0.62)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: "relative", width: "100%", maxWidth: 340, borderRadius: 22, background: P.white, boxShadow: "0 32px 80px rgba(31,39,84,0.28), 0 0 0 1px rgba(30,37,72,0.06)", overflow: "hidden" }}
      >
        {/* gradient header */}
        <div style={{ background: "linear-gradient(135deg, #253ccf 0%, #3157f6 55%, #172784 100%)", padding: "26px 24px 20px" }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.09em", color: "#1637d5", background: "#fff", width: "fit-content", padding: "5px 9px", borderRadius: 5, marginBottom: 14 }}>
            COMING SOON · WC2026
          </div>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏟️</div>
          <h2 style={{ margin: "0 0 8px", fontFamily: "Impact, sans-serif", fontSize: 26, color: "#fff", letterSpacing: "0.02em", lineHeight: 1.1 }}>
            Win 2 seats<br />in NYC
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#c8d0ff", lineHeight: 1.5 }}>
            Right now ScoreVault is free — predict scores &amp; climb the board with your crew. <strong style={{ color: "#fff" }}>Soon you&apos;ll stake real money</strong> and play for keeps.
          </p>
        </div>

        {/* body */}
        <div style={{ padding: "18px 20px 20px" }}>
          {/* two pillars */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { icon: "👥", label: "Today", desc: "Track scores with friends, free" },
              { icon: "💰", label: "Soon", desc: "Stake USDC, win real prizes" },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{ padding: "12px 10px", borderRadius: 12, background: P.blueBg, border: `1px solid #d9ddff`, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: P.blue, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: P.muted, lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>

          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: P.ink }}>
            Drop your email → enter the WC ticket draw &amp; be first to know when v2 drops
          </p>

          {status === "done" ? (
            <div style={{ padding: "14px 12px", borderRadius: 12, background: P.greenBg, border: "1px solid rgba(21,169,87,0.25)", textAlign: "center", fontSize: 13, fontWeight: 800, color: P.green }}>
              ✓ You&apos;re in — we&apos;ll be in touch!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ padding: "13px 14px", borderRadius: 10, border: `1px solid ${P.border}`, background: P.white, color: P.ink, fontSize: 14, outline: "none" }}
              />
              <button
                onClick={submit}
                disabled={!email.includes("@") || status === "loading"}
                style={{ padding: "13px 0", borderRadius: 10, border: "none", background: P.blue, color: "#fff", fontSize: 14, fontWeight: 800, cursor: email.includes("@") ? "pointer" : "default", opacity: email.includes("@") ? 1 : 0.55 }}
              >
                {status === "loading" ? "Joining…" : "I'm in →"}
              </button>
            </div>
          )}

          <button onClick={onDismiss} style={{ display: "block", width: "100%", marginTop: 10, padding: "8px 0", background: "none", border: "none", fontSize: 12, color: P.muted, cursor: "pointer" }}>
            Not now
          </button>
        </div>

        {/* X */}
        <button
          onClick={onDismiss}
          style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.22)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("picks");
  const [ready, setReady] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  function dismissPromo() {
    try { localStorage.setItem("sv_promo_seen", "1"); } catch {}
    setShowPromo(false);
  }

  function dismissInstall() {
    try { localStorage.setItem("sv_install_seen", "1"); } catch {}
    setShowInstall(false);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      try { const s = localStorage.getItem("sv_user"); if (s) setUser(JSON.parse(s)); } catch {}
      try { if (!localStorage.getItem("sv_promo_seen")) setShowPromo(true); } catch {}
      setReady(true);
    }, 0);
    ensureSession().then(setUserId).catch(() => setUserId(null));
    return () => clearTimeout(t);
  }, []);

  // Show install banner 5 s after user is logged in (not standalone, not already seen)
  useEffect(() => {
    if (!user) return;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;
    try { if (localStorage.getItem("sv_install_seen")) return; } catch {}
    const t = setTimeout(() => setShowInstall(true), 5000);
    return () => clearTimeout(t);
  }, [user]);

  async function onboard(name: string, avatar: string) {
    const u = { name, avatar };
    localStorage.setItem("sv_user", JSON.stringify(u));
    setUser(u);
    const uid = userId ?? (await ensureSession());
    if (uid) { setUserId(uid); await upsertProfile(uid, name, avatar); }
  }

  if (!ready) return null;

  if (!user) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: P.bg }}>
        <div style={{ height: "min(100dvh, 932px)", width: "min(100vw, 430px)", overflow: "hidden" }}>
          <Onboarding onDone={onboard} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: P.bg }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "min(100vw, 430px)", height: "min(100dvh, 932px)", overflow: "hidden", background: P.canvas, boxShadow: "0 28px 90px rgba(31,39,84,0.18), 0 0 0 1px rgba(30,37,72,0.05)" }}>
        <header style={{ display: "grid", gridTemplateColumns: "92px 1fr 92px", alignItems: "center", minHeight: 64, padding: "max(0px,env(safe-area-inset-top)) 14px 0", background: P.white, borderBottom: `1px solid ${P.border}`, boxShadow: "0 4px 18px rgba(32,39,78,0.04)" }}>
          <div />
          <h1 style={{ margin: 0, textAlign: "center", fontSize: 17, fontWeight: 800, color: P.ink, letterSpacing: "-0.02em" }}>{TAB_TITLES[tab]}</h1>
          <div />
        </header>

        <main style={{ position: "relative", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === "picks"   && <PicksTab userId={userId} />}
          {tab === "results" && <ResultsTab />}
          {tab === "ranking" && <RankingTab user={user} />}
          {tab === "profile"  && <ProfileTab user={user} />}
        </main>

        <BottomNav tab={tab} setTab={setTab} />
      </div>
      {showPromo && <PromoPopup onDismiss={dismissPromo} />}
      {showInstall && !showPromo && <InstallBanner onDismiss={dismissInstall} />}
    </div>
  );
}
