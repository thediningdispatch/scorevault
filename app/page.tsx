"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Trophy, Lock, Eye, BarChart3, ChevronRight,
  Users, DollarSign, GitMerge, Hash, Cpu, Award,
  ArrowRight, Check, AlertCircle
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  { icon: Users, label: "Create League", color: "#3b82f6", desc: "Set entry fee, max players, competition" },
  { icon: DollarSign, label: "Deposit USDC", color: "#8b5cf6", desc: "Funds locked in smart contract vault" },
  { icon: Hash, label: "Commit Prediction", color: "#06b6d4", desc: "Submit keccak256 hash — nobody sees your pick" },
  { icon: Eye, label: "Reveal Score", color: "#10b981", desc: "Post-deadline: reveal your secret + score" },
  { icon: Cpu, label: "Oracle Resolution", color: "#f59e0b", desc: "Official result confirmed on-chain" },
  { icon: Award, label: "Final Payout", color: "#ec4899", desc: "Algorithmic distribution by score²" },
];

const LEADERBOARD = [
  { rank: 1, name: "Vianney", pts: 1840, payout: 310, trend: "+12" },
  { rank: 2, name: "Jules", pts: 1720, payout: 270, trend: "+8" },
  { rank: 3, name: "Chloé", pts: 1610, payout: 220, trend: "+5" },
  { rank: 4, name: "Alex", pts: 1420, payout: 160, trend: "-2" },
  { rank: 5, name: "Paul", pts: 1210, payout: 90, trend: "-4" },
];

const CONTRACTS = [
  { name: "LeagueFactory", desc: "Deploys new league vaults with custom params", color: "#3b82f6" },
  { name: "LeagueVault", desc: "Holds USDC deposits, enforces deadlines", color: "#8b5cf6" },
  { name: "PredictionCommitment", desc: "Stores keccak256 hashes, validates reveals", color: "#06b6d4" },
  { name: "ScoreEngine", desc: "Calculates match scores, bonuses, total points", color: "#10b981" },
  { name: "OracleAdapter", desc: "Ingests official results, triggers resolution", color: "#f59e0b" },
  { name: "PayoutDistributor", desc: "Computes score² weights, sends USDC transfers", color: "#ec4899" },
];

const RESEARCH_QS = [
  "How should prediction accuracy be measured across a full tournament?",
  "How can rewards be distributed fairly without pure winner-takes-all?",
  "How does commit-reveal prevent front-running and score copying?",
  "How should disputed match results be handled through optimistic oracles?",
  "Can private prediction leagues remain transparent without becoming gambling products?",
];

// ─── Components ──────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
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

