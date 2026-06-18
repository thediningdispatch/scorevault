"use client";
import { useState, useEffect } from "react";
import { Trophy, Users, Share2, Check, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Theme: MPP × Revolut ─────────────────────────────────────────────────────
const T = {
  bg:       "#F4F6F9",
  surface:  "#FFFFFF",
  border:   "#E8ECF2",
  accent:   "#10B981",
  accentBg: "#ECFDF5",
  accentDk: "#059669",
  gold:     "#F59E0B",
  goldBg:   "#FFFBEB",
  text:     "#0F172A",
  sub:      "#64748B",
  mute:     "#94A3B8",
  green:    "#10B981",
  red:      "#EF4444",
  redBg:    "#FEF2F2",
  blue:     "#3B82F6",
};

// ─── Points formula ───────────────────────────────────────────────────────────
// Calibrated: cote 1.3 → 30 pts, cote 4.0 → 120 pts
// Exact score = ×3 bonus
function calcPoints(pct: number): number {
  const odds = 100 / Math.max(1, pct);
  return Math.round(22 * Math.pow(odds, 1.23));
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ScoreVal = number | "";
type Tab = "picks" | "results" | "leaderboard" | "league";

interface Match {
  id: string; day: number; time: string;
  home: { name: string; flag: string; pct: number };
  draw: { pct: number };
  away: { name: string; flag: string; pct: number };
}

interface PastMatch {
  id: string; day: number; date: string;
  home: { name: string; flag: string; score: number; pct: number };
  draw: { pct: number };
  away: { name: string; flag: string; score: number; pct: number };
  myPick: { home: number; away: number } | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MATCHES: Match[] = [
  { id: "gha-pan", day: 18, time: "3:00 PM ET",
    home: { name: "Ghana",       flag: "🇬🇭", pct: 56 },
    draw: { pct: 26 },
    away: { name: "Panama",      flag: "🇵🇦", pct: 18 } },
  { id: "uzb-col", day: 18, time: "6:00 PM ET",
    home: { name: "Uzbekistan",  flag: "🇺🇿", pct: 8  },
    draw: { pct: 22 },
    away: { name: "Colombia",    flag: "🇨🇴", pct: 70 } },
  { id: "cze-rsa", day: 18, time: "9:00 PM ET",
    home: { name: "Czechia",     flag: "🇨🇿", pct: 52 },
    draw: { pct: 28 },
    away: { name: "South Africa",flag: "🇿🇦", pct: 20 } },
  { id: "usa-bol", day: 19, time: "12:00 PM ET",
    home: { name: "USA",         flag: "🇺🇸", pct: 72 },
    draw: { pct: 18 },
    away: { name: "Bolivia",     flag: "🇧🇴", pct: 10 } },
  { id: "ecu-ven", day: 19, time: "3:00 PM ET",
    home: { name: "Ecuador",     flag: "🇪🇨", pct: 48 },
    draw: { pct: 28 },
    away: { name: "Venezuela",   flag: "🇻🇪", pct: 24 } },
  { id: "fra-aut", day: 20, time: "6:00 PM ET",
    home: { name: "France",      flag: "🇫🇷", pct: 68 },
    draw: { pct: 20 },
    away: { name: "Austria",     flag: "🇦🇹", pct: 12 } },
  { id: "bra-arg", day: 20, time: "9:00 PM ET",
    home: { name: "Brazil",      flag: "🇧🇷", pct: 38 },
    draw: { pct: 26 },
    away: { name: "Argentina",   flag: "🇦🇷", pct: 36 } },
];

const PAST: PastMatch[] = [
  { id: "mex-rsa", day: 17, date: "Jun 17",
    home: { name: "Mexico",      flag: "🇲🇽", score: 2, pct: 58 },
    draw: { pct: 24 },
    away: { name: "South Africa",flag: "🇿🇦", score: 0, pct: 18 },
    myPick: { home: 2, away: 0 } },
  { id: "kor-cze", day: 17, date: "Jun 17",
    home: { name: "South Korea", flag: "🇰🇷", score: 2, pct: 44 },
    draw: { pct: 28 },
    away: { name: "Czechia",     flag: "🇨🇿", score: 1, pct: 28 },
    myPick: { home: 2, away: 1 } },
  { id: "can-bih", day: 17, date: "Jun 17",
    home: { name: "Canada",      flag: "🇨🇦", score: 1, pct: 52 },
    draw: { pct: 26 },
    away: { name: "Bosnia",      flag: "🇧🇦", score: 1, pct: 22 },
    myPick: { home: 1, away: 0 } },
];

const DAYS = [
  { short: "17", label: "Jun 17", day: 17 },
  { short: "18", label: "Jun 18", day: 18, today: true },
  { short: "19", label: "Jun 19", day: 19 },
  { short: "20", label: "Jun 20", day: 20 },
  { short: "21", label: "Jun 21", day: 21 },
  { short: "22", label: "Jun 22", day: 22 },
  { short: "23", label: "Jun 23", day: 23 },
];

const LEAGUE = { name: "WC2026 Squad", code: "SV-2026" };

const MOCK_BOARD = [
  { name: "Vianney",   avatar: "🦁", pts: 480, exact: 2, correct: 3 },
  { name: "Jules",     avatar: "🐯", pts: 280, exact: 1, correct: 2 },
  { name: "Guillaume", avatar: "🦊", pts: 120, exact: 0, correct: 1 },
];

const AVATARS = ["⚽", "🦁", "🐯", "🦊", "🐺", "🦅", "🐉", "🦄"];

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
      padding: "32px 24px", background: T.surface,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24, marginBottom: 20,
        background: T.accent, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 38, boxShadow: `0 8px 32px ${T.accent}50`,
      }}>⚽</div>

      <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: "0 0 8px", textAlign: "center" }}>
        ScoreVault
      </h1>
      <p style={{ fontSize: 14, color: T.sub, margin: "0 0 40px", textAlign: "center", lineHeight: 1.6 }}>
        {step === 1
          ? "Pick scores. Climb the board.\nChallenge your crew."
          : `Nice, ${name.trim()}! Now pick your avatar 👇`}
      </p>

      {step === 1 ? (
        <>
          <label style={{
            width: "100%", display: "block", marginBottom: 8,
            fontSize: 11, fontWeight: 700, color: T.mute,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>Your name</label>
          <input
            type="text" autoFocus placeholder="e.g. Jules"
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && valid && setStep(2)}
            style={{
              width: "100%", padding: "16px 20px", marginBottom: 16,
              borderRadius: 16, outline: "none", boxSizing: "border-box",
              border: `2px solid ${valid ? T.accent : T.border}`,
              background: T.bg, fontSize: 20, fontWeight: 700,
              color: T.text, transition: "border-color 0.2s",
            }}
          />
          <button onClick={() => valid && setStep(2)} disabled={!valid} style={{
            width: "100%", padding: "18px", borderRadius: 16, border: "none",
            background: valid ? T.accent : T.mute, color: "white",
            fontSize: 16, fontWeight: 700, cursor: valid ? "pointer" : "default",
            boxShadow: valid ? `0 4px 20px ${T.accent}50` : "none",
            transition: "all 0.2s",
          }}>Continue →</button>
        </>
      ) : (
        <>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12, width: "100%", marginBottom: 24,
          }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                fontSize: 36, padding: "16px 0", borderRadius: 16, cursor: "pointer",
                background: avatar === a ? T.accentBg : T.bg,
                border: `2px solid ${avatar === a ? T.accent : T.border}`,
                transition: "all 0.15s",
              }}>{a}</button>
            ))}
          </div>
          <button onClick={() => onDone(name.trim(), avatar)} style={{
            width: "100%", padding: "18px", borderRadius: 16, border: "none",
            background: T.accent, color: "white", fontSize: 16, fontWeight: 700,
            cursor: "pointer", boxShadow: `0 4px 20px ${T.accent}50`,
          }}>Let&apos;s play! 🚀</button>
        </>
      )}
    </div>
  );
}

