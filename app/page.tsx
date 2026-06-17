"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Trophy, Users, Calendar, Clock,
  Check, Star, TrendingUp, TrendingDown, ArrowRight,
  Zap, Shield, BarChart3, Home as HomeIcon, Target, List,
  Lock, Cpu, Eye, DollarSign,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const MY_NAME = "Jake";

const LEAGUE = {
  name: "NYC World Cup Crew",
  pool: 200,
  entry: 20,
  playerCount: 10,
  totalMatches: 46,
  doneMatches: 18,
  myRank: 2,
  myPts: 1720,
};

const PLAYERS = [
  { rank: 1,  name: "Tyler",  pts: 1840, trend: "+12", isMe: false },
  { rank: 2,  name: "Jake",   pts: 1720, trend: "+8",  isMe: true  },
  { rank: 3,  name: "Sarah",  pts: 1610, trend: "+5",  isMe: false },
  { rank: 4,  name: "Mike",   pts: 1420, trend: "-2",  isMe: false },
  { rank: 5,  name: "Emma",   pts: 1350, trend: "-4",  isMe: false },
  { rank: 6,  name: "Chris",  pts: 1180, trend: "-6",  isMe: false },
  { rank: 7,  name: "Zara",   pts: 1050, trend: "-3",  isMe: false },
  { rank: 8,  name: "Marcus", pts:  890, trend: "-8",  isMe: false },
  { rank: 9,  name: "Lily",   pts:  740, trend: "-2",  isMe: false },
  { rank: 10, name: "Kai",    pts:  610, trend: "-11", isMe: false },
];

const UPCOMING_MATCHES = [
  {
    id: 1,
    home: { name: "France",    flag: "🇫🇷" },
    away: { name: "Argentina", flag: "🇦🇷" },
    date: "Sat Jun 28", time: "9:00 PM",
    phase: "Round of 16",
    deadline: "Sat Jun 28 · 8:45 PM",
  },
  {
    id: 2,
    home: { name: "Brazil",  flag: "🇧🇷" },
    away: { name: "Germany", flag: "🇩🇪" },
    date: "Sun Jun 29", time: "6:00 PM",
    phase: "Round of 16",
    deadline: "Sun Jun 29 · 5:45 PM",
  },
  {
    id: 3,
    home: { name: "Spain",   flag: "🇪🇸" },
    away: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    date: "Mon Jun 30", time: "9:00 PM",
    phase: "Round of 16",
    deadline: "Mon Jun 30 · 8:45 PM",
  },
];

const PAST_MATCHES = [
  {
    id: 10,
    home: { name: "France",  flag: "🇫🇷", score: 2 },
    away: { name: "Belgium", flag: "🇧🇪", score: 1 },
    myPred: { home: 2, away: 0 },
    pts: 130, date: "Jun 12",
  },
  {
    id: 11,
    home: { name: "Argentina", flag: "🇦🇷", score: 2 },
    away: { name: "Poland",    flag: "🇵🇱", score: 1 },
    myPred: { home: 2, away: 1 },
    pts: 200, date: "Jun 13",
  },
  {
    id: 12,
    home: { name: "Spain",       flag: "🇪🇸", score: 3 },
    away: { name: "Switzerland", flag: "🇨🇭", score: 0 },
    myPred: { home: 2, away: 0 },
    pts: 80, date: "Jun 14",
  },
  {
    id: 13,
    home: { name: "Brazil", flag: "🇧🇷", score: 1 },
    away: { name: "Mexico", flag: "🇲🇽", score: 1 },
    myPred: { home: 2, away: 0 },
    pts: 0, date: "Jun 16",
  },
];

// ─── Utils ─────────────────────────────────────────────────────────────────────

function ptColor(pts: number) {
  if (pts >= 150) return "#10b981";
  if (pts >= 80)  return "#60a5fa";
  if (pts > 0)    return "#f59e0b";
  return "#475569";
}

