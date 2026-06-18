import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  testnet_usdc: number;
  wallet_address: string | null;
  created_at: string;
};
