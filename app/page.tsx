"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

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
type ScoreVal = number | "";
type Tab = "picks" | "results" | "leaderboard" | "league";

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
  { short: "Fri", num: "18", day: 18, today: true },
  { short: "Sat", num: "19", day: 19 },
  { short: "Sun", num: "20", day: 20 },
  { short: "Mon", num: "21", day: 21 },
  { short: "Tue", num: "22", day: 22 },
  { short: "Wed", num: "23", day: 23 },
];

const DAY_LABELS: Record<number, string> = {
  17: "Wednesday 17 June",
  18: "Thursday 18 June",
  19: "Friday 19 June",
  20: "Saturday 20 June",
  21: "Sunday 21 June",
  22: "Monday 22 June",
};

const MOCK_BOARD = [
  { name: "Vianney",   avatar: "🦁", pts: 480, good: 3, exact: 2 },
  { name: "Jules",     avatar: "🐯", pts: 280, good: 2, exact: 1 },
  { name: "Guillaume", avatar: "🦊", pts: 120, good: 1, exact: 0 },
];

const AVATARS = ["⚽", "🦁", "🐯", "🦊", "🐺", "🦅", "🐉", "🦄"];
const LEAGUE_CODE = "SV-2026";

// ─── Circular flag ─────────────────────────────────────────────────────────────
function CircleFlag({ flag, size = 76 }: { flag: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#2C2C2E",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    }}>
      <span style={{ fontSize: size * 0.72, lineHeight: 1, display: "block" }}>{flag}</span>
    </div>
  );
}

// ─── Score input ──────────────────────────────────────────────────────────────
function ScoreInput({ value, onChange }: { value: ScoreVal; onChange: (v: ScoreVal) => void }) {
  const filled = value !== "";
  return (
    <input
      type="text" inputMode="numeric" pattern="[0-9]*"
      value={value === "" ? "" : String(value)}
      onChange={e => {
        const v = e.target.value.replace(/\D/g, "");
        onChange(v === "" ? "" : Math.min(20, parseInt(v) || 0));
      }}
      placeholder="–"
      style={{
        width: 52, height: 52, borderRadius: 10,
        background: filled ? "#3D3420" : M.mute,
        border: `2px solid ${filled ? M.gold : "transparent"}`,
        color: filled ? M.gold : M.sub,
        fontSize: 22, fontWeight: 900, textAlign: "center",
        outline: "none", transition: "all 0.15s",
      }}
    />
  );
}