// ─── DayStrip ─────────────────────────────────────────────────────────────────
function DayStrip({ selected, onSelect }: { selected: number; onSelect: (d: number) => void }) {
  return (
    <div className="no-scrollbar" style={{
      display: "flex", overflowX: "auto", gap: 8,
      padding: "10px 16px", background: T.surface,
      borderBottom: `1px solid ${T.border}`,
    }}>
      {DAYS.map(({ short, day, today }) => {
        const active = day === selected;
        return (
          <button key={day} onClick={() => onSelect(day)} style={{
            flexShrink: 0, display: "flex", flexDirection: "column",
            alignItems: "center", padding: "8px 14px", borderRadius: 14, border: "none",
            background: active ? T.accent : today ? T.accentBg : "transparent",
            color: active ? "white" : today ? T.accent : T.sub,
            cursor: "pointer", transition: "all 0.15s", minWidth: 48,
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {today ? "TODAY" : "Jun"}
            </span>
            <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{short}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Pick card ────────────────────────────────────────────────────────────────
function PickCard({ match, picks, onPick }: {
  match: Match;
  picks: { home: ScoreVal; away: ScoreVal };
  onPick: (h: ScoreVal, a: ScoreVal) => void;
}) {
  const h = picks.home; const a = picks.away;

  let potPts: number | null = null;
  if (h !== "" && a !== "") {
    const hn = Number(h); const an = Number(a);
    potPts = hn > an ? calcPoints(match.home.pct)
           : an > hn ? calcPoints(match.away.pct)
           : calcPoints(match.draw.pct);
  }

  const inputStyle = (filled: boolean): React.CSSProperties => ({
    width: 56, height: 56, borderRadius: 16, outline: "none",
    border: `2px solid ${filled ? T.accent : T.border}`,
    background: filled ? T.accentBg : T.bg,
    fontSize: 24, fontWeight: 900, textAlign: "center", color: T.text,
    transition: "all 0.15s",
    boxShadow: filled ? `0 0 0 3px ${T.accent}20` : "none",
  });

  return (
    <div style={{
      margin: "0 16px 12px", borderRadius: 20, overflow: "hidden",
      background: T.surface, border: `1px solid ${T.border}`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 16px", background: T.bg, borderBottom: `1px solid ${T.border}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ⚽ World Cup · {match.time}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.mute }}>🔒 Locks at kickoff</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", padding: "20px 16px", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 46, lineHeight: 1 }}>{match.home.flag}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text, textAlign: "center", lineHeight: 1.2 }}>
            {match.home.name}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*"
            value={h === "" ? "" : String(h)}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, "");
              onPick(v === "" ? "" : Math.min(20, parseInt(v) || 0), a);
            }}
            placeholder="–"
            style={inputStyle(h !== "")}
          />
          <span style={{ fontSize: 22, fontWeight: 900, color: T.mute }}>:</span>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*"
            value={a === "" ? "" : String(a)}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, "");
              onPick(h, v === "" ? "" : Math.min(20, parseInt(v) || 0));
            }}
            placeholder="–"
            style={inputStyle(a !== "")}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 46, lineHeight: 1 }}>{match.away.flag}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text, textAlign: "center", lineHeight: 1.2 }}>
            {match.away.name}
          </span>
        </div>
      </div>

      {potPts !== null && (
        <div style={{
          padding: "10px 16px", borderTop: `1px solid ${T.border}`,
          background: T.accentBg, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>
            🎯 {potPts} pts if your pick is right
          </span>
          <span style={{ fontSize: 11, color: T.sub }}>· ×3 for exact score</span>
        </div>
      )}
    </div>
  );
}

