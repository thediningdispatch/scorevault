"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import type { Match, OddsResponse, ScoreVal } from "@/app/lib/match-types";
import { cn } from "@/app/lib/utils";
import { Card } from "@/components/ui/card";
import styles from "./match-card.module.css";

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

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ScoreVal;
  onChange: (value: ScoreVal) => void;
}) {
  return (
    <input
      aria-label={label}
      className={cn(styles.score, value !== "" && styles.filled)}
      inputMode="numeric"
      maxLength={2}
      onChange={(event) => {
        const nextValue = event.target.value.replace(/\D/g, "");
        onChange(nextValue === "" ? "" : Math.min(20, Number(nextValue)));
      }}
      pattern="[0-9]*"
      placeholder="–"
      type="text"
      value={value}
    />
  );
}

export function PredictionMatchCard({
  match,
  picks,
  onPick,
  index,
}: {
  match: Match;
  picks: { home: ScoreVal; away: ScoreVal };
  onPick: (home: ScoreVal, away: ScoreVal) => void;
  index: number;
}) {
  const oddsQuery = useMatchOdds(match.id);
  const liveOdds = oddsQuery.data?.live ? oddsQuery.data : null;
  const homePct = liveOdds?.home ?? match.home.pct;
  const drawPct = liveOdds?.draw ?? match.draw.pct;
  const awayPct = liveOdds?.away ?? match.away.pct;
  const favoritePct = Math.max(homePct, drawPct, awayPct);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: index * 0.045, duration: 0.24, ease: "easeOut" }}
    >
      <Card className={styles.card}>
        <div className={styles.meta}>
          <span>{match.gw}</span>
          <span>·</span>
          <span>{match.time}</span>
          <span className={cn(styles.status, liveOdds && styles.live)}>
            {liveOdds
              ? "Polymarket live"
              : oddsQuery.isFetching
                ? "Updating odds"
                : "Market estimate"}
          </span>
        </div>

        <div className={styles.main}>
          <div className={styles.team}>
            <div className={styles.flag}>{match.home.flag}</div>
            <span className={styles.teamName}>{match.home.name}</span>
          </div>

          <div className={styles.center}>
            <div className={styles.scores}>
              <ScoreInput
                label={`${match.home.name} predicted score`}
                value={picks.home}
                onChange={(value) => onPick(value, picks.away)}
              />
              <ScoreInput
                label={`${match.away.name} predicted score`}
                value={picks.away}
                onChange={(value) => onPick(picks.home, value)}
              />
            </div>

            <div className={styles.odds}>
              {[
                {
                  label: "1",
                  pct: homePct,
                  selected:
                    picks.home !== "" &&
                    picks.away !== "" &&
                    Number(picks.home) > Number(picks.away),
                },
                {
                  label: "X",
                  pct: drawPct,
                  selected:
                    picks.home !== "" &&
                    picks.away !== "" &&
                    Number(picks.home) === Number(picks.away),
                },
                {
                  label: "2",
                  pct: awayPct,
                  selected:
                    picks.home !== "" &&
                    picks.away !== "" &&
                    Number(picks.home) < Number(picks.away),
                },
              ].map((odd) => (
                <div
                  className={cn(
                    styles.odd,
                    odd.pct === favoritePct ? styles.favorite : styles.underdog,
                    odd.selected && styles.selected,
                  )}
                  key={odd.label}
                >
                  <span className={styles.oddLabel}>{odd.label}</span>
                  <span className={styles.oddValue}>{odd.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.team}>
            <div className={styles.flag}>{match.away.flag}</div>
            <span className={styles.teamName}>{match.away.name}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