// ─── Animated background ──────────────────────────────────────────────────────

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
      />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <HeroBg />
      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Tag>⬡ Ethereum Research Prototype</Tag>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
        >
          The on-chain prediction league
          <br />
          <span className="gradient-text">for football tournaments.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: "#94a3b8" }}
        >
          Private leagues. Encrypted predictions. Funds locked in a smart contract.
          Rewards distributed algorithmically after oracle-based match resolution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#mechanism"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            Read the mechanism <ArrowRight size={16} />
          </a>
          <a href="#prototype"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
            View prototype <ChevronRight size={16} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-3 gap-4 max-w-md mx-auto"
        >
          {[
            { val: "1,250", unit: "USDC", label: "Prize Pool" },
            { val: "25", unit: "Players", label: "Active" },
            { val: "6", unit: "Contracts", label: "On-chain" },
          ].map(({ val, unit, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: "#60a5fa" }}>
                {val} <span className="text-sm font-normal" style={{ color: "#94a3b8" }}>{unit}</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-1"
          style={{ color: "#334155" }}
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-current" />
          <div className="text-[10px] tracking-widest uppercase">Scroll</div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────────────

function Problem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <Tag>The problem</Tag>
        </Reveal>
        <Reveal delay={0.1} className="mt-6">
          <h2 className="text-4xl font-bold leading-tight">
            You trust the platform.<br />
            <span style={{ color: "#334155" }}>You shouldn&apos;t have to.</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {[
            { issue: "Predictions are stored centrally", fix: "Commit hashes on-chain" },
            { issue: "Score calculation is a black box", fix: "Open scoring formula" },
            { issue: "Prize pool could be mismanaged", fix: "Vault locked in contract" },
            { issue: "Results can be disputed silently", fix: "Optimistic oracle with challenge period" },
          ].map(({ issue, fix }, i) => (
            <Reveal key={issue} delay={i * 0.05}>
              <div className="glass rounded-xl p-5 glow-card h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.15)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </div>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>{issue}</span>
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <Check size={13} style={{ color: "#10b981" }} />
                  <span className="text-sm font-medium" style={{ color: "#10b981" }}>{fix}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Mechanism Flow ───────────────────────────────────────────────────────────

function Mechanism() {
  const [active, setActive] = useState(0);

  return (
    <section id="mechanism" className="py-24 px-6" style={{ background: "rgba(13,17,23,0.5)" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <Tag>How it works</Tag>
          <h2 className="mt-6 text-4xl font-bold">Six steps, fully on-chain.</h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Every action is either a smart contract call or a cryptographic commitment. No backend, no trust.
          </p>
        </Reveal>

        <div className="hidden md:flex items-center gap-0 mb-12">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              <motion.button
                onClick={() => setActive(i)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: active === i ? `${step.color}18` : "transparent",
                  border: `1px solid ${active === i ? step.color + "40" : "transparent"}`,
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${step.color}20` }}>
                  <step.icon size={18} style={{ color: step.color }} />
                </div>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: active === i ? step.color : "#64748b" }}>
                  {step.label}
                </span>
              </motion.button>
              {i < FLOW_STEPS.length - 1 && (
                <div className="w-4 flex-shrink-0 flex items-center justify-center">
                  <ChevronRight size={12} style={{ color: "#1e293b" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ background: `${FLOW_STEPS[active].color}15` }}>
              {(() => { const I = FLOW_STEPS[active].icon; return <I size={28} style={{ color: FLOW_STEPS[active].color }} />; })()}
            </div>
            <div className="text-2xl font-bold mb-2">{FLOW_STEPS[active].label}</div>
            <div className="text-base" style={{ color: "#64748b" }}>{FLOW_STEPS[active].desc}</div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {FLOW_STEPS.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className="transition-all duration-200"
                  style={{
                    width: i === active ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === active ? FLOW_STEPS[active].color : "rgba(255,255,255,0.1)"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="md:hidden mt-4 space-y-3">
          {FLOW_STEPS.map((step, i) => (
            <Reveal key={step.label} delay={i * 0.06}>
              <div className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${step.color}20` }}>
                  <step.icon size={18} style={{ color: step.color }} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{step.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{step.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────

function ScoringEngine() {
  const [predicted, setPredicted] = useState({ home: 2, away: 1 });
  const actual = { home: 3, away: 1 };

  const distance = Math.abs(predicted.home - actual.home) + Math.abs(predicted.away - actual.away);
  const baseScore = Math.max(0, 100 - distance * 25);
  const outcomeBonus = (() => {
    const pOut = predicted.home > predicted.away ? "H" : predicted.home < predicted.away ? "A" : "D";
    const aOut = actual.home > actual.away ? "H" : actual.home < actual.away ? "A" : "D";
    return pOut === aOut ? 30 : 0;
  })();
  const diffBonus = Math.abs(predicted.home - predicted.away) === Math.abs(actual.home - actual.away) ? 20 : 0;
  const exactBonus = predicted.home === actual.home && predicted.away === actual.away ? 50 : 0;
  const total = baseScore + outcomeBonus + diffBonus + exactBonus;

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <Tag>Scoring Engine</Tag>
          <h2 className="mt-6 text-4xl font-bold">Precision wins. Luck helps.</h2>
          <p className="mt-4 text-base" style={{ color: "#64748b" }}>
            Try entering a predicted score below and see the points calculate in real time.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                World Cup Final — Official Result
              </div>
              <div className="flex items-center gap-3 text-xl font-bold">
                <span>🇫🇷</span>
                <span className="px-3 py-1 rounded-lg text-2xl font-mono"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                  {actual.home} — {actual.away}
                </span>
                <span>🇧🇷</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs tracking-widest uppercase mb-3" style={{ color: "#475569" }}>Your prediction</div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium flex-1 text-right">France</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPredicted(p => ({ ...p, home: Math.max(0, p.home - 1) }))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.05)" }}>−</button>
                  <span className="w-8 text-center text-xl font-mono font-bold" style={{ color: "#60a5fa" }}>
                    {predicted.home}
                  </span>
                  <button onClick={() => setPredicted(p => ({ ...p, home: p.home + 1 }))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.05)" }}>+</button>
                </div>
                <span style={{ color: "#334155" }}>—</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPredicted(p => ({ ...p, away: Math.max(0, p.away - 1) }))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.05)" }}>−</button>
                  <span className="w-8 text-center text-xl font-mono font-bold" style={{ color: "#60a5fa" }}>
                    {predicted.away}
                  </span>
                  <button onClick={() => setPredicted(p => ({ ...p, away: p.away + 1 }))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.05)" }}>+</button>
                </div>
                <span className="text-sm font-medium flex-1">Brazil</span>
              </div>
            </div>

            <div className="space-y-2 mt-6 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { label: `Base score (distance = ${distance})`, val: baseScore, color: "#3b82f6", active: true },
                { label: "Correct outcome bonus", val: outcomeBonus, color: "#10b981", active: outcomeBonus > 0 },
                { label: "Correct goal difference bonus", val: diffBonus, color: "#06b6d4", active: diffBonus > 0 },
                { label: "Exact score bonus", val: exactBonus, color: "#f59e0b", active: exactBonus > 0 },
              ].map(({ label, val, color, active: isActive }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive ? color : "#1e293b" }} />
                    <span className="text-sm" style={{ color: isActive ? "#94a3b8" : "#334155" }}>{label}</span>
                  </div>
                  <motion.span
                    key={val}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-mono font-bold"
                    style={{ color: isActive ? color : "#1e293b" }}
                  >
                    +{val}
                  </motion.span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t mt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-sm font-semibold">Total for this match</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold"
                  style={{ color: total >= 150 ? "#10b981" : total >= 100 ? "#3b82f6" : "#64748b" }}
                >
                  {total} pts
                </motion.span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Payout ───────────────────────────────────────────────────────────────────

function Payout() {
  const [model, setModel] = useState<"A" | "B">("B");
  const pool = 1250;

  const scores = LEADERBOARD.map(p => p.pts);
  const sumSq = scores.reduce((a, s) => a + s * s, 0);

  const payouts = LEADERBOARD.map(p => ({
    ...p,
    modelB: Math.round((pool * p.pts * p.pts) / sumSq),
    modelA: [500, 312, 187, 0, 0][p.rank - 1] ?? 0,
  }));

  return (
    <section className="py-24 px-6" style={{ background: "rgba(13,17,23,0.5)" }}>
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <Tag>Payout Design</Tag>
          <h2 className="mt-6 text-4xl font-bold">The maths of fair play.</h2>
          <p className="mt-4 text-base" style={{ color: "#64748b" }}>
            Two distribution models, one prize pool. Switch between them to see the difference.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="flex gap-3 mb-6">
            {(["B", "A"] as const).map(m => (
              <button key={m} onClick={() => setModel(m)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: model === m ? (m === "B" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)") : "rgba(255,255,255,0.04)",
                  border: `1px solid ${model === m ? (m === "B" ? "rgba(16,185,129,0.4)" : "rgba(59,130,246,0.4)") : "rgba(255,255,255,0.06)"}`,
                  color: model === m ? (m === "B" ? "#10b981" : "#60a5fa") : "#475569"
                }}>
                {m === "B" ? "Model B — score² distribution ★" : "Model A — ranked payout"}
              </button>
            ))}
          </div>

          <div className="glass rounded-xl p-4 mb-6 font-mono text-sm" style={{ color: "#06b6d4" }}>
            {model === "B"
              ? "payout_i = pool × score_i² / Σ(score_j²)"
              : "1st: 40% · 2nd: 25% · 3rd: 15% · Top 25%: 20% · Others: 0"}
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left p-4 font-medium" style={{ color: "#475569" }}>#</th>
                  <th className="text-left p-4 font-medium" style={{ color: "#475569" }}>Player</th>
                  <th className="text-right p-4 font-medium" style={{ color: "#475569" }}>Points</th>
                  <th className="text-right p-4 font-medium" style={{ color: "#475569" }}>Payout</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => (
                  <motion.tr
                    key={`${p.name}-${model}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: i < payouts.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
                  >
                    <td className="p-4">
                      <span className="font-bold text-xs" style={{
                        color: p.rank === 1 ? "#f59e0b" : p.rank === 2 ? "#94a3b8" : p.rank === 3 ? "#cd7c2e" : "#334155"
                      }}>
                        {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : p.rank}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 text-right font-mono" style={{ color: "#60a5fa" }}>
                      {p.pts.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono font-bold" style={{
                      color: (model === "B" ? p.modelB : p.modelA) > 0 ? "#10b981" : "#334155"
                    }}>
                      {(model === "B" ? p.modelB : p.modelA) > 0
                        ? `$${(model === "B" ? p.modelB : p.modelA).toLocaleString()}`
                        : "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {model === "B" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-4 text-xs" style={{ color: "#475569" }}>
              ★ Recommended — rewards accuracy exponentially, keeps the race interesting until the final match.
            </motion.p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ─── Prototype Dashboard ──────────────────────────────────────────────────────

function Prototype() {
  const [homeGoal, setHomeGoal] = useState(2);
  const [awayGoal, setAwayGoal] = useState(1);
  const [committed, setCommitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCommit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setCommitted(true); }, 1200);
  };

  return (
    <section id="prototype" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <Tag>Prototype</Tag>
          <h2 className="mt-6 text-4xl font-bold">What it feels like to play.</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Reveal>
              <div className="glass rounded-2xl p-5 glow-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs tracking-widest uppercase" style={{ color: "#475569" }}>Connected Wallet</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs" style={{ color: "#10b981" }}>Active</span>
                  </div>
                </div>
                <div className="font-mono text-sm" style={{ color: "#64748b" }}>0x4f3d...a91c</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">1,000</span>
                  <span className="text-sm" style={{ color: "#64748b" }}>USDC</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs tracking-widest uppercase" style={{ color: "#475569" }}>League</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
                    World Cup 2026
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Prize Pool", val: "1,250 USDC" },
                    { label: "Players", val: "25 / 30" },
                    { label: "Entry Fee", val: "50 USDC" },
                    { label: "Matches Left", val: "12" },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div className="text-xs mb-0.5" style={{ color: "#475569" }}>{label}</div>
                      <div className="text-sm font-semibold">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="glass rounded-2xl p-5">
                <div className="text-xs tracking-widest uppercase mb-4" style={{ color: "#475569" }}>
                  Next Match — France vs Brazil
                </div>
                <div className="text-xs mb-3" style={{ color: "#334155" }}>
                  Deadline: 16 Jun 2026, 20:59 UTC
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 text-center">
                    <div className="text-xs mb-2" style={{ color: "#64748b" }}>🇫🇷 France</div>
                    <div className="flex items-center gap-2 justify-center">
                      <button onClick={() => setHomeGoal(g => Math.max(0, g - 1))}
                        className="w-7 h-7 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)" }}>−</button>
                      <span className="w-6 text-center font-mono font-bold text-lg" style={{ color: "#60a5fa" }}>{homeGoal}</span>
                      <button onClick={() => setHomeGoal(g => g + 1)}
                        className="w-7 h-7 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)" }}>+</button>
                    </div>
                  </div>
                  <span style={{ color: "#334155" }}>—</span>
                  <div className="flex-1 text-center">
                    <div className="text-xs mb-2" style={{ color: "#64748b" }}>Brazil 🇧🇷</div>
                    <div className="flex items-center gap-2 justify-center">
                      <button onClick={() => setAwayGoal(g => Math.max(0, g - 1))}
                        className="w-7 h-7 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)" }}>−</button>
                      <span className="w-6 text-center font-mono font-bold text-lg" style={{ color: "#60a5fa" }}>{awayGoal}</span>
                      <button onClick={() => setAwayGoal(g => g + 1)}
                        className="w-7 h-7 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)" }}>+</button>
                    </div>
                  </div>
                </div>

                {!committed ? (
                  <motion.button
                    onClick={handleCommit}
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Computing keccak256 hash...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Lock size={14} /> Commit Prediction
                      </span>
                    )}
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-center"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Check size={14} /> Hash committed on-chain
                    </span>
                  </motion.div>
                )}

                {committed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 font-mono text-[10px] p-2 rounded-lg break-all"
                    style={{ background: "rgba(0,0,0,0.3)", color: "#334155" }}
                  >
                    0x8f2a3b9c1d4e7f0a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1
                  </motion.div>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="glass rounded-2xl p-5 h-full">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs tracking-widest uppercase" style={{ color: "#475569" }}>Leaderboard</span>
                <span className="text-xs" style={{ color: "#334155" }}>After 18 matches</span>
              </div>
              <div className="space-y-2">
                {LEADERBOARD.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: p.rank === 1 ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.02)",
                      border: p.rank === 1 ? "1px solid rgba(245,158,11,0.15)" : "1px solid transparent"
                    }}
                  >
                    <span className="text-sm w-6 text-center font-bold" style={{
                      color: p.rank === 1 ? "#f59e0b" : p.rank === 2 ? "#94a3b8" : p.rank === 3 ? "#cd7c2e" : "#334155"
                    }}>
                      {p.rank}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs mt-0.5 font-mono" style={{ color: "#475569" }}>
                        {p.pts.toLocaleString()} pts
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold" style={{ color: "#10b981" }}>~${p.payout}</div>
                      <div className="text-xs mt-0.5" style={{ color: p.trend.startsWith("+") ? "#10b981" : "#ef4444" }}>
                        {p.trend} pts
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: "#475569" }}>
                  <span>Tournament progress</span>
                  <span>18 / 30 matches</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #3b82f6, #06b6d4)" }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function Architecture() {
  return (
    <section className="py-24 px-6" style={{ background: "rgba(13,17,23,0.5)" }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-16">
          <Tag>Smart Contracts</Tag>
          <h2 className="mt-6 text-4xl font-bold">Six modules. Zero trust.</h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Each contract has a single responsibility. Together they form a fully autonomous prediction engine.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONTRACTS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -4, boxShadow: `0 20px 40px ${c.color}15` }}
                transition={{ duration: 0.2 }}
                className="glass rounded-2xl p-5 h-full cursor-default"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="font-mono text-xs" style={{ color: c.color }}>contract</span>
                </div>
                <div className="font-mono text-base font-bold mb-2">{c.name}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{c.desc}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Research ─────────────────────────────────────────────────────────────────

function Research() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <Tag>Open Questions</Tag>
          <h2 className="mt-6 text-4xl font-bold">
            This is research.<br />Not all answers exist yet.
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {RESEARCH_QS.map((q, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="flex gap-4 p-4 rounded-xl transition-colors hover:bg-white/[0.02]"
                style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="mt-0.5 text-xs font-mono font-bold w-5 flex-shrink-0" style={{ color: "#3b82f6" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{q}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-16 px-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.15)" }}>
          <AlertCircle size={12} style={{ color: "#eab308" }} />
          <span className="text-xs font-medium" style={{ color: "#eab308" }}>Research Prototype</span>
        </div>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#475569" }}>
          ScoreVault is a research prototype. It is not a public gambling product, not available for
          real-money use, and should be tested only on testnets or with non-transferable points unless
          proper legal approvals are obtained.
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.15)" }}>
            <Zap size={12} style={{ color: "#60a5fa" }} />
          </div>
          <span className="font-bold tracking-tight">ScoreVault</span>
        </div>
        <p className="text-xs" style={{ color: "#1e293b" }}>
          This project explores the technical design space of on-chain prediction competitions.
          Any real-money deployment would require a full legal review and appropriate regulatory approvals.
        </p>
      </div>
    </footer>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", v => setScrolled(v > 40));
  }, [scrollY]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,8,16,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.15)" }}>
          <Zap size={13} style={{ color: "#60a5fa" }} />
        </div>
        <span className="font-bold text-sm tracking-tight">ScoreVault</span>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-xs" style={{ color: "#475569" }}>
        <a href="#mechanism" className="hover:text-white transition-colors">Mechanism</a>
        <a href="#prototype" className="hover:text-white transition-colors">Prototype</a>
        <a href="#" className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
          Research
        </a>
      </div>
    </motion.nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Mechanism />
      <ScoringEngine />
      <Payout />
      <Prototype />
      <Architecture />
      <Research />
      <Footer />
    </main>
  );
}
