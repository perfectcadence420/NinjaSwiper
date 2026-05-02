import { NextResponse } from "next/server";
import { getSiteUrl, requireEnv } from "../../../../lib/env";
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
      .select("id,email,full_name,api_key,stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (error || !profile) return NextResponse.json({ error: "Could not load profile." }, { status: 404 });

    let customerId = profile.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email || undefined,
        name: profile.full_name || undefined,
        metadata: { user_id: user.id, api_key: profile.api_key || "" },
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() }).eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: requireEnv("NEXT_PUBLIC_STRIPE_PRICE_ID"), quantity: 1 }],
      success_url: `${siteUrl}/dashboard?stripe=success`,
      cancel_url: `${siteUrl}/payment?stripe=cancelled`,
      client_reference_id: user.id,
      subscription_data: {
        metadata: { user_id: user.id },
      },
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Could not create checkout session." }, { status: 500 });
  }
}