function avatarColor(name: string) {
  const palette = ["#3b82f6","#8b5cf6","#ec4899","#10b981","#f59e0b","#06b6d4","#ef4444","#84cc16"];
  return palette[name.charCodeAt(0) % palette.length];
}

// ─── Primitives ────────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase"
      style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
      {children}
    </span>
  );
}

function Avatar({ name, isMe = false }: { name: string; isMe?: boolean }) {
  const c = avatarColor(name);
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
      style={{ background: `${c}22`, color: c, border: `2px solid ${isMe ? c : "transparent"}` }}>
      {name[0]}
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => scrollY.on("change", v => setScrolled(v > 40)), [scrollY]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3.5 flex items-center justify-between transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,8,16,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.2)" }}>
          <Zap size={13} style={{ color: "#60a5fa" }} />
        </div>
        <span className="font-bold text-sm tracking-tight">ScoreVault</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
          TESTNET
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs hidden sm:block" style={{ color: "#475569" }}>
          ⚽ FIFA World Cup 2026
        </span>
        <a href="#app"
          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 hover:-translate-y-px"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "white" }}>
          Try the demo
        </a>
      </div>
    </motion.nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.7) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />
      <motion.div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)" }} />
      <motion.div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)" }} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-5">
          <Tag>⚽ FIFA World Cup 2026 · On-chain beta</Tag>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.06] tracking-tight mb-6">
          The friend league<br />
          <span className="gradient-text">that runs itself.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed"
          style={{ color: "#94a3b8" }}>
          Score predictions. Prize pool locked on-chain. Payouts automatic.
          <strong style={{ color: "#f1f5f9" }}> No commissioner. No Venmo. No trust required.</strong>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-sm max-w-xl mx-auto mb-10"
          style={{ color: "#475569" }}>
          Think March Madness bracket pool — except a smart contract holds the money, calculates every score,
          and distributes winnings the moment the final whistle blows. Zero human intervention.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#app"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            Try the demo <ArrowRight size={15} />
          </a>
          <a href="#onchain"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
            Why on-chain?
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[
            { val: "$200",  label: "Avg prize pool"   },
            { val: "10",    label: "Friends per league" },
            { val: "100%",  label: "Automated"          },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: "#60a5fa" }}>{val}</div>
              <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-1" style={{ color: "#334155" }}>
          <div className="w-px h-7 bg-gradient-to-b from-transparent to-current" />
          <div className="text-[10px] tracking-widest uppercase">Scroll</div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Why On-Chain ──────────────────────────────────────────────────────────────

