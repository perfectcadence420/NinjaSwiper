import { NextResponse } from "next/server";
import { getSiteUrl } from "../../../../lib/env";
import { createSupabaseAdmin, getUserFromRequest } from "../../../../lib/supabase-server";
import { createStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const supabase = createSupabaseAdmin();
    const stripe = createStripe();
    const siteUrl = getSiteUrl();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (error || !profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer is connected to this account yet." }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/dashboard`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Could not create billing portal session." }, { status: 500 });
  }
}
