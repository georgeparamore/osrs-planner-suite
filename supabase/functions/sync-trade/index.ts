// Edge Function: sync-trade
//
// The RuneLite plugin posts here to push newly-logged GE trades. It
// authenticates with a per-user "sync token" (see profiles.sync_token in
// 0001_ge_trade_history.sql) instead of the account's login password, so a
// plugin config leak only exposes a revocable write-only capability, not the
// user's real credentials.
//
// This function runs with the service role key (auto-injected by Supabase),
// which bypasses Row Level Security entirely - so it is the ONLY code path
// allowed to insert into public.trades, and it must do its own authorization
// (resolve syncToken -> user_id) before writing anything.
//
// Deploy via the Supabase dashboard (Edge Functions -> New Function -> paste
// this file -> Deploy), or `supabase functions deploy sync-trade` with the CLI.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAX_TRADES_PER_REQUEST = 500;

interface IncomingTrade {
  timestamp: number;
  itemId: number;
  itemName: string;
  buy: boolean;
  quantity: number;
  unitPrice: number;
}

function isValidTrade(t: unknown): t is IncomingTrade {
  if (typeof t !== "object" || t === null) return false;
  const r = t as Record<string, unknown>;
  return (
    typeof r.timestamp === "number" &&
    typeof r.itemId === "number" &&
    typeof r.itemName === "string" && r.itemName.length > 0 && r.itemName.length <= 200 &&
    typeof r.buy === "boolean" &&
    typeof r.quantity === "number" && r.quantity > 0 &&
    typeof r.unitPrice === "number" && r.unitPrice > 0
  );
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { syncToken?: unknown; trades?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const syncToken = body.syncToken;
  if (typeof syncToken !== "string" || syncToken.length === 0) {
    return new Response(JSON.stringify({ error: "missing syncToken" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.trades) || body.trades.length === 0) {
    return new Response(JSON.stringify({ error: "missing trades array" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body.trades.length > MAX_TRADES_PER_REQUEST) {
    return new Response(
      JSON.stringify({ error: `too many trades in one request (max ${MAX_TRADES_PER_REQUEST})` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const validTrades = body.trades.filter(isValidTrade);
  if (validTrades.length === 0) {
    return new Response(JSON.stringify({ error: "no valid trades in request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("sync_token", syncToken)
    .maybeSingle();

  if (profileError || !profile) {
    return new Response(JSON.stringify({ error: "invalid sync token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = validTrades.map((t) => ({
    user_id: profile.id,
    ts: t.timestamp,
    item_id: t.itemId,
    item_name: t.itemName,
    buy: t.buy,
    quantity: t.quantity,
    unit_price: t.unitPrice,
  }));

  const { error: insertError, count } = await supabase
    .from("trades")
    .upsert(rows, {
      onConflict: "user_id,ts,item_id,buy,quantity,unit_price",
      ignoreDuplicates: true,
      count: "exact",
    });

  if (insertError) {
    console.error("insert failed", insertError);
    return new Response(JSON.stringify({ error: "insert failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: validTrades.length, inserted: count ?? null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
