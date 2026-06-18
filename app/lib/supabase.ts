import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;           // UUID = auth.users.id
  name: string;
  avatar: string;
  testnet_usdc: number;
  wallet_address: string | null;
  created_at: string;
};

export type Pick = {
  id: string;
  user_id: string;
  match_id: string;    // e.g. "gha-pan"
  home_score: number;
  away_score: number;
  locked: boolean;
  created_at: string;
};

export type Result = {
  match_id: string;
  home_score: number;
  away_score: number;
  home_pct: number;   // Polymarket probability at kickoff, integer 0-100
  draw_pct: number;
  away_pct: number;
  is_final: boolean;
  updated_at: string;
};

export type LeaderboardEntry = {
  user_id: string;
  name: string;
  avatar: string;
  total_pts: number;
  good_picks: number;
  exact_picks: number;
};

// ── Auth helpers ───────────────────────────────────────────────────────────────

/** Call once on app mount. Returns the user UUID (creates anon session if needed). */
export async function ensureSession(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session.user.id;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) { console.error("anon auth failed", error); return null; }
  return data.user?.id ?? null;
}

/** Upsert a profile row after onboarding. */
export async function upsertProfile(id: string, name: string, avatar: string) {
  return supabase.from("profiles").upsert({ id, name, avatar }, { onConflict: "id" });
}

/** Save / overwrite all picks for a user in one call. */
export async function savePicks(
  userId: string,
  picks: { matchId: string; homeScore: number; awayScore: number }[]
) {
  const rows = picks.map(p => ({
    user_id:    userId,
    match_id:   p.matchId,
    home_score: p.homeScore,
    away_score: p.awayScore,
    locked:     true,
  }));
  return supabase.from("picks").upsert(rows, { onConflict: "user_id,match_id" });
}

/** Fetch all picks for a user. */
export async function getUserPicks(userId: string): Promise<Pick[]> {
  const { data } = await supabase
    .from("picks")
    .select("*")
    .eq("user_id", userId);
  return (data as Pick[]) ?? [];
}

/** Fetch all official results. */
export async function getResults(): Promise<Result[]> {
  const { data } = await supabase.from("results").select("*");
  return (data as Result[]) ?? [];
}

/** Fetch leaderboard (calculated server-side via Postgres function). */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await supabase.rpc("get_leaderboard");
  return (data as LeaderboardEntry[]) ?? [];
}
