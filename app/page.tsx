"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Trophy,
  Users,
} from "lucide-react";

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

interface OddsResponse {
  live: boolean;
  home?: number | null;
  draw?: number | null;
  away?: number | null;
  source?: "polymarket";
}

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

function useMatchOdds(matchId: string) {
  return useQuery({
    queryKey: ["match-odds", matchId],
    queryFn: async () => {
      const response = await fetch(`/api/odds?match=${encodeURIComponent(matchId)}`);
      if (!response.ok) return { live: false } satisfies OddsResponse;
      return response.json() as Promise<OddsResponse>;
    },
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
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
    <div className="sv-flag" style={{ width: size, height: size }}>
      <span style={{ fontSize: size * 0.72, lineHeight: 1, display: "block" }}>{flag}</span>
    </div>
  );
}

// ─── Score input ──────────────────────────────────────────────────────────────
function ScoreInput({ value, onChange }: { value: ScoreVal; onChange: (v: ScoreVal) => void }) {
  const filled = value !== "";
  return (
    <input
      aria-label="Predicted score"
      className={`sv-score-input${filled ? " is-filled" : ""}`}
      type="text" inputMode="numeric" pattern="[0-9]*"
      value={value === "" ? "" : String(value)}
      onChange={e => {
        const v = e.target.value.replace(/\D/g, "");
        onChange(v === "" ? "" : Math.min(20, parseInt(v) || 0));
      }}
      placeholder="–"
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
  const oddsQuery = useMatchOdds(match.id);
  const liveOdds = oddsQuery.data?.live ? oddsQuery.data : null;
  const homePct = liveOdds?.home ?? match.home.pct;
  const drawPct = liveOdds?.draw ?? match.draw.pct;
  const awayPct = liveOdds?.away ?? match.away.pct;
  const favoritePct = Math.max(homePct, drawPct, awayPct);

  return (
    <article className="sv-match-card">
      <div className="sv-match-meta">
        <span className="sv-competition-dot">🏆</span>
        <span>{match.gw}</span>
        <span className="sv-meta-separator">·</span>
        <span>{match.time}</span>
        <span className={`sv-market-status${liveOdds ? " is-live" : ""}`}>
          <i />
          {liveOdds ? "Polymarket live" : oddsQuery.isFetching ? "Updating odds" : "Market estimate"}
        </span>
      </div>

      <div className="sv-match-main">
        <div className="sv-team">
          <CircleFlag flag={match.home.flag} size={76} />
          <span className="sv-team-name">{match.home.name}</span>
        </div>

        <div className="sv-pick-center">
          <div className="sv-score-fields">
            <ScoreInput value={h} onChange={v => onPick(v, a)} />
            <ScoreInput value={a} onChange={v => onPick(h, v)} />
          </div>

          <div className="sv-odds-grid">
            {[
              { label: "1", pct: homePct, active: h !== "" && a !== "" && Number(h) > Number(a) },
              { label: "X", pct: drawPct, active: h !== "" && a !== "" && Number(h) === Number(a) },
              { label: "2", pct: awayPct, active: h !== "" && a !== "" && Number(h) < Number(a) },
            ].map(({ label, pct, active }) => (
              <div
                key={label}
                className={`sv-odd ${pct === favoritePct ? "is-favorite" : "is-underdog"}${active ? " is-active" : ""}`}
              >
                <span className="sv-odd-label">{label}</span>
                <span className="sv-odd-value">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sv-team">
          <CircleFlag flag={match.away.flag} size={76} />
          <span className="sv-team-name">{match.away.name}</span>
        </div>
      </div>
    </article>
  );
}

// ─── Day strip ────────────────────────────────────────────────────────────────
function DayStrip({ selected, onSelect }: { selected: number; onSelect: (d: number) => void }) {
  return (
    <div className="sv-day-strip no-scrollbar">
      {DAYS.map(({ short, num, day, today }) => {
        const active = day === selected;
        return (
          <button
            className={`sv-day${active ? " is-active" : ""}`}
            key={day}
            onClick={() => onSelect(day)}
          >
            <span>{today ? "Tod." : short}</span>
            <strong>{num}</strong>
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
    <div className="sv-countdown">
      <span className="sv-clock">◷</span>
      <span>{pad(h)} : {pad(m)} : {pad(sc)}</span>
    </div>
  );
}

// ─── Picks tab ────────────────────────────────────────────────────────────────
function PicksTab() {
  const [day, setDay] = useState(18);
  const [picks, setPicks] = useState<Record<string, { home: ScoreVal; away: ScoreVal }>>({});
  const [saved, setSaved] = useState(false);
  const [showStats, setShowStats] = useState(true);

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
    <div className="sv-picks-screen">
      <DayStrip selected={day} onSelect={setDay} />

      <div className="sv-picks-tools">
        <Countdown />
        <label className="sv-toggle-label">
          Show stats
          <button
            aria-label="Toggle prediction statistics"
            aria-pressed={showStats}
            className={`sv-toggle${showStats ? " is-on" : ""}`}
            onClick={() => setShowStats(value => !value)}
          >
            <span><Check size={14} /></span>
          </button>
        </label>
      </div>

      {dayMatches.length > 0 && (
        <div className="sv-date-heading">
          <span>Thursday {day} June</span>
          <strong>{filled} / {dayMatches.length}</strong>
        </div>
      )}

      <div className={`sv-match-list no-scrollbar${showStats ? "" : " hide-stats"}`}>
        {dayMatches.length === 0 ? (
          <div className="sv-empty-state">
            <span style={{ fontSize: 48 }}>⚽</span>
            <strong>No games today</strong>
          </div>
        ) : (
          dayMatches.map(m => (
            <MatchCard key={m.id} match={m}
              picks={picks[m.id] ?? { home: "", away: "" }}
              onPick={(h, a) => setPick(m.id, h, a)} />
          ))
        )}
        <div className="sv-list-spacer" />
      </div>

      <div className="sv-lock-dock">
        <button
          className={`sv-lock-button${saved ? " is-saved" : ""}`}
          onClick={save}
          disabled={filled === 0}
        >
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

// ─── Bottom nav ───────────────────────────────────────────────────────────────
const NAV: { id: Tab; label: string }[] = [
  { id: "picks",       label: "Predictions" },
  { id: "results",     label: "Results" },
  { id: "leaderboard", label: "Ranking" },
  { id: "league",      label: "My leagues" },
];

function NavIcon({ tab }: { tab: Tab }) {
  if (tab === "picks") return <span className="sv-score-icon">1:1</span>;
  if (tab === "results") return <span className="sv-ball-icon">⚽</span>;
  if (tab === "leaderboard") return <Trophy size={23} />;
  return <Users size={24} />;
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);
  const [tab, setTab]   = useState<Tab>("picks");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const savedUser = localStorage.getItem("sv_user");
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {}
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
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
    league: "MY LEAGUES & CHALLENGES",
  };

  return (
    <div className="sv-viewport">
      <div className="sv-app-shell">
        {!user ? <Onboarding onDone={onboard} /> : (
          <>
            <header className="sv-topbar">
              <div className="sv-brand-switcher">
                <div className="sv-brand-coin">SV</div>
                <span>BASE</span>
              </div>
              <h1>{TAB_TITLES[tab]}</h1>
              <div aria-hidden="true" />
            </header>

            <main className="sv-content">
              {tab === "picks"       && <PicksTab />}
              {tab === "results"     && <ResultsTab />}
              {tab === "leaderboard" && <RankingTab user={user} />}
              {tab === "league"      && <LeagueTab user={user} />}
            </main>

            <nav className="sv-bottom-nav">
              {NAV.map(item => {
                const active = item.id === tab;
                return (
                  <button
                    className={active ? "is-active" : ""}
                    key={item.id}
                    onClick={() => setTab(item.id)}
                  >
                    <NavIcon tab={item.id} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
