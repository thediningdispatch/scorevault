import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json() as { email?: string };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Store in Vercel KV via REST API
    // Setup: vercel.com → Storage → Create KV → env vars auto-injected
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await fetch(
        `${process.env.KV_REST_API_URL}/zadd/waitlist/NX/${Date.now()}/${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  // Read waitlist (admin only — protect with a secret in prod)
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return NextResponse.json({ emails: [], note: "KV not configured" });
  }
  const res = await fetch(
    `${process.env.KV_REST_API_URL}/zrange/waitlist/0/-1`,
    { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` } }
  );
  const { result } = await res.json() as { result: string[] };
  return NextResponse.json({ count: result?.length ?? 0, emails: result ?? [] });
}