function OnChain() {
  const PILLARS = [
    {
      icon: Lock,
      color: "#3b82f6",
      title: "No one holds the money",
      body: "Every ESPN bracket pool has the same problem: someone has to hold the cash. That someone can lose it, forget to pay out, or just disappear. With ScoreVault, funds are locked in a smart contract the moment the league starts. Nobody — including us — can touch them.",
    },
    {
      icon: Cpu,
      color: "#8b5cf6",
      title: "Scores calculated on-chain",
      body: "No black box, no dispute with the commissioner. The scoring formula lives in code, deployed on-chain, publicly readable. When a match ends, an oracle posts the official result and the contract runs the math. Immutable, verifiable, final.",
    },
    {
      icon: DollarSign,
      color: "#10b981",
      title: "Payouts are automatic",
      body: "When the tournament ends, the contract distributes. No waiting on Venmo requests. No chasing the group chat. No one needs to 'do the math.' The smart contract already did — proportionally to every player's accuracy across all matches.",
    },
    {
      icon: Eye,
      color: "#06b6d4",
      title: "Play with anyone",
      body: "Because trust is replaced by code, you're not limited to your inner circle. City-wide leagues, workplace competitions, Twitter communities — anyone can join without anyone needing to vouch for the prize manager. The contract is the referee.",
    },
  ];

  return (
    <section id="onchain" className="py-24 px-6" style={{ background: "rgba(13,17,23,0.6)" }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-16">
          <Tag>Why on-chain</Tag>
          <h2 className="mt-5 text-4xl font-bold leading-tight">
            Zero human intervention.<br />
            <span className="gradient-text">From deposit to payout.</span>
          </h2>
          <p className="mt-4 text-base max-w-2xl mx-auto" style={{ color: "#64748b" }}>
            Blockchain isn't the product. It's the infrastructure that makes the product trustless.
            Here's what that means in practice.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4">
          {PILLARS.map(({ icon: Icon, color, title, body }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="glass rounded-2xl p-6 h-full glow-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="font-bold text-base mb-2">{title}</div>
                <div className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{body}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4} className="mt-8">
          <div className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <Shield size={16} style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: "#10b981" }}>
                Currently running on testnet
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                ScoreVault is in open beta on Ethereum testnet — no real funds at risk.
                We're stress-testing the contracts, the oracle integration, and the scoring engine
                before a mainnet launch. All the mechanics are live. The money isn't real yet.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── App Demo ──────────────────────────────────────────────────────────────────

type Tab = "league" | "predictions" | "leaderboard";

function LeagueHeader() {
  const pct = (LEAGUE.doneMatches / LEAGUE.totalMatches) * 100;
  return (
    <div className="rounded-2xl p-4 mb-4"
      style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(6,182,212,0.07))", border: "1px solid rgba(59,130,246,0.2)" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Trophy size={13} style={{ color: "#f59e0b" }} />
            <span className="font-bold text-sm">{LEAGUE.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#64748b" }}>
            <Lock size={9} style={{ color: "#10b981" }} />
            <span style={{ color: "#10b981" }}>On-chain · </span>
            ⚽ FIFA World Cup 2026
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color: "#10b981" }}>${LEAGUE.pool}</div>
          <div className="text-[10px]" style={{ color: "#475569" }}>locked in contract</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: "#475569" }}>
            <span>{LEAGUE.doneMatches} matches played</span>
            <span>{LEAGUE.totalMatches - LEAGUE.doneMatches} remaining</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #3b82f6, #06b6d4)" }} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
          <Users size={10} /> {LEAGUE.playerCount} players
        </div>
      </div>
    </div>
  );
}

// ── Tab: My League ─────────────────────────────────────────────────────────────