// ─── Match pick card ──────────────────────────────────────────────────────────
function MatchCard({ match, picks, onPick }: {
  match: Match;
  picks: { home: ScoreVal; away: ScoreVal };
  onPick: (h: ScoreVal, a: ScoreVal) => void;
}) {
  const h = picks.home; const a = picks.away;
  const ptsH = pts(match.home.pct);
  const ptsD = pts(match.draw.pct);
  const ptsA = pts(match.away.pct);

  // Which outcome the user is currently predicting
  let activePts: number | null = null;
  if (h !== "" && a !== "") {
    const hn = Number(h); const an = Number(a);
    activePts = hn > an ? ptsH : an > hn ? ptsA : ptsD;
  }

  return (
    <div style={{ background: M.card, borderBottom: `1px solid ${M.border}` }}>
      {/* Match sub-header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px 4px",
      }}>
        <span style={{ fontSize: 11 }}>🏆</span>
        <span style={{ fontSize: 11, color: M.sub, fontWeight: 500 }}>
          {match.gw} · {match.time}
        </span>
      </div>

      {/* Teams row */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px 16px", gap: 8 }}>
        {/* Home */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <CircleFlag flag={match.home.flag} size={76} />
          <span style={{ fontSize: 13, fontWeight: 600, color: M.text, textAlign: "center", lineHeight: 1.2 }}>
            {match.home.name}
          </span>
        </div>

        {/* Center: inputs + stats */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <ScoreInput value={h} onChange={v => onPick(v, a)} />
            <ScoreInput value={a} onChange={v => onPick(h, v)} />
          </div>

          {/* Points pills: H / D / A */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { val: ptsH, active: h !== "" && a !== "" && Number(h) > Number(a) },
              { val: ptsD, active: h !== "" && a !== "" && Number(h) === Number(a) },
              { val: ptsA, active: h !== "" && a !== "" && Number(h) < Number(a) },
            ].map(({ val, active }, i) => (
              <div key={i} style={{
                padding: "3px 9px", borderRadius: 6,
                background: active ? M.goldBg : M.pill,
                border: `1px solid ${active ? M.gold : "transparent"}`,
                minWidth: 36, textAlign: "center",
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? M.gold : M.sub }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Percentages */}
          <div style={{ display: "flex", gap: 10 }}>
            {[match.home.pct, match.draw.pct, match.away.pct].map((p, i) => (
              <span key={i} style={{ fontSize: 10, color: M.sub, minWidth: 28, textAlign: "center" }}>
                {p}%
              </span>
            ))}
          </div>
        </div>

        {/* Away */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <CircleFlag flag={match.away.flag} size={76} />
          <span style={{ fontSize: 13, fontWeight: 600, color: M.text, textAlign: "center", lineHeight: 1.2 }}>
            {match.away.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Day strip ────────────────────────────────────────────────────────────────
function DayStrip({ selected, onSelect }: { selected: number; onSelect: (d: number) => void }) {
  return (
    <div className="no-scrollbar" style={{
      display: "flex", overflowX: "auto", background: M.bg,
      borderBottom: `1px solid ${M.border}`,
    }}>
      {DAYS.map(({ short, num, day, today }) => {
        const active = day === selected;
        return (
          <button key={day} onClick={() => onSelect(day)} style={{
            flexShrink: 0, display: "flex", flexDirection: "column",
            alignItems: "center", padding: "10px 14px", gap: 2,
            background: active ? M.gold : "transparent",
            border: "none", cursor: "pointer", transition: "background 0.15s",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: "uppercase",
              color: active ? "#000" : M.sub, letterSpacing: "0.03em",
            }}>
              {today && !active ? "Today" : short}
            </span>
            <span style={{
              fontSize: 18, fontWeight: 900, lineHeight: 1,
              color: active ? "#000" : today ? M.gold : M.text,
            }}>{num}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Countdown ───────────────────────────────────────────────────────────────
function Countdown() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const target = new Date("2026-06-18T15:00:00-04:00").getTime();
    const tick = () => setS(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20,
      background: M.mute,
    }}>
      <span style={{ fontSize: 12 }}>🕐</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: M.text, fontVariantNumeric: "tabular-nums" }}>
        {pad(h)} : {pad(m)} : {pad(sc)}
      </span>
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
      <DayStrip selected={day} onSelect={setDay} />

      {/* Countdown + status bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", background: M.bg, borderBottom: `1px solid ${M.border}`,
      }}>
        <Countdown />
        <span style={{ fontSize: 12, color: M.sub, fontWeight: 600 }}>
          {filled} / {dayMatches.length} filled
        </span>
      </div>

      {/* Section header */}
      {dayMatches.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px 8px", background: M.bg,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🏆</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: M.text }}>World Cup 2026</span>
          </div>
          <span style={{ fontSize: 12, color: M.sub }}>{dayMatches.length} games</span>
        </div>
      )}

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", background: M.bg }}>
        {dayMatches.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: 200, gap: 12,
          }}>
            <span style={{ fontSize: 48 }}>⚽</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: M.sub }}>No games today</span>
          </div>
        ) : (
          dayMatches.map(m => (
            <MatchCard key={m.id} match={m}
              picks={picks[m.id] ?? { home: "", away: "" }}
              onPick={(h, a) => setPick(m.id, h, a)} />
          ))
        )}
        <div style={{ height: 80 }} />
      </div>

      {/* Lock button */}
      <div style={{
        position: "absolute", bottom: 64, left: 0, right: 0,
        padding: "12px 16px",
        background: `linear-gradient(to top, ${M.bg} 70%, transparent)`,
      }}>
        <button onClick={save} disabled={filled === 0} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          background: saved ? M.green : filled > 0 ? M.gold : M.mute,
          color: filled > 0 ? "#000" : M.sub,
          fontSize: 15, fontWeight: 800, cursor: filled > 0 ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
          boxShadow: filled > 0 ? `0 4px 24px ${M.gold}60` : "none",
        }}>
          {saved
            ? <><Check size={16} /> Predictions locked!</>
            : filled === dayMatches.length && dayMatches.length > 0
              ? `🔒  Lock all ${filled} predictions`
              : filled > 0
                ? `Lock ${filled} of ${dayMatches.length} predictions`
                : "Enter your predictions above"}
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
      {/* GW nav — MPP style */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px", background: M.bg, borderBottom: `1px solid ${M.border}`,
      }}>
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: "none",
          background: M.mute, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}><ChevronLeft size={16} color={M.text} /></button>

        <div style={{
          flex: 1, padding: "8px 12px", borderRadius: 10, background: M.mute,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: M.text }}>GW.1 / 9</p>
            <p style={{ margin: 0, fontSize: 11, color: M.sub }}>GW.1</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 12, color: M.sub }}>Live</span>
          </div>
        </div>

        <button style={{
          width: 36, height: 36, borderRadius: 10, border: "none",
          background: M.mute, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}><ChevronRight size={16} color={M.text} /></button>
      </div>

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
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: M.bg }}>
      {/* GW nav */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px", borderBottom: `1px solid ${M.border}`,
      }}>
        <button style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: M.mute, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={16} color={M.text} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: M.text }}>GameWeek 1 / 9</p>
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: M.mute, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronRight size={16} color={M.text} />
        </button>
      </div>

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
        {MOCK_BOARD.map((p, i) => {
          const isMe = p.name === user.name;
          return (
            <div key={p.name} style={{
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
              <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.good}</span>
              <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.exact}</span>
              <span style={{ width: 60, textAlign: "right", fontSize: 18, fontWeight: 900, color: M.gold }}>{p.pts}</span>
            </div>
          );
        })}

        {/* Join the challenge button — MPP style */}
        <div style={{ padding: "20px 16px" }}>
          <button style={{
            width: "100%", padding: "18px", borderRadius: 14, border: "none",
            background: M.gold, color: "#000",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Join the challenge
          </button>
        </div>
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
          <span style={{ fontSize: 12, color: M.text, fontWeight: 600 }}>{MOCK_BOARD.length}</span>
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
            {/* GW nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: M.text }}>GameWeek 1 / 9</span>
            </div>

            {/* Table */}
            <div style={{ borderTop: `1px solid ${M.border}` }}>
              <div style={{ display: "flex", padding: "8px 16px", borderBottom: `1px solid ${M.border}` }}>
                <span style={{ flex: 1, fontSize: 11, color: M.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>Players</span>
                <span style={{ width: 48, textAlign: "center", fontSize: 11, color: M.sub, textTransform: "uppercase" }}>Good</span>
                <span style={{ width: 48, textAlign: "center", fontSize: 11, color: M.sub, textTransform: "uppercase" }}>Exacts</span>
                <span style={{ width: 56, textAlign: "right", fontSize: 11, color: M.gold, textTransform: "uppercase" }}>Points</span>
              </div>
              {MOCK_BOARD.map((p, i) => {
                const isMe = p.name === user.name;
                return (
                  <div key={p.name} style={{
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
                    <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.good}</span>
                    <span style={{ width: 48, textAlign: "center", fontSize: 13, color: M.sub }}>{p.exact}</span>
                    <span style={{ width: 56, textAlign: "right", fontSize: 17, fontWeight: 900, color: M.gold }}>{p.pts}</span>
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

            {/* Love money CTA */}
            <div style={{
              marginTop: 24, padding: "20px", borderRadius: 16,
              background: "#1A1506", border: `1px solid ${M.gold}33`,
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: M.text }}>
                🏟️ 2 spots at the NYC Final
              </p>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: M.sub, lineHeight: 1.6 }}>
                Real money leagues dropping soon. Winner takes the pot.
              </p>
              {waitlist === "done" ? (
                <div style={{ padding: "14px", borderRadius: 12, background: "#0D1F0D", textAlign: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: M.green }}>
                    ✓ You&apos;re on the list
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email" placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitEmail()}
                    style={{
                      flex: 1, padding: "13px 14px", borderRadius: 12,
                      background: M.mute, border: "none", color: M.text,
                      fontSize: 14, outline: "none",
                    }}
                  />
                  <button onClick={submitEmail} disabled={!email.includes("@") || waitlist === "loading"} style={{
                    padding: "13px 16px", borderRadius: 12, border: "none",
                    background: email.includes("@") ? M.gold : M.mute,
                    color: email.includes("@") ? "#000" : M.sub,
                    fontSize: 14, fontWeight: 700,
                    cursor: email.includes("@") ? "pointer" : "default",
                    whiteSpace: "nowrap",
                  }}>
                    {waitlist === "loading" ? "…" : "Count me in"}
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

// ─── Bottom nav ───────────────────────────────────────────────────────────────
const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "picks",       label: "Predictions", icon: "1:1" },
  { id: "results",     label: "Results",     icon: "⚽" },
  { id: "leaderboard", label: "Ranking",     icon: "🏆" },
  { id: "league",      label: "My leagues",  icon: "👥" },
];

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [tab, setTab]   = useState<Tab>("picks");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("sv_user");
      if (s) setUser(JSON.parse(s));
    } catch {}
    setReady(true);
  }, []);

  function onboard(name: string, avatar: string) {
    const u = { name, avatar };
    localStorage.setItem("sv_user", JSON.stringify(u));
    setUser(u);
  }

  if (!ready) return null;

  const TAB_TITLES: Record<Tab, string> = {
    picks: "MY PREDICTIONS",
    results: "RESULTS",
    leaderboard: "STANDINGS",
    league: "MY LEAGUES",
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <div style={{
        position: "relative", display: "flex", flexDirection: "column",
        width: "min(100vw, 430px)", height: "min(100dvh, 932px)",
        background: M.bg, overflow: "hidden",
      }}>
        {!user ? <Onboarding onDone={onboard} /> : (
          <>
            {/* Top bar — MPP style */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", background: M.bg,
              borderBottom: `1px solid ${M.border}`,
            }}>
              <div style={{ width: 40 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: M.gold, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18,
                }}>⚽</div>
              </div>
              <span style={{
                fontSize: 15, fontWeight: 900, color: M.text,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>{TAB_TITLES[tab]}</span>
              <div style={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: M.mute, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20,
                }}>{user.avatar}</div>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0, position: "relative" }}>
              {tab === "picks"       && <PicksTab user={user} />}
              {tab === "results"     && <ResultsTab />}
              {tab === "leaderboard" && <RankingTab user={user} />}
              {tab === "league"      && <LeagueTab user={user} />}
            </div>

            {/* Bottom nav — MPP gold bar */}
            <div style={{
              display: "flex", background: M.nav,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}>
              {NAV.map(item => {
                const active = item.id === tab;
                return (
                  <button key={item.id} onClick={() => setTab(item.id)} style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 0 8px", border: "none",
                    background: active ? "rgba(0,0,0,0.2)" : "transparent",
                    cursor: "pointer", gap: 3,
                  }}>
                    <span style={{ fontSize: item.icon === "1:1" ? 11 : 20, fontWeight: item.icon === "1:1" ? 900 : 400, color: "#FFF", lineHeight: 1 }}>
                      {item.icon}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: active ? 700 : 500,
                      color: active ? "#FFF" : "rgba(255,255,255,0.65)",
                      textTransform: "capitalize", letterSpacing: "0.01em",
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
