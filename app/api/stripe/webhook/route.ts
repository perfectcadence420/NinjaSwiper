import { NextResponse } from "next/server";
import { requireEnv } from "../../../../lib/env";
import { createSupabaseAdmin } from "../../../../lib/supabase-server";
import { createStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

function isPremiumStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

async function updateProfileForSubscription(subscription: any) {
  const supabase = createSupabaseAdmin();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  const userId = subscription.metadata?.user_id;
  const status = subscription.status || "unknown";
  const update = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: status,
    plan: isPremiumStatus(status) ? "premium" : "trial",
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    await supabase.from("profiles").update(update).eq("id", userId);
    return;
  }

  if (customerId) {
    await supabase.from("profiles").update(update).eq("stripe_customer_id", customerId);
  }
}

export async function POST(request: Request) {
  const stripe = createStripe();
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature || "", requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${error.message}` }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session: any = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (userId) {
          await supabase.from("profiles").update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
            plan: "premium",
            updated_at: new Date().toISOString(),
          }).eq("id", userId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await updateProfileForSubscription(event.data.object);
        break;
      }
      case "invoice.paid": {
        const invoice: any = event.data.object;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await updateProfileForSubscription(subscription);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice: any = event.data.object;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          await supabase.from("profiles").update({
            subscription_status: "past_due",
            plan: "trial",
            updated_at: new Date().toISOString(),
          }).eq("stripe_customer_id", customerId);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Webhook handler failed." }, { status: 500 });
  }
}