function TabLeague({ onGoPredict }: { onGoPredict: () => void }) {
  const totalSq = PLAYERS.reduce((a, p) => a + p.pts * p.pts, 0);
  const myEst = Math.round((LEAGUE.pool * LEAGUE.myPts * LEAGUE.myPts) / totalSq);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "My rank",     val: `#${LEAGUE.myRank}`,           color: "#f59e0b", Icon: Trophy       },
          { label: "My points",   val: LEAGUE.myPts.toLocaleString(), color: "#60a5fa", Icon: Star         },
          { label: "Est. payout", val: `~$${myEst}`,                  color: "#10b981", Icon: DollarSign   },
        ].map(({ label, val, color, Icon }) => (
          <div key={label} className="glass rounded-xl p-3 text-center">
            <Icon size={13} style={{ color }} className="mx-auto mb-1.5" />
            <div className="font-bold text-sm" style={{ color }}>{val}</div>
            <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-1.5 mb-3 text-[11px] font-semibold" style={{ color: "#475569" }}>
          <BarChart3 size={11} /> Recent matches
        </div>
        <div className="space-y-1.5">
          {PAST_MATCHES.slice(0, 3).map(m => {
            const exact = m.myPred.home === m.home.score && m.myPred.away === m.away.score;
            const goodOutcome = (m.myPred.home > m.myPred.away) === (m.home.score > m.away.score)
              && (m.myPred.home !== m.myPred.away || m.home.score === m.away.score);
            return (
              <div key={m.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[11px] w-12 flex-shrink-0" style={{ color: "#475569" }}>{m.date}</span>
                <div className="flex-1 flex items-center justify-center gap-2 text-sm">
                  <span>{m.home.flag}</span>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    {m.home.score} – {m.away.score}
                  </span>
                  <span>{m.away.flag}</span>
                </div>
                <span className="text-[11px] flex-shrink-0" style={{ color: "#475569" }}>
                  Pick: {m.myPred.home}-{m.myPred.away}
                </span>
                <div className="w-16 text-right flex-shrink-0">
                  <div className="font-mono font-bold text-xs" style={{ color: ptColor(m.pts) }}>
                    {m.pts > 0 ? `+${m.pts}` : "0"} pts
                  </div>
                  <div className="text-[9px]"
                    style={{ color: exact ? "#10b981" : goodOutcome ? "#60a5fa" : "#475569" }}>
                    {exact ? "Exact!" : goodOutcome ? "Good call" : "Missed"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-xl p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] mb-1" style={{ color: "#64748b" }}>Next pick due</div>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <span>🇫🇷</span> France vs Argentina <span>🇦🇷</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: "#f59e0b" }}>
            <Clock size={9} /> Locks: Sat Jun 28 · 8:45 PM
          </div>
        </div>
        <motion.button onClick={onGoPredict}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-xl text-xs font-semibold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "white" }}>
          Pick now →
        </motion.button>
      </div>
    </div>
  );
}

// ── Match Card ─────────────────────────────────────────────────────────────────

function MatchCard({
  match,
  submitted,
  onSubmit,
}: {
  match: typeof UPCOMING_MATCHES[0];
  submitted: { home: number; away: number } | null;
  onSubmit: (pred: { home: number; away: number }) => void;
}) {
  const [home, setHome] = useState(1);
  const [away, setAway] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onSubmit({ home, away }); }, 800);
  };

  return (
    <div className="glass rounded-2xl p-5"
      style={{ border: `1px solid ${submitted ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}` }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
          {match.phase}
        </span>
        <div className="flex items-center gap-1 text-[11px]" style={{ color: "#475569" }}>
          <Calendar size={10} /> {match.date} · {match.time}
        </div>
      </div>

      <div className="flex items-center gap-4 my-5">
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1.5">{match.home.flag}</div>
          <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>{match.home.name}</div>
        </div>

        {submitted ? (
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-2xl" style={{ color: "#10b981" }}>{submitted.home}</span>
            <span style={{ color: "#334155" }}>–</span>
            <span className="font-mono font-bold text-2xl" style={{ color: "#10b981" }}>{submitted.away}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setHome(h => h + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}>+</button>
              <span className="font-mono font-bold text-2xl w-8 text-center" style={{ color: "#60a5fa" }}>{home}</span>
              <button onClick={() => setHome(h => Math.max(0, h - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}>–</button>
            </div>
            <span className="font-bold text-xl" style={{ color: "#334155" }}>–</span>
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setAway(a => a + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}>+</button>
              <span className="font-mono font-bold text-2xl w-8 text-center" style={{ color: "#60a5fa" }}>{away}</span>
              <button onClick={() => setAway(a => Math.max(0, a - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}>–</button>
            </div>
          </div>
        )}

        <div className="flex-1 text-center">
          <div className="text-3xl mb-1.5">{match.away.flag}</div>
          <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>{match.away.name}</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] mb-3" style={{ color: "#f59e0b" }}>
        <Clock size={9} /> Locks: {match.deadline}
      </div>

      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
          <Check size={14} /> Pick submitted on-chain
        </motion.div>
      ) : (
        <motion.button onClick={handleSubmit} disabled={loading} whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "white", opacity: loading ? 0.8 : 1 }}>
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
              Submitting...
            </>
          ) : "Lock in my pick"}
        </motion.button>
      )}
    </div>
  );
}