// ─── Picks tab ────────────────────────────────────────────────────────────────
function PicksTab({ user }: { user: { name: string; avatar: string } }) {
  const [day, setDay] = useState(18);
  const [picks, setPicks] = useState<Record<string, { home: ScoreVal; away: ScoreVal }>>({});
  const [saved, setSaved] = useState(false);

  const dayMatches = MATCHES.filter(m => m.day === day);
  const filled = dayMatches.filter(m => {
    const p = picks[m.id];
    return p && p.home !== "" && p.away !== "";
  }).length;

  function setPick(id: string, h: ScoreVal, a: ScoreVal) {
    setPicks(prev => ({ ...prev, [id]: { home: h, away: a } }));
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* User bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", background: T.surface, borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: T.accentBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, border: `1.5px solid ${T.accent}44`,
          }}>{user.avatar}</div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.text }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: T.sub }}>
              {filled} / {dayMatches.length} picks today
            </p>
          </div>
        </div>
        <div style={{
          padding: "6px 14px", borderRadius: 20,
          background: T.goldBg, border: `1px solid ${T.gold}44`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>⚽ WC 2026</span>
        </div>
      </div>

      <DayStrip selected={day} onSelect={setDay} />

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", paddingTop: 12, background: T.bg }}>
        {dayMatches.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
            <span style={{ fontSize: 48 }}>⚽</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.sub }}>No matches today</span>
          </div>
        ) : dayMatches.map(m => (
          <PickCard key={m.id} match={m}
            picks={picks[m.id] ?? { home: "", away: "" }}
            onPick={(h, a) => setPick(m.id, h, a)} />
        ))}
        <div style={{ height: 12 }} />
      </div>

      {/* CTA */}
      <div style={{ padding: "12px 16px", background: T.surface, borderTop: `1px solid ${T.border}` }}>
        <button onClick={save} disabled={filled === 0} style={{
          width: "100%", padding: "17px", borderRadius: 16, border: "none",
          background: saved ? T.green : filled > 0 ? T.accent : T.border,
          color: "white", fontSize: 15, fontWeight: 700,
          cursor: filled > 0 ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
          boxShadow: filled > 0 ? `0 4px 20px ${T.accent}50` : "none",
        }}>
          {saved
            ? <><Check size={16} /> Picks saved!</>
            : filled === dayMatches.length && dayMatches.length > 0
              ? `🔒 Lock all ${filled} picks`
              : filled > 0
                ? `Lock ${filled} / ${dayMatches.length} picks`
                : "Enter your picks above"}
        </button>
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
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", paddingTop: 12, background: T.bg }}>
        {dayResults.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
            <span style={{ fontSize: 48 }}>⏳</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.sub }}>No results yet</span>
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
          const winnerPct = homeWon ? m.home.pct : awayWon ? m.away.pct : m.draw.pct;
          const pts = exact ? calcPoints(winnerPct) * 3 : correct ? calcPoints(winnerPct) : 0;

          return (
            <div key={m.id} style={{
              margin: "0 16px 12px", borderRadius: 20, overflow: "hidden",
              background: T.surface, border: `1px solid ${T.border}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 16px", background: T.bg, borderBottom: `1px solid ${T.border}`,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ⚽ WC 2026 · {m.date}
                </span>
                {pts > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 800, color: exact ? T.gold : T.green }}>
                    +{pts} pts {exact ? "🎯" : "✓"}
                  </span>
                )}
                {pts === 0 && m.myPick && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.mute }}>0 pts</span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", padding: "20px 16px", gap: 10 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 42, lineHeight: 1 }}>{m.home.flag}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.text, textAlign: "center" }}>{m.home.name}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: homeWon ? `${T.green}18` : T.bg,
                      border: `2px solid ${homeWon ? T.green : T.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 900, color: T.text,
                    }}>{m.home.score}</div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: T.mute }}>:</span>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: awayWon ? `${T.green}18` : T.bg,
                      border: `2px solid ${awayWon ? T.green : T.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 900, color: T.text,
                    }}>{m.away.score}</div>
                  </div>
                  {m.myPick && (
                    <div style={{
                      padding: "4px 12px", borderRadius: 20,
                      background: exact ? T.goldBg : correct ? T.accentBg : T.redBg,
                      border: `1px solid ${exact ? T.gold + "55" : correct ? T.accent + "55" : T.red + "33"}`,
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: exact ? T.gold : correct ? T.accent : T.red,
                      }}>
                        {exact ? "🎯 Exact!" : correct ? "✓ Correct" : `✗ ${m.myPick.home}–${m.myPick.away}`}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 42, lineHeight: 1 }}>{m.away.flag}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.text, textAlign: "center" }}>{m.away.name}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

// ─── Leaderboard tab ──────────────────────────────────────────────────────────
function LeaderboardTab({ user }: { user: { name: string; avatar: string } }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg }}>
      {/* GW selector */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: T.surface, borderBottom: `1px solid ${T.border}`,
      }}>
        <button style={{
          width: 34, height: 34, borderRadius: 10, cursor: "pointer",
          border: `1px solid ${T.border}`, background: T.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronLeft size={16} color={T.sub} /></button>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.text }}>Matchday 1</p>
          <p style={{ margin: 0, fontSize: 11, color: T.sub }}>Jun 17–18 · 9 matchdays total</p>
        </div>
        <button style={{
          width: 34, height: 34, borderRadius: 10, cursor: "pointer",
          border: `1px solid ${T.border}`, background: T.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronRight size={16} color={T.sub} /></button>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        {/* Podium */}
        <div style={{ padding: "24px 16px 12px", display: "flex", justifyContent: "center", gap: 8, alignItems: "flex-end" }}>
          {/* 2nd */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 30 }}>{MOCK_BOARD[1].avatar}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{MOCK_BOARD[1].name}</span>
            <div style={{
              width: 84, height: 64, borderRadius: "14px 14px 0 0",
              background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 11, color: T.sub, fontWeight: 700 }}>2nd</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>{MOCK_BOARD[1].pts}</p>
                <p style={{ margin: 0, fontSize: 9, color: T.mute }}>pts</p>
              </div>
            </div>
          </div>
          {/* 1st */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>👑</span>
            <span style={{ fontSize: 36 }}>{MOCK_BOARD[0].avatar}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{MOCK_BOARD[0].name}</span>
            <div style={{
              width: 84, height: 88, borderRadius: "14px 14px 0 0",
              background: `linear-gradient(135deg, ${T.gold}, #D97706)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>1st</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "white" }}>{MOCK_BOARD[0].pts}</p>
                <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.8)" }}>pts</p>
              </div>
            </div>
          </div>
          {/* 3rd */}
          {MOCK_BOARD[2] && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 30 }}>{MOCK_BOARD[2].avatar}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{MOCK_BOARD[2].name}</span>
              <div style={{
                width: 84, height: 46, borderRadius: "14px 14px 0 0",
                background: "#E8D5BC", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#8B7355", fontWeight: 700 }}>3rd</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>{MOCK_BOARD[2].pts}</p>
                  <p style={{ margin: 0, fontSize: 9, color: T.mute }}>pts</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Full table */}
        <div style={{ margin: "0 16px 16px", borderRadius: 20, overflow: "hidden", background: T.surface, border: `1px solid ${T.border}` }}>
          <div style={{
            display: "flex", padding: "10px 16px",
            borderBottom: `1px solid ${T.border}`, background: T.bg,
          }}>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: T.mute, textTransform: "uppercase", letterSpacing: "0.05em" }}>Player</span>
            <span style={{ width: 56, textAlign: "center", fontSize: 10, fontWeight: 700, color: T.mute, textTransform: "uppercase" }}>Correct</span>
            <span style={{ width: 56, textAlign: "right", fontSize: 10, fontWeight: 700, color: T.gold, textTransform: "uppercase" }}>Points</span>
          </div>
          {MOCK_BOARD.map((p, i) => {
            const isMe = p.name === user.name;
            return (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", padding: "14px 16px",
                borderBottom: i < MOCK_BOARD.length - 1 ? `1px solid ${T.border}` : "none",
                background: isMe ? `${T.accent}08` : "transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, width: 18, color: i === 0 ? T.gold : T.mute }}>{i + 1}</span>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, fontSize: 22,
                    background: isMe ? T.accentBg : T.bg,
                    border: `1.5px solid ${isMe ? T.accent : T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{p.avatar}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>
                      {p.name}
                      {isMe && <span style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginLeft: 6 }}>· you</span>}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: T.sub }}>{p.exact} exact · {p.correct} correct</p>
                  </div>
                </div>
                <span style={{ width: 56, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.mute }}>{p.correct}</span>
                <span style={{ width: 56, textAlign: "right", fontSize: 20, fontWeight: 900, color: T.gold }}>{p.pts}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── League tab ───────────────────────────────────────────────────────────────
function LeagueTab({ user }: { user: { name: string; avatar: string } }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlist, setWaitlist] = useState<"idle" | "loading" | "done">("idle");

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
    const text = `Join my WC2026 picks league! Code: ${LEAGUE.code}`;
    if (navigator.share) {
      navigator.share({ title: "ScoreVault", text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="no-scrollbar" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", background: T.bg }}>
      {/* League hero */}
      <div style={{
        padding: "24px 16px 20px", background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: T.goldBg, border: `2px solid ${T.gold}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, boxShadow: `0 4px 24px ${T.gold}30`,
        }}>🏆</div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.text }}>{LEAGUE.name}</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.sub }}>
            {MOCK_BOARD.length} friends · WC 2026 · 9 matchdays
          </p>
        </div>

        {/* League code */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px", borderRadius: 16, width: "100%",
          background: T.bg, border: `1.5px dashed ${T.border}`,
          boxSizing: "border-box",
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: T.mute, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              League code
            </p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: "0.04em" }}>
              {LEAGUE.code}
            </p>
          </div>
          <button onClick={share} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 12, cursor: "pointer",
            background: copied ? T.accentBg : T.surface,
            border: `1.5px solid ${copied ? T.accent : T.border}`,
            color: copied ? T.accent : T.sub,
            fontSize: 13, fontWeight: 700, transition: "all 0.15s",
          }}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? "Copied!" : "Invite"}
          </button>
        </div>
      </div>

      {/* Members */}
      <div style={{ padding: "16px 16px 0" }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: T.mute, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Members
        </p>
        {MOCK_BOARD.map((p, i) => {
          const isMe = p.name === user.name;
          return (
            <div key={p.name} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 16, marginBottom: 8,
              background: T.surface,
              border: `1.5px solid ${isMe ? T.accent + "55" : T.border}`,
            }}>
              <span style={{
                fontSize: 13, fontWeight: 900, width: 18, textAlign: "center",
                color: i === 0 ? T.gold : T.mute,
              }}>{i + 1}</span>
              <div style={{
                width: 40, height: 40, borderRadius: 14, fontSize: 22,
                background: isMe ? T.accentBg : T.bg,
                border: `1.5px solid ${isMe ? T.accent : T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{p.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>
                  {p.name}
                  {isMe && <span style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginLeft: 6 }}>· you</span>}
                </p>
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: T.gold }}>{p.pts} pts</span>
            </div>
          );
        })}

        <button onClick={share} style={{
          width: "100%", padding: "15px", borderRadius: 14, cursor: "pointer",
          border: `2px dashed ${T.border}`, background: "transparent",
          color: T.sub, fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Plus size={18} color={T.sub} /> Invite a friend
        </button>
      </div>

      {/* Love money CTA */}
      <div style={{
        margin: "16px 16px 28px", padding: "22px 20px", borderRadius: 22,
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        boxShadow: "0 6px 30px rgba(0,0,0,0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🏟️</span>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "white", lineHeight: 1.2 }}>
              2 spots at the NYC Final
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: T.gold }}>
              Winner takes the pot — for real
            </p>
          </div>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
          Real money leagues dropping soon. Lock your spot now — your crew is probably already on the list.
        </p>
        {waitlist === "done" ? (
          <div style={{
            padding: "14px", borderRadius: 14,
            background: T.accentBg, border: `1px solid ${T.accent}44`,
            textAlign: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>
              ✓ You&apos;re on the list — we&apos;ll hit you first
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitEmail()}
              style={{
                flex: 1, padding: "14px 16px", borderRadius: 12, border: "none",
                background: "rgba(255,255,255,0.08)", color: "white",
                fontSize: 14, outline: "none",
              }}
            />
            <button
              onClick={submitEmail}
              disabled={!email.includes("@") || waitlist === "loading"}
              style={{
                padding: "14px 18px", borderRadius: 12, border: "none",
                background: email.includes("@") ? T.accent : "rgba(255,255,255,0.1)",
                color: "white", fontSize: 14, fontWeight: 700,
                cursor: email.includes("@") ? "pointer" : "default",
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
              }}>
              {waitlist === "loading" ? "…" : "Count me in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
const NAV: { id: Tab; label: string; emoji: string }[] = [
  { id: "picks",       label: "Picks",    emoji: "⚽" },
  { id: "results",     label: "Results",  emoji: "📋" },
  { id: "leaderboard", label: "Rankings", emoji: "🏆" },
  { id: "league",      label: "My League",emoji: "👥" },
];

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [tab, setTab]   = useState<Tab>("picks");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sv_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setReady(true);
  }, []);

  function onboard(name: string, avatar: string) {
    const u = { name, avatar };
    localStorage.setItem("sv_user", JSON.stringify(u));
    setUser(u);
  }

  if (!ready) return null;

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
      <div style={{
        position: "relative", display: "flex", flexDirection: "column",
        width: "min(100vw, 430px)", height: "min(100dvh, 932px)",
        background: T.bg, overflow: "hidden",
      }}>
        {!user ? <Onboarding onDone={onboard} /> : (
          <>
            {/* Top bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", background: T.surface, borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: T.accent, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18,
                }}>⚽</div>
                <span style={{ fontSize: 17, fontWeight: 900, color: T.text }}>ScoreVault</span>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 20,
                background: T.accentBg, border: `1px solid ${T.accent}33`,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>WC 2026 · MD1</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
              {tab === "picks"       && <PicksTab user={user} />}
              {tab === "results"     && <ResultsTab />}
              {tab === "leaderboard" && <LeaderboardTab user={user} />}
              {tab === "league"      && <LeagueTab user={user} />}
            </div>

            {/* Bottom nav */}
            <div style={{
              display: "flex", background: T.surface, borderTop: `1px solid ${T.border}`,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}>
              {NAV.map(item => {
                const active = item.id === tab;
                return (
                  <button key={item.id} onClick={() => setTab(item.id)} style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 0 8px", border: "none", background: "transparent",
                    cursor: "pointer", gap: 3,
                    borderTop: `2.5px solid ${active ? T.accent : "transparent"}`,
                    transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.04em", color: active ? T.accent : T.mute,
                    }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
