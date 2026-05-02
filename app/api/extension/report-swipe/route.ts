import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

function responseForProfile(profile: any) {
  const isPaid = profile.plan === "premium" || profile.subscription_status === "active" || profile.subscription_status === "trialing";
  const used = Number(profile.swipes_used || 0);
  const limit = Number(profile.free_swipe_limit || 200);
  const remaining = Math.max(0, limit - used);
  const allowed = isPaid || remaining > 0;

  return {
    valid: true,
    allowed,
    is_paid: isPaid,
    plan: profile.plan,
    subscription_status: profile.subscription_status,
    swipes_used: used,
    swipe_limit: limit,
    swipes_remaining: isPaid ? null : remaining,
    message: allowed ? "" : "Free trial limit reached.",
  };
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    const cleanKey = String(apiKey || "").trim();
    if (!cleanKey) return NextResponse.json({ valid: false, allowed: false, message: "API key is required." }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id,api_key,plan,subscription_status,free_swipe_limit,swipes_used")
      .eq("api_key", cleanKey)
      .single();

    if (error || !profile) return NextResponse.json({ valid: false, allowed: false, message: "Invalid API key." }, { status: 404 });

    const isPaid = profile.plan === "premium" || profile.subscription_status === "active" || profile.subscription_status === "trialing";
    const used = Number(profile.swipes_used || 0);
    const limit = Number(profile.free_swipe_limit || 200);

    if (!isPaid && used >= limit) {
      return NextResponse.json(responseForProfile(profile));
    }

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ swipes_used: used + 1, updated_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select("id,api_key,plan,subscription_status,free_swipe_limit,swipes_used")
      .single();

    if (updateError || !updated) throw updateError || new Error("Could not report swipe.");
    return NextResponse.json(responseForProfile(updated));
  } catch (error: any) {
    return NextResponse.json({ valid: false, allowed: false, message: error.message || "Could not report swipe." }, { status: 500 });
  }
}