// ── Tab: Predictions ───────────────────────────────────────────────────────────

function TabPredictions() {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const [submitted, setSubmitted] = useState<Record<number, { home: number; away: number }>>({});
  const remaining = UPCOMING_MATCHES.filter(m => !submitted[m.id]).length;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["upcoming", "past"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: view === v ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${view === v ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.06)"}`,
              color: view === v ? "#60a5fa" : "#475569",
            }}>
            {v === "upcoming"
              ? `Upcoming${remaining > 0 ? ` · ${remaining} to pick` : " · All done ✓"}`
              : `Results (${PAST_MATCHES.length})`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "upcoming" ? (
          <motion.div key="upcoming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {UPCOMING_MATCHES.map(m => (
              <MatchCard key={m.id} match={m}
                submitted={submitted[m.id] ?? null}
                onSubmit={pred => setSubmitted(s => ({ ...s, [m.id]: pred }))} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-2">
            {PAST_MATCHES.map(m => {
              const exact = m.myPred.home === m.home.score && m.myPred.away === m.away.score;
              const goodOutcome = (m.myPred.home > m.myPred.away) === (m.home.score > m.away.score)
                && (m.myPred.home !== m.myPred.away || m.home.score === m.away.score);
              return (
                <div key={m.id} className="glass rounded-xl p-4 flex items-center gap-3">
                  <span className="text-[11px] w-12 flex-shrink-0" style={{ color: "#475569" }}>{m.date}</span>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <span className="text-xl">{m.home.flag}</span>
                    <div className="text-center">
                      <div className="font-mono font-bold">{m.home.score} – {m.away.score}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
                        Pick: {m.myPred.home}-{m.myPred.away}
                      </div>
                    </div>
                    <span className="text-xl">{m.away.flag}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-sm" style={{ color: ptColor(m.pts) }}>
                      {m.pts > 0 ? `+${m.pts}` : "0"} pts
                    </div>
                    <div className="text-[10px] mt-0.5"
                      style={{ color: exact ? "#10b981" : goodOutcome ? "#60a5fa" : "#475569" }}>
                      {exact ? "Exact!" : goodOutcome ? "Good call" : "Missed"}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab: Leaderboard ───────────────────────────────────────────────────────────

function TabLeaderboard() {
  const totalSq = PLAYERS.reduce((a, p) => a + p.pts * p.pts, 0);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span className="text-xs font-semibold" style={{ color: "#475569" }}>Leaderboard</span>
        <span className="text-xs font-mono font-bold flex items-center gap-1" style={{ color: "#10b981" }}>
          <Lock size={9} /> ${LEAGUE.pool} locked
        </span>
      </div>
      <div>
        {PLAYERS.map((p, i) => {
          const est = Math.round((LEAGUE.pool * p.pts * p.pts) / totalSq);
          const medal = p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank - 1] : null;
          return (
            <motion.div key={p.name}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: p.isMe ? "rgba(59,130,246,0.06)" : "transparent",
                borderBottom: i < PLAYERS.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
              }}>
              <div className="w-6 text-center flex-shrink-0">
                {medal
                  ? <span className="text-sm">{medal}</span>
                  : <span className="text-xs font-bold" style={{ color: "#334155" }}>{p.rank}</span>}
              </div>
              <Avatar name={p.name} isMe={p.isMe} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {p.name}
                  {p.isMe && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
                      you
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono mt-0.5" style={{ color: "#475569" }}>
                  {p.pts.toLocaleString()} pts
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-mono font-bold" style={{ color: est > 0 ? "#10b981" : "#334155" }}>
                  {est > 0 ? `~$${est}` : "—"}
                </div>
                <div className="text-[10px] mt-0.5 flex items-center justify-end gap-0.5"
                  style={{ color: p.trend.startsWith("+") ? "#10b981" : "#ef4444" }}>
                  {p.trend.startsWith("+") ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {p.trend}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 text-[10px]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#334155" }}>
        Est. payouts · score² distribution · recalculated after every match · auto-distributed at final whistle
      </div>
    </div>
  );
}

// ── App Container ──────────────────────────────────────────────────────────────

function AppDemo() {
  const [tab, setTab] = useState<Tab>("league");

  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "league",      label: "My League",   Icon: HomeIcon },
    { id: "predictions", label: "Predictions", Icon: Target   },
    { id: "leaderboard", label: "Leaderboard", Icon: List     },
  ];

  return (
    <section id="app" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-10">
          <Tag>Live demo</Tag>
          <h2 className="mt-5 text-4xl font-bold">See how it plays.</h2>
          <p className="mt-3 text-base" style={{ color: "#64748b" }}>
            Mock league · 10 players · $200 prize pool · World Cup 2026
          </p>
        </Reveal>

        <div className="rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,12,22,0.8)" }}>
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.2)" }}>
                  <Zap size={11} style={{ color: "#60a5fa" }} />
                </div>
                <span className="font-bold text-sm">ScoreVault</span>
              </div>
              <Avatar name={MY_NAME} isMe />
            </div>

            <LeagueHeader />

            <div className="flex gap-1 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: tab === id ? "rgba(59,130,246,0.15)" : "transparent",
                    color: tab === id ? "#60a5fa" : "#475569",
                    border: tab === id ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                  }}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}>
                {tab === "league"      && <TabLeague onGoPredict={() => setTab("predictions")} />}
                {tab === "predictions" && <TabPredictions />}
                {tab === "leaderboard" && <TabLeaderboard />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      emoji: "👥",
      title: "1. Create your league",
      desc: "Name your league, set the entry fee, invite friends with a code. Funds are locked in a smart contract the moment everyone's in.",
      color: "#3b82f6",
    },
    {
      emoji: "⚽",
      title: "2. Pick the scores",
      desc: "Before every match, submit your predicted scoreline. Picks lock automatically 15 minutes before kickoff. No late changes.",
      color: "#8b5cf6",
    },
    {
      emoji: "🏆",
      title: "3. Contract pays out",
      desc: "When the tournament ends, the smart contract distributes the prize pool proportionally to accuracy — with no one in the middle.",
      color: "#10b981",
    },
  ];

  return (
    <section id="how" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-12">
          <Tag>How it works</Tag>
          <h2 className="mt-5 text-4xl font-bold">
            Three steps.<br />
            <span className="gradient-text">Then it runs itself.</span>
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="glass rounded-2xl p-6 h-full glow-card">
                <div className="text-3xl mb-4">{s.emoji}</div>
                <div className="font-bold mb-2 text-sm" style={{ color: s.color }}>{s.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35} className="mt-6">
          <div className="rounded-2xl p-5"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="flex items-start gap-3">
              <Shield size={15} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                <span style={{ color: "#60a5fa", fontWeight: 600 }}>Scoring:</span>{" "}
                Exact score → <strong style={{ color: "#f1f5f9" }}>200 pts</strong> ·
                Right outcome + correct margin → <strong style={{ color: "#f1f5f9" }}>150 pts</strong> ·
                Right outcome → <strong style={{ color: "#f1f5f9" }}>130 pts</strong>.
                {" "}Prize pool distributes proportionally to score² — you're in the race until the final whistle.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-12 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-sm mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.15)" }}>
            <Zap size={11} style={{ color: "#60a5fa" }} />
          </div>
          <span className="font-bold text-sm">ScoreVault</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
            TESTNET
          </span>
        </div>
        <p className="text-xs" style={{ color: "#334155" }}>
          Open beta · Ethereum testnet · No real funds · FIFA World Cup 2026
        </p>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <OnChain />
      <AppDemo />
      <HowItWorks />
      <Footer />
    </main>
  );
}
