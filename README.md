# NinjaSwiper Website — Vercel-ready package

This is the final packaged NinjaSwiper website prepared for Vercel.

It includes:

- Next.js App Router website
- Homepage, login, signup, forgot password, update password, dashboard, payment, terms, and contact pages
- Supabase Auth integration
- Supabase profile/API-key dashboard
- Stripe Checkout route for Premium subscriptions
- Stripe Customer Portal route for unsubscribe/billing management
- Stripe webhook route to update Supabase subscription status
- Extension API routes for API-key validation and swipe reporting
- NinjaSwiper logo at `public/icon.png`
- Supabase SQL setup script in `database/ninjaswiper_supabase_setup.sql`

## Important files

```text
app/[[...slug]]/page.tsx
app/api/stripe/create-checkout-session/route.ts
app/api/stripe/create-customer-portal/route.ts
app/api/stripe/webhook/route.ts
app/api/extension/validate-key/route.ts
app/api/extension/report-swipe/route.ts
public/icon.png
database/ninjaswiper_supabase_setup.sql
.env.example
```

## Required Vercel Environment Variables

Add these in Vercel → Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://hfatihgyttgbjadycoga.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
NEXT_PUBLIC_SITE_URL=https://ninjaswiper.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_here
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1TSSraPM9nhW4VxiSUqMsMRu
NEXT_PUBLIC_STRIPE_PRICE_LABEL=$9/month

STRIPE_SECRET_KEY=sk_live_or_sk_test_here
STRIPE_WEBHOOK_SECRET=whsec_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

Never put `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, or `SUPABASE_SERVICE_ROLE_KEY` in public frontend code.

## Supabase setup

1. Open Supabase.
2. Go to SQL Editor.
3. Copy everything from `database/ninjaswiper_supabase_setup.sql`.
4. Paste it into a new SQL query.
5. Run it.

Then configure auth URLs:

- Site URL: `https://ninjaswiper.com`
- Redirect URLs:
  - `https://ninjaswiper.com/dashboard`
  - `https://ninjaswiper.com/update-password`
  - `https://ninjaswiper.com/login`
  - `https://ninjaswiper.com/signup`
  - `https://ninjaswiper.com/**`

## Stripe setup

Create a webhook endpoint:

```text
https://ninjaswiper.com/api/stripe/webhook
```

Recommended events:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Copy the webhook signing secret (`whsec_...`) into Vercel as `STRIPE_WEBHOOK_SECRET`.

Also configure Stripe Customer Portal in Stripe Dashboard so users can cancel/update billing.

## Extension API endpoints

The extension should call:

```text
POST https://ninjaswiper.com/api/extension/validate-key
POST https://ninjaswiper.com/api/extension/report-swipe
```

Request body:

```json
{ "apiKey": "ns_..." }
```
