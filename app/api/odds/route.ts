import { NextResponse } from "next/server";

const GAMMA = "https://gamma-api.polymarket.com";

// Polymarket event slugs — populated once Polymarket publishes WC2026 markets.
// Format follows their FIFA WC convention: fifwc-{home3}-{away3}-{date}
const SLUGS: Record<string, string> = {
  "gha-pan": "fifwc-gha-pan-2026-06-18",
  "uzb-col": "fifwc-uzb-col-2026-06-18",
  "cze-rsa": "fifwc-cze-rsa-2026-06-18",
  "usa-bol": "fifwc-usa-bol-2026-06-19",
  "ecu-ven": "fifwc-ecu-ven-2026-06-19",
  "mex-cam": "fifwc-mex-cam-2026-06-19",
  "fra-aut": "fifwc-fra-aut-2026-06-20",
  "bra-arg": "fifwc-bra-arg-2026-06-20",
  "eng-irl": "fifwc-eng-irl-2026-06-21",
  "esp-mar": "fifwc-esp-mar-2026-06-21",
};

function parseOutcomePrices(raw: string | string[]): number[] {
  const arr: string[] = typeof raw === "string" ? JSON.parse(raw) : raw;
  return arr.map(Number);
}

function classifyMarket(question: string, home: string, away: string) {
  const q = question.toLowerCase();
  if (q.includes("draw")) return "draw";
  if (q.includes(home.toLowerCase())) return "home";
  if (q.includes(away.toLowerCase())) return "away";
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("match") ?? "";
  const slug = SLUGS[matchId];

  if (!slug) return NextResponse.json({ live: false }, { status: 400 });

  try {
    const res = await fetch(`${GAMMA}/events/slug/${slug}`, {
      next: { revalidate: 300 }, // re-fetch every 5 min
    });

    if (!res.ok) return NextResponse.json({ live: false });

    const event = await res.json();
    if (!event?.markets?.length) return NextResponse.json({ live: false });

    const [homeTeam, awayTeam] = (event.title as string)
      .split(/\s+vs\.?\s+/i)
      .map((s: string) => s.trim());

    const odds: Record<"home" | "draw" | "away", number | null> = { home: null, draw: null, away: null };

    for (const m of event.markets) {
      const prices = parseOutcomePrices(m.outcomePrices);
      const type = classifyMarket(m.question, homeTeam, awayTeam);
      if (type) odds[type] = prices[0]; // prices[0] = "Yes" probability
    }

    // Convert to integer percentages
    return NextResponse.json({
      live: true,
      home: odds.home != null ? Math.round(odds.home * 100) : null,
      draw: odds.draw != null ? Math.round(odds.draw * 100) : null,
      away: odds.away != null ? Math.round(odds.away * 100) : null,
      source: "polymarket",
    });
  } catch {
    return NextResponse.json({ live: false });
  }
}
