"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hfatihgyttgbjadycoga.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_hRGspnNshq_vprsEJTMK5w_Ht7iGLHK";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ninjaswiper.com";
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_live_51TSSaWPM9nhW4VxiDfnufM5Df6hZRbrB3kgUqk0DmBRPYv5PFWz1atoq9UZJvqLqr0cwz2CbvvwUwpA8jsDQwPLm00mc5A3K7F";
const STRIPE_PREMIUM_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1TSSraPM9nhW4VxiSUqMsMRu";
const STRIPE_PREMIUM_PRICE_LABEL = process.env.NEXT_PUBLIC_STRIPE_PRICE_LABEL || "$9/month";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

type RouteName = "home" | "login" | "signup" | "forgotPassword" | "updatePassword" | "dashboard" | "payment" | "terms" | "contact";
type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  api_key?: string | null;
  plan?: string | null;
  subscription_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  free_swipe_limit?: number | null;
  swipes_used?: number | null;
};

const routes: Record<RouteName, string> = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  updatePassword: "/update-password",
  dashboard: "/dashboard",
  payment: "/payment",
  terms: "/terms",
  contact: "/contact",
};

const navItems = [
  { label: "Features", sectionId: "features" },
  { label: "Pricing", sectionId: "pricing" },
  { label: "FAQ", sectionId: "faq" },
];

const plans = [
  {
    name: "Trial",
    price: "Free",
    detail: "200 swipes included",
    cta: "Start free",
    featured: false,
    perks: ["200 trial swipes", "Custom swipe timing", "Right-swipe percentage", "Basic usage dashboard"],
  },
  {
    name: "Premium",
    price: "$9",
    detail: "per month",
    cta: "Go premium",
    featured: true,
    perks: ["Unlimited swiping allowance", "Passport city cycling", "Random breaks", "API key access", "Priority updates"],
  },
];

const featureCards = [
  { icon: "zap", title: "Timed swiping", body: "Set your swipe interval with natural randomized timing so sessions feel less robotic." },
  { icon: "globe", title: "Passport cycling", body: "When profiles run out, rotate through configured cities while preserving the current working flow." },
  { icon: "shield", title: "Break mode", body: "Optional random breaks make longer sessions look cleaner and keep users informed when pausing." },
  { icon: "key", title: "API key access", body: "Each account gets a key tied to trial limits or premium subscription status." },
];

const faqs = [
  ["How does the free trial work?", "When you create a new account, 200 swipes are included for free. After that, the extension will ask you to upgrade."],
  ["How does Premium unlock the extension?", "The website checks the user’s subscription and marks their API key as premium when payment is active."],
  ["How do I connect the extension to my account?", "Create a NinjaSwiper account, copy your API key from the dashboard, and paste it into the extension. The extension uses that key to check your swipe allowance and Premium status."],
];

const termsSections = [
  ["1. Agreement to these Terms", "By creating an account, purchasing a subscription, entering an API key, installing the browser extension, or using NinjaSwiper, you agree to these Terms and Conditions. If you do not agree, do not use NinjaSwiper."],
  ["2. What NinjaSwiper does", "NinjaSwiper is a browser extension and web dashboard that helps users automate certain manual actions in supported third-party web interfaces. Features may include timed swiping, right-swipe percentage settings, session counters, breaks, Passport/location cycling, account API keys, and paid access controls."],
  ["3. Third-party services", "NinjaSwiper is not affiliated with, endorsed by, sponsored by, or approved by Tinder, Match Group, Stripe, Supabase, Google, Chrome, or any other third-party platform. Your use of third-party websites and services remains subject to their own terms, policies, restrictions, rate limits, and enforcement actions."],
  ["4. User responsibility", "You are solely responsible for how you use NinjaSwiper. You must use the service lawfully, respectfully, and in a way that complies with the rules of any third-party platform you access. You understand that automation may violate some third-party platform terms and may result in account restrictions, reduced functionality, suspension, bans, or other consequences."],
  ["5. No guarantee of results", "NinjaSwiper does not guarantee matches, messages, dates, account growth, uninterrupted access, platform compatibility, or any specific outcome. Third-party sites can change their design, code, controls, anti-automation systems, or rules at any time, which may cause NinjaSwiper to stop working temporarily or permanently."],
  ["6. Accounts and API keys", "You must provide accurate account information and keep your login credentials and API key secure. You may not sell, share, publish, transfer, rent, or abuse API keys. We may revoke, rotate, suspend, or limit API keys if we detect abuse, fraud, security risk, excessive usage, chargebacks, or violation of these Terms."],
  ["7. Free trial", "Free trial accounts currently include up to 200 reported swipes. Trial limits may change in the future. Attempts to bypass usage limits, create repeated trial accounts, manipulate counters, tamper with the extension, or avoid payment may result in account suspension or termination."],
  ["8. Paid subscription", "NinjaSwiper Premium is currently offered at $9/month unless otherwise stated at checkout. Payments are processed by Stripe. Your subscription renews automatically until cancelled. Premium access depends on successful payment and active subscription status as reported by Stripe."],
  ["9. Cancellations and refunds", "You may cancel your subscription through the billing portal or by contacting contact@ninjaswiper.com. Unless required by law, subscription fees are generally non-refundable for periods already billed, especially where API key access or premium usage has been provided."],
  ["10. Prohibited use", "You may not use NinjaSwiper for unlawful activity, harassment, spam, scraping, impersonation, platform abuse, security testing without permission, reverse engineering, resale, sublicensing, circumventing payment, or any use that harms NinjaSwiper, third-party platforms, or other people."],
  ["11. Availability and changes", "We may update, pause, remove, or change features at any time. We may release updates to maintain compatibility, improve safety, add payment checks, or respond to third-party platform changes. We are not liable if a third-party platform update breaks or limits the extension."],
  ["12. Data and privacy", "We use account data needed to operate the service, such as email address, profile record, API key, plan, subscription status, and swipe usage counts. Payments are handled by Stripe, and authentication/database services are handled by Supabase. Do not enter highly sensitive information into NinjaSwiper unless requested by the service."],
  ["13. Intellectual property", "NinjaSwiper, including its name, branding, design, code, website, extension, and related materials, belongs to NinjaSwiper or its owner. You receive a limited, revocable, non-transferable right to use the service according to these Terms."],
  ["14. Disclaimers", "NinjaSwiper is provided on an as-is and as-available basis. To the maximum extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted service, compatibility with third-party platforms, and error-free operation."],
  ["15. Limitation of liability", "To the maximum extent permitted by law, NinjaSwiper and its owner will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including lost profits, lost data, account bans, platform restrictions, or lost opportunities. Our total liability for any claim is limited to the amount you paid to NinjaSwiper in the one month before the claim arose."],
  ["16. Termination", "We may suspend or terminate access if you violate these Terms, misuse the service, create risk, fail to pay, dispute payments abusively, or use the service in a way we reasonably believe is harmful. You may stop using NinjaSwiper at any time."],
  ["17. Changes to these Terms", "We may update these Terms from time to time. If changes are material, we will take reasonable steps to notify users through the website, dashboard, or other appropriate means. Continued use after changes means you accept the updated Terms."],
  ["18. Contact", "Questions about these Terms can be sent to contact@ninjaswiper.com."],
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getTrialSwipesLeft(count: number, limit = 200) {
  return Math.max(0, limit - count);
}

function getTrialProgressPercent(count: number, limit = 200) {
  if (!limit || limit <= 0) return 100;
  return Math.min(100, Math.max(0, (count / limit) * 100));
}

function getIsPremium(profile: Profile | null) {
  return profile?.plan === "premium" || profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
}

function getBillingActionLabel(isPaid: boolean) {
  return isPaid ? "Unsubscribe" : "Upgrade for $9";
}

function getUnsubscribeHelpText(isPaid: boolean) {
  return isPaid ? "Open billing to cancel your subscription or update your payment method." : "Subscribe to Premium to unlock unlimited swiping.";
}

function getAccountStatus(isPaid: boolean, swipesUsed: number, freeLimit = 200) {
  if (isPaid) {
    return { label: "Premium active", tone: "premium", swipesLeft: "Unlimited", actionText: "Unsubscribe", plan: "Premium" };
  }

  return {
    label: swipesUsed >= freeLimit ? "Trial limit reached" : "Free trial",
    tone: swipesUsed >= freeLimit ? "blocked" : "trial",
    swipesLeft: getTrialSwipesLeft(swipesUsed, freeLimit),
    actionText: "Upgrade for $9",
    plan: "Trial",
  };
}

function getRouteFromPath(pathname: string): RouteName {
  if (pathname === routes.login) return "login";
  if (pathname === routes.signup) return "signup";
  if (pathname === routes.forgotPassword) return "forgotPassword";
  if (pathname === routes.updatePassword) return "updatePassword";
  if (pathname === routes.dashboard) return "dashboard";
  if (pathname === routes.payment) return "payment";
  if (pathname === routes.terms) return "terms";
  if (pathname === routes.contact) return "contact";
  return "home";
}

function scrollToSection(sectionId: string) {
  if (typeof document === "undefined") return false;
  const section = document.getElementById(sectionId);
  if (!section) return false;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function formatAuthError(error: any) {
  const message = String(error?.message || "Something went wrong. Please try again.");
  const lower = message.toLowerCase();
  if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) return "Account already exists. Please log in instead.";
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) return "Incorrect email or password.";
  return message;
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

async function getCurrentProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,api_key,plan,subscription_status,stripe_customer_id,stripe_subscription_id,free_swipe_limit,swipes_used,created_at,updated_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function postAuthedJson(url: string, body?: Record<string, unknown>) {
  const token = await getAccessToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Request failed.");
  return data;
}

async function copyText(value: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (error) {}

  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let didCopy = false;
  try { didCopy = document.execCommand("copy"); } catch (error) { didCopy = false; }
  document.body.removeChild(textarea);
  return didCopy;
}

if (typeof console !== "undefined") {
  console.assert(getTrialSwipesLeft(143) === 57, "Expected 57 trial swipes left.");
  console.assert(getTrialSwipesLeft(250) === 0, "Expected trial swipes left to never go below 0.");
  console.assert(getTrialProgressPercent(100) === 50, "Expected 100/200 swipes to equal 50% progress.");
  console.assert(getTrialProgressPercent(250) === 100, "Expected progress to cap at 100%.");
  console.assert(getRouteFromPath("/login") === "login", "Expected /login to map to login.");
  console.assert(getRouteFromPath("/signup") === "signup", "Expected /signup to map to signup.");
  console.assert(getRouteFromPath("/dashboard") === "dashboard", "Expected /dashboard to map to dashboard.");
  console.assert(getRouteFromPath("/payment") === "payment", "Expected /payment to map to payment.");
  console.assert(getRouteFromPath("/terms") === "terms", "Expected /terms to map to terms.");
  console.assert(getRouteFromPath("/contact") === "contact", "Expected /contact to map to contact.");
  console.assert(getAccountStatus(false, 150).swipesLeft === 50, "Expected 50 swipes left.");
  console.assert(getAccountStatus(false, 200).tone === "blocked", "Expected trial limit reached state.");
  console.assert(getAccountStatus(false, 50).actionText === "Upgrade for $9", "Expected price CTA.");
  console.assert(getAccountStatus(true, 999).swipesLeft === "Unlimited", "Expected paid user to have unlimited swipes.");
  console.assert(formatAuthError({ message: "User already registered" }) === "Account already exists. Please log in instead.", "Expected duplicate signup error.");
  console.assert(formatAuthError({ message: "Invalid login credentials" }) === "Incorrect email or password.", "Expected login error copy.");
  console.assert(formatAuthError({ message: "User already exists" }) === "Account already exists. Please log in instead.", "Expected existing account error copy.");
  console.assert(STRIPE_PREMIUM_PRICE_ID.startsWith("price_"), "Expected Stripe premium price id.");
  console.assert(STRIPE_PUBLISHABLE_KEY.startsWith("pk_"), "Expected Stripe publishable key.");
  console.assert(getBillingActionLabel(true) === "Unsubscribe", "Expected paid users to see unsubscribe billing action.");
  console.assert(getBillingActionLabel(false) === "Upgrade for $9", "Expected trial users to see upgrade action.");
  console.assert(getUnsubscribeHelpText(true).includes("cancel"), "Expected unsubscribe help text to mention cancel.");
  console.assert(termsSections.length >= 10, "Expected Terms page to contain substantial terms sections.");
  console.assert(navItems.length === 3, "Expected three homepage nav items.");
}

function Button({ children, className = "", variant, size, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) {
  const base = "inline-flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60";
  const variantClass = variant === "ghost" ? "bg-transparent hover:bg-rose-50" : variant === "outline" ? "border" : "";
  const sizeClass = size === "icon" ? "h-10 w-10 rounded-2xl" : "";
  return <button disabled={disabled} className={cn(base, variantClass, sizeClass, className)} {...props}>{children}</button>;
}

function Card({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className}>{children}</div>;
}

function CardContent({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className}>{children}</div>;
}

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  if (name === "arrow-right") return <svg {...common}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
  if (name === "check") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>;
  if (name === "zap") return <svg {...common}><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" /></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /><path d="M12 2a15.3 15.3 0 0 0 0 20" /></svg>;
  if (name === "key") return <svg {...common}><circle cx="7.5" cy="15.5" r="5.5" /><path d="m12 11 8-8" /><path d="m16 7 3 3" /><path d="m18 5 3 3" /></svg>;
  if (name === "copy") return <svg {...common}><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;
  if (name === "heart") return <svg {...common} fill="currentColor" stroke="none"><path d="M12 21s-7.2-4.4-9.5-9.2C.9 8.3 2.7 4.5 6.4 4.1c2-.2 3.8.8 4.7 2.4.9-1.6 2.7-2.6 4.7-2.4 3.7.4 5.5 4.2 3.9 7.7C19.2 16.6 12 21 12 21Z" /></svg>;
  if (name === "x") return <svg {...common}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>;
  if (name === "sparkles") return <svg {...common}><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" /><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" /></svg>;
  return null;
}

function LogoMark() {
  return <img src="/icon.png" alt="NinjaSwiper logo" className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-lg shadow-rose-300/30" />;
}

function Badge({ children, tone = "rose" }: { children: React.ReactNode; tone?: "rose" | "green" }) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur", tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-white/75 text-rose-600")}>
      <Icon name="sparkles" className="h-4 w-4" />
      {children}
    </div>
  );
}

function MessageBox({ type = "info", children }: { type?: "info" | "error" | "success"; children: React.ReactNode }) {
  const classes = type === "error" ? "border-red-200 bg-red-50 text-red-700" : type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700";
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm font-bold", classes)}>{children}</div>;
}

function BrandNav({ subtitle, onNavigate, right }: { subtitle: string; onNavigate: (route: RouteName) => void; right?: React.ReactNode }) {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between">
      <button type="button" onClick={() => onNavigate("home")} className="flex items-center gap-3 text-left">
        <LogoMark />
        <div><div className="text-lg font-black tracking-tight">NinjaSwiper</div><div className="text-xs font-semibold text-zinc-500">{subtitle}</div></div>
      </button>
      {right || null}
    </nav>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <Card className="rounded-3xl border-rose-100 bg-white/80 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="p-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#ff5864]"><Icon name={icon} className="h-6 w-6" /></div>
        <h3 className="text-lg font-bold text-zinc-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
      </CardContent>
    </Card>
  );
}

function DashboardLayout({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      setLoading(true);
      setErrorMessage("");
      const user = await getCurrentUser();
      if (!user) {
        if (mounted) onNavigate("login");
        return;
      }
      try {
        const loadedProfile = await getCurrentProfile(user.id);
        if (mounted) setProfile(loadedProfile);
      } catch (error: any) {
        if (mounted) setErrorMessage(error.message || "Could not load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => { mounted = false; };
  }, [onNavigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    onNavigate("home");
  }

  async function handleCopyKey() {
    if (!profile?.api_key) return;
    await copyText(profile.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isPaid = getIsPremium(profile);
  const swipesUsed = Number(profile?.swipes_used) || 0;
  const freeLimit = Number(profile?.free_swipe_limit) || 200;
  const account = getAccountStatus(isPaid, swipesUsed, freeLimit);
  const progress = isPaid ? 100 : getTrialProgressPercent(swipesUsed, freeLimit);
  const displayName = profile?.full_name || profile?.email || "there";

  return (
    <main className="min-h-screen bg-[#fff7f8] px-6 py-6 text-zinc-950">
      <BrandNav subtitle="Account dashboard" onNavigate={onNavigate} right={<Button type="button" onClick={handleLogout} className="rounded-2xl bg-zinc-950 px-5 font-bold text-white hover:bg-zinc-800">Log out</Button>} />
      <section className="mx-auto max-w-7xl py-10 md:py-16">
        {loading && <Card className="rounded-[2rem] border-rose-100 bg-white shadow-xl shadow-rose-200/30"><CardContent className="p-8 text-center"><Badge>Loading dashboard</Badge><h1 className="mt-5 text-4xl font-black">Checking your account…</h1><p className="mt-3 text-zinc-600">Loading your Supabase profile and API key.</p></CardContent></Card>}
        {!loading && errorMessage && <Card className="rounded-[2rem] border-rose-100 bg-white shadow-xl shadow-rose-200/30"><CardContent className="p-8"><MessageBox type="error">{errorMessage}</MessageBox><Button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-2xl bg-[#ff5864] font-black text-white hover:bg-[#ff2a4e]">Reload</Button></CardContent></Card>}
        {!loading && !errorMessage && (
          <div>
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <Badge tone={isPaid ? "green" : "rose"}>{account.label}</Badge>
                <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">Welcome, {displayName}.</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">This is your NinjaSwiper dashboard. It shows your API key, plan, subscription status, and swipe usage.</p>
              </div>
              {!isPaid && <Button type="button" onClick={() => onNavigate("payment")} className="h-14 rounded-2xl bg-[#ff5864] px-7 text-base font-black text-white shadow-lg shadow-rose-300/50 hover:bg-[#ff2a4e]">{getBillingActionLabel(isPaid)}</Button>}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="rounded-[2rem] border-rose-100 bg-white shadow-xl shadow-rose-200/30">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff5864]">API key</p><h2 className="mt-2 text-3xl font-black">Connect your extension</h2><p className="mt-2 max-w-xl leading-7 text-zinc-600">Paste this key into the NinjaSwiper extension. The extension will ask ninjaswiper.com for swipe allowance before continuing.</p></div>
                    <div className={cn("rounded-full px-3 py-1 text-xs font-black", isPaid ? "bg-emerald-50 text-emerald-700" : account.tone === "blocked" ? "bg-red-50 text-red-700" : "bg-rose-50 text-[#ff5864]")}>{isPaid ? "PREMIUM" : account.tone === "blocked" ? "LIMIT REACHED" : "TRIAL"}</div>
                  </div>
                  <div className="mt-6 rounded-3xl bg-zinc-950 p-4 text-white"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><code className="break-all text-sm font-bold text-rose-100">{profile?.api_key}</code><Button type="button" onClick={handleCopyKey} className="rounded-2xl bg-white px-5 font-black text-zinc-950 hover:bg-rose-50"><Icon name="copy" className="mr-2 h-4 w-4" /> {copied ? "Copied" : "Copy key"}</Button></div></div>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl bg-rose-50/70 p-5"><p className="text-sm font-bold text-zinc-500">Plan</p><p className="mt-1 text-2xl font-black">{isPaid ? "Premium" : "Trial"}</p></div>
                    <div className="rounded-3xl bg-rose-50/70 p-5"><p className="text-sm font-bold text-zinc-500">Swipes used</p><p className="mt-1 text-2xl font-black">{swipesUsed}</p></div>
                    <div className="rounded-3xl bg-rose-50/70 p-5"><p className="text-sm font-bold text-zinc-500">Swipes left</p><p className="mt-1 text-2xl font-black">{account.swipesLeft}</p></div>
                  </div>
                  {!isPaid && <div className="mt-6"><div className="mb-2 flex justify-between text-sm font-black text-zinc-500"><span>Trial usage</span><span>{swipesUsed}/{freeLimit}</span></div><div className="h-3 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-[#ff5864]" style={{ width: `${progress}%` }} /></div></div>}
                </CardContent>
              </Card>
              <div className="grid gap-5">
                <Card className="rounded-[2rem] border-rose-100 bg-zinc-950 text-white shadow-xl shadow-zinc-300/40"><CardContent className="p-6 md:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.22em] text-rose-300">Subscription</p><h2 className="mt-2 text-3xl font-black">{isPaid ? "Premium is active" : account.tone === "blocked" ? "Trial ended" : "Upgrade when ready"}</h2></div><Icon name={isPaid ? "shield" : "zap"} className="h-8 w-8 text-rose-300" /></div><p className="mt-4 leading-7 text-white/65">{isPaid ? "Your Premium subscription is active. You can cancel your subscription from the billing page." : account.tone === "blocked" ? "This account has used all trial swipes. The extension should now block swiping and route the user to Stripe." : "Trial users can use 200 swipes. After that, route them to Stripe Checkout to activate Premium."}</p><Button type="button" onClick={() => onNavigate("payment")} className="mt-6 h-12 w-full rounded-2xl bg-white font-black text-zinc-950 hover:bg-rose-50">{getBillingActionLabel(isPaid)}</Button></CardContent></Card>
                <Card className="rounded-[2rem] border-rose-100 bg-white shadow-sm"><CardContent className="p-6 md:p-8"><p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff5864]">Account data</p><div className="mt-5 space-y-4 text-sm font-semibold text-zinc-600"><div className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5864]" /> Email: {profile?.email}</div><div className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5864]" /> Subscription status: {profile?.subscription_status}</div><div className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5864]" /> Stripe customer: {profile?.stripe_customer_id || "Not connected yet"}</div></div></CardContent></Card>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function PaymentLayout({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const isPaid = getIsPremium(profile);

  useEffect(() => {
    let mounted = true;
    async function loadPaymentPage() {
      setLoading(true);
      setErrorMessage("");
      const user = await getCurrentUser();
      if (!user) {
        if (mounted) onNavigate("login");
        return;
      }
      try {
        const loadedProfile = await getCurrentProfile(user.id);
        if (mounted) setProfile(loadedProfile);
      } catch (error: any) {
        if (mounted) setErrorMessage(error.message || "Could not load your account details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPaymentPage();
    return () => { mounted = false; };
  }, [onNavigate]);

  async function handleCheckout() {
    setActionLoading(true);
    setErrorMessage("");
    try {
      const endpoint = isPaid ? "/api/stripe/create-customer-portal" : "/api/stripe/create-checkout-session";
      const data = await postAuthedJson(endpoint);
      window.location.href = data.url;
    } catch (error: any) {
      setErrorMessage(error.message || "Could not open Stripe.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff7f8] px-6 py-6 text-zinc-950">
      <BrandNav subtitle="Premium checkout" onNavigate={onNavigate} right={<Button type="button" variant="ghost" onClick={() => onNavigate("dashboard")} className="rounded-2xl font-black">Back to dashboard</Button>} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Badge tone={isPaid ? "green" : "rose"}>{isPaid ? "Premium active" : "Upgrade to Premium"}</Badge>
          <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">Unlock unlimited NinjaSwiper access.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">Premium removes the 200-swipe trial limit and keeps your API key active while your Stripe subscription is active.</p>
          <div className="mt-8 grid max-w-md gap-3 text-sm font-bold text-zinc-500"><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Unlimited swipe allowance</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Same API key after upgrade</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Secure checkout through Stripe</span></div>
        </motion.div>
        <Card className="rounded-[2rem] border-rose-100 bg-white shadow-2xl shadow-rose-200/40"><CardContent className="p-6 md:p-8">
          {loading && <div className="py-10 text-center"><Badge>Loading payment page</Badge><h2 className="mt-4 text-3xl font-black">Checking your account…</h2></div>}
          {!loading && errorMessage && <div className="mb-5"><MessageBox type="error">{errorMessage}</MessageBox></div>}
          {!loading && !errorMessage && isPaid && <div><Badge tone="green">Already Premium</Badge><h2 className="mt-4 text-3xl font-black">Your subscription is active.</h2><p className="mt-3 leading-7 text-zinc-600">{getUnsubscribeHelpText(true)}</p><div className="mt-5 rounded-3xl bg-rose-50/70 p-5 text-sm font-semibold leading-7 text-zinc-600">Cancelling stops future renewals while keeping your current Premium access active until the end of the billing period. Billing and payment details are handled securely by Stripe.</div><Button type="button" disabled={actionLoading} onClick={handleCheckout} className="mt-6 h-13 w-full rounded-2xl bg-[#ff5864] py-6 text-base font-black text-white shadow-lg shadow-rose-300/40 hover:bg-[#ff2a4e]">{actionLoading ? "Opening Stripe…" : "Unsubscribe"}</Button></div>}
          {!loading && !errorMessage && !isPaid && <div><div className="mb-8 flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff5864]">Premium plan</p><h2 className="mt-2 text-3xl font-black">NinjaSwiper Premium</h2><p className="mt-2 leading-7 text-zinc-600">Upgrade the account below and keep using your current API key.</p></div><div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-[#ff5864]">{STRIPE_PREMIUM_PRICE_LABEL}</div></div><div className="rounded-3xl bg-zinc-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-200">Account</p><p className="mt-2 break-all text-sm font-semibold text-white/80">{profile?.email}</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-rose-200">API key</p><code className="mt-2 block break-all text-sm font-bold text-white">{profile?.api_key}</code></div><div className="mt-6 space-y-3">{["Unlimited swipe allowance", "Passport city cycling", "Random breaks", "Premium API key status"].map((perk) => <div key={perk} className="flex items-center gap-3 text-sm font-bold text-zinc-600"><Icon name="check" className="h-5 w-5 text-[#ff5864]" /> {perk}</div>)}</div><Button type="button" disabled={actionLoading} onClick={handleCheckout} className="mt-8 h-13 w-full rounded-2xl bg-[#ff5864] py-6 text-base font-black text-white shadow-lg shadow-rose-300/40 hover:bg-[#ff2a4e]">{actionLoading ? "Opening Stripe…" : `Continue to Stripe — ${STRIPE_PREMIUM_PRICE_LABEL}`}</Button><p className="mt-4 text-center text-xs font-semibold text-zinc-500">You will be redirected to Stripe Checkout.</p></div>}
        </CardContent></Card>
      </section>
    </main>
  );
}

function TermsLayout({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  return (
    <main className="min-h-screen bg-[#fff7f8] px-6 py-6 text-zinc-950">
      <BrandNav subtitle="Terms and Conditions" onNavigate={onNavigate} right={<Button type="button" variant="ghost" onClick={() => onNavigate("signup")} className="rounded-2xl font-black">Create account</Button>} />
      <section className="mx-auto max-w-5xl py-14 md:py-20">
        <Badge>Terms and Conditions</Badge>
        <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">NinjaSwiper Terms and Conditions.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">Last updated: May 2, 2026. These terms apply to the NinjaSwiper website, extension, API-key access, free trial, and Premium subscription model.</p>
        <Card className="mt-8 rounded-[2rem] border-rose-100 bg-white shadow-xl shadow-rose-200/30"><CardContent className="space-y-6 p-6 md:p-8">{termsSections.map(([title, body]) => <div key={title} className="rounded-3xl bg-rose-50/50 p-5"><h2 className="text-lg font-black text-zinc-950">{title}</h2><p className="mt-2 leading-7 text-zinc-600">{body}</p></div>)}</CardContent></Card>
      </section>
    </main>
  );
}

function ContactLayout({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  return (
    <main className="min-h-screen bg-[#fff7f8] px-6 py-6 text-zinc-950">
      <BrandNav subtitle="Contact support" onNavigate={onNavigate} right={<Button type="button" variant="ghost" onClick={() => onNavigate("home")} className="rounded-2xl font-black">Back home</Button>} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}><Badge>Contact us</Badge><h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">Need help with NinjaSwiper?</h1><p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">Reach out for account, billing, API key, extension, or setup questions. We’ll use this page as the public support contact for NinjaSwiper.</p><div className="mt-8 grid max-w-md gap-3 text-sm font-bold text-zinc-500"><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />API key and account help</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Billing and subscription support</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Extension troubleshooting</span></div></motion.div>
        <Card className="rounded-[2rem] border-rose-100 bg-white shadow-2xl shadow-rose-200/40"><CardContent className="p-6 md:p-8"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff5864]">Support email</p><h2 className="mt-2 text-3xl font-black">Contact NinjaSwiper</h2></div><div className="rounded-2xl bg-rose-50 p-3 text-[#ff5864]"><Icon name="key" className="h-6 w-6" /></div></div><div className="rounded-3xl bg-zinc-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-200">Email</p><a href="mailto:contact@ninjaswiper.com" className="mt-2 block break-all text-2xl font-black text-white hover:text-rose-200">contact@ninjaswiper.com</a></div><div className="mt-6 space-y-3 text-sm font-semibold text-zinc-600"><div className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5864]" /> Include the email address connected to your NinjaSwiper account.</div><div className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5864]" /> For extension issues, include what page you were on and what error you saw.</div><div className="flex items-start gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5864]" /> For billing issues, do not send full card details. Stripe handles payment details securely.</div></div></CardContent></Card>
      </section>
    </main>
  );
}

function AuthLayout({ mode, onNavigate }: { mode: "login" | "signup"; onNavigate: (route: RouteName) => void }) {
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function checkDuplicateAccountByPassword() {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) {
      await supabase.auth.signOut();
      return true;
    }
    return false;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!email.trim() || !password) return setErrorMessage("Please enter your email and password.");
    if (isSignup && !acceptedTerms) return setErrorMessage("Please agree to the Terms and Conditions to create an account.");
    if (isSignup && password !== confirmPassword) return setErrorMessage("Passwords do not match.");
    if (password.length < 6) return setErrorMessage("Password must be at least 6 characters.");
    setLoading(true);
    try {
      if (isSignup) {
        const alreadyExistsWithSamePassword = await checkDuplicateAccountByPassword();
        if (alreadyExistsWithSamePassword) {
          setErrorMessage("Account already exists. Please log in instead.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: `${SITE_URL}/dashboard` },
        });
        if (error) throw error;
        if (data?.user?.identities && data.user.identities.length === 0) {
          await supabase.auth.signOut();
          setErrorMessage("Account already exists. Please log in instead.");
          return;
        }
        if (!data.session) {
          setSuccessMessage("Account created. Please check your email to confirm your account before logging in.");
          return;
        }
        setSuccessMessage("Account created. Loading your dashboard…");
        setTimeout(() => onNavigate("dashboard"), 450);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      onNavigate("dashboard");
    } catch (error: any) {
      setErrorMessage(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff7f8] px-6 py-6 text-zinc-950">
      <BrandNav subtitle="Smart Tinder automation" onNavigate={onNavigate} right={<Button type="button" variant="ghost" onClick={() => onNavigate(isSignup ? "login" : "signup")} className="rounded-2xl font-black">{isSignup ? "Log in" : "Create account"}</Button>} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}><Badge>{isSignup ? "Create your free API key" : "Welcome back"}</Badge><h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">{isSignup ? "Start your 200-swipe free trial." : "Log in to manage your API key."}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">{isSignup ? "Create an account for ninjaswiper.com, get an API key, and connect it to the NinjaSwiper extension." : "Access your dashboard, copy your API key, check your swipe allowance, and manage your subscription from your billing page."}</p><div className="mt-8 grid max-w-md gap-3 text-sm font-bold text-zinc-500"><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />API key issued per account</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Free trial starts at 200 swipes</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Premium unlocks continued usage</span></div></motion.div>
        <Card className="rounded-[2rem] border-rose-100 bg-white shadow-2xl shadow-rose-200/40"><CardContent className="p-6 md:p-8"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff5864]">{isSignup ? "Sign up" : "Login"}</p><h2 className="mt-2 text-3xl font-black">{isSignup ? "Create account" : "Welcome back"}</h2></div><div className="rounded-2xl bg-rose-50 p-3 text-[#ff5864]"><Icon name="key" className="h-6 w-6" /></div></div><form className="space-y-4" onSubmit={handleSubmit}>{isSignup && <div><label className="text-sm font-black text-zinc-700" htmlFor="name">Name</label><input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-2 w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-semibold outline-none transition focus:border-[#ff5864] focus:bg-white" /></div>}<div><label className="text-sm font-black text-zinc-700" htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-semibold outline-none transition focus:border-[#ff5864] focus:bg-white" /></div><div><label className="text-sm font-black text-zinc-700" htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="mt-2 w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-semibold outline-none transition focus:border-[#ff5864] focus:bg-white" /></div>{isSignup && <div><label className="text-sm font-black text-zinc-700" htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" className="mt-2 w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-semibold outline-none transition focus:border-[#ff5864] focus:bg-white" /></div>}{isSignup && <label className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-sm font-semibold leading-6 text-zinc-600"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4 accent-[#ff5864]" /><span>I agree to the <button type="button" onClick={() => onNavigate("terms")} className="font-black text-[#ff5864] hover:text-[#ff2a4e]">Terms and Conditions</button>.</span></label>}{errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}{successMessage && <MessageBox type="success">{successMessage}</MessageBox>}<Button type="submit" disabled={loading} className="h-13 w-full rounded-2xl bg-[#ff5864] py-6 text-base font-black text-white shadow-lg shadow-rose-300/40 hover:bg-[#ff2a4e] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none">{loading ? "Please wait…" : isSignup ? "Create free account" : "Log in"}</Button>{!isSignup && <div className="text-right"><button type="button" onClick={() => onNavigate("forgotPassword")} className="text-sm font-black text-[#ff5864] hover:text-[#ff2a4e]">Forgot password?</button></div>}</form><p className="mt-6 text-center text-sm font-semibold text-zinc-500">{isSignup ? "Already have an account?" : "No account yet?"} <button type="button" onClick={() => onNavigate(isSignup ? "login" : "signup")} className="font-black text-[#ff5864] hover:text-[#ff2a4e]">{isSignup ? "Log in" : "Start free trial"}</button></p></CardContent></Card>
      </section>
    </main>
  );
}

function ForgotPasswordLayout({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!email.trim()) return setErrorMessage("Please enter your email address.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${SITE_URL}/update-password` });
      if (error) throw error;
      setSuccessMessage("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      setErrorMessage(error.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff7f8] px-6 py-6 text-zinc-950">
      <BrandNav subtitle="Smart Tinder automation" onNavigate={onNavigate} right={<Button type="button" variant="ghost" onClick={() => onNavigate("login")} className="rounded-2xl font-black">Back to login</Button>} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}><Badge>Recover access</Badge><h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">Reset your password.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">Enter the email connected to your NinjaSwiper account. Supabase will send a secure password reset link that opens the password update page.</p></motion.div>
        <Card className="rounded-[2rem] border-rose-100 bg-white shadow-2xl shadow-rose-200/40"><CardContent className="p-6 md:p-8"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff5864]">Password reset</p><h2 className="mt-2 text-3xl font-black">Send reset link</h2></div><div className="rounded-2xl bg-rose-50 p-3 text-[#ff5864]"><Icon name="key" className="h-6 w-6" /></div></div><form className="space-y-4" onSubmit={handleResetPassword}><div><label className="text-sm font-black text-zinc-700" htmlFor="reset-email">Email</label><input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-semibold outline-none transition focus:border-[#ff5864] focus:bg-white" /></div>{errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}{successMessage && <MessageBox type="success">{successMessage}</MessageBox>}<Button type="submit" disabled={loading} className="h-13 w-full rounded-2xl bg-[#ff5864] py-6 text-base font-black text-white shadow-lg shadow-rose-300/40 hover:bg-[#ff2a4e] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none">{loading ? "Sending…" : "Send reset link"}</Button></form><p className="mt-6 text-center text-sm font-semibold text-zinc-500">Remembered your password? <button type="button" onClick={() => onNavigate("login")} className="font-black text-[#ff5864] hover:text-[#ff2a4e]">Log in</button></p></CardContent></Card>
      </section>
    </main>
  );
}

function UpdatePasswordLayout({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!password || password.length < 6) return setErrorMessage("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setErrorMessage("Passwords do not match.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccessMessage("Password updated. Redirecting to dashboard…");
      setTimeout(() => onNavigate("dashboard"), 700);
    } catch (error: any) {
      setErrorMessage(error.message || "Could not update password. Open the reset link from your email and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff7f8] px-6 py-6 text-zinc-950">
      <BrandNav subtitle="Smart Tinder automation" onNavigate={onNavigate} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}><Badge>Choose a new password</Badge><h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">Create your new password.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">This is the page Supabase redirects users to after they click the reset link in their email.</p></motion.div>
        <Card className="rounded-[2rem] border-rose-100 bg-white shadow-2xl shadow-rose-200/40"><CardContent className="p-6 md:p-8"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-[0.22em] text-[#ff5864]">Update password</p><h2 className="mt-2 text-3xl font-black">Set new password</h2></div><div className="rounded-2xl bg-rose-50 p-3 text-[#ff5864]"><Icon name="shield" className="h-6 w-6" /></div></div><form className="space-y-4" onSubmit={handleUpdatePassword}><div><label className="text-sm font-black text-zinc-700" htmlFor="new-password">New password</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="mt-2 w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-semibold outline-none transition focus:border-[#ff5864] focus:bg-white" /></div><div><label className="text-sm font-black text-zinc-700" htmlFor="new-password-confirm">Confirm new password</label><input id="new-password-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" className="mt-2 w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 font-semibold outline-none transition focus:border-[#ff5864] focus:bg-white" /></div>{errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}{successMessage && <MessageBox type="success">{successMessage}</MessageBox>}<Button type="submit" disabled={loading} className="h-13 w-full rounded-2xl bg-[#ff5864] py-6 text-base font-black text-white shadow-lg shadow-rose-300/40 hover:bg-[#ff2a4e] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none">{loading ? "Updating…" : "Update password"}</Button></form></CardContent></Card>
      </section>
    </main>
  );
}

function SwipeDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="mx-auto w-full max-w-[360px] rounded-[1.75rem] border border-rose-100 bg-white p-5 shadow-2xl shadow-rose-200/50 sm:max-w-[390px]"
    >
      <div className="space-y-4 text-zinc-900">
        <div>
          <label className="mb-2 block text-sm font-semibold">Time between swipes (ms):</label>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-base">
            600
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Right swipe percentage (%):</label>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-base">
            80
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">API key:</label>
          <div className="truncate rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-400">
            ns_a275addf4b59fba64b7c5d755052
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-black text-green-600">
          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-green-500 text-xs text-white">
            ✓
          </span>
          <span>Premium key active — unlimited swipes.</span>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-zinc-300 text-xs text-white">
            ✓
          </span>
          <span className="shrink-0">Take breaks</span>
          <div className="h-1 flex-1 rounded-full bg-zinc-200">
            <div className="ml-[70%] h-4 w-4 -translate-y-1.5 rounded-full bg-zinc-300" />
          </div>
          <span className="font-black text-[#ff5864]">10%</span>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-zinc-300 text-xs text-white">
            ✓
          </span>
          <span>Change 📍 when out of profiles</span>
        </div>

        <div className="truncate rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-400">
          Amsterdam, Athens, Bern, Birmingham
        </div>

        <button className="h-14 w-full rounded-lg bg-[#ff2f5f] text-lg font-black text-white shadow-lg shadow-rose-300/60">
          Stop Swiping
        </button>

        <div className="text-center text-sm font-semibold text-[#ff5864]">
          ▶️ Swiping...
        </div>

        <div className="grid grid-cols-[44px_1fr_1fr_64px] items-center gap-x-3 gap-y-2 pt-3 text-center">
          <div />
          <div className="text-sm font-black">Session</div>
          <div className="text-sm font-black">Total</div>
          <div />

          <div className="text-2xl leading-none">❤️</div>
          <div className="text-base">258</div>
          <div className="text-base">312</div>
          <div className="row-span-2 flex items-center justify-center">
            <div className="h-14 w-14">
              <LogoMark />
            </div>
          </div>

          <div className="text-2xl leading-none">❌</div>
          <div className="text-base">68</div>
          <div className="text-base">79</div>
        </div>
      </div>
    </motion.div>
  );
}

function LandingPage({ navigate, handleNavClick, mobileMenuOpen, setMobileMenuOpen }: { navigate: (route: RouteName) => void; handleNavClick: (sectionId: string) => void; mobileMenuOpen: boolean; setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7f8] text-zinc-950">
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3"><LogoMark /><div><div className="text-lg font-black tracking-tight">NinjaSwiper</div><div className="text-xs font-semibold text-zinc-500">Smart Tinder automation</div></div></div>
        <div className="hidden items-center gap-8 text-sm font-semibold text-zinc-600 md:flex">{navItems.map((item) => <button key={item.sectionId} type="button" onClick={() => handleNavClick(item.sectionId)} className="hover:text-[#ff5864]">{item.label}</button>)}</div>
        <div className="flex items-center gap-3"><Button type="button" variant="ghost" onClick={() => navigate("login")} className="hidden rounded-2xl font-bold md:inline-flex">Log in</Button><Button type="button" onClick={() => navigate("signup")} className="rounded-2xl bg-zinc-950 px-5 font-bold text-white hover:bg-zinc-800">Get API key</Button><Button type="button" variant="ghost" size="icon" className="md:hidden" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><Icon name="menu" className="h-5 w-5" /></Button></div>
        {mobileMenuOpen && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="absolute left-4 right-4 top-[76px] rounded-3xl border border-rose-100 bg-white p-3 shadow-2xl shadow-rose-200/40 md:hidden"><div className="grid gap-1">{navItems.map((item) => <button key={item.sectionId} type="button" onClick={() => handleNavClick(item.sectionId)} className="rounded-2xl px-4 py-3 text-left text-sm font-black text-zinc-700 hover:bg-rose-50 hover:text-[#ff5864]">{item.label}</button>)}<button type="button" onClick={() => navigate("login")} className="rounded-2xl px-4 py-3 text-left text-sm font-black text-zinc-700 hover:bg-rose-50 hover:text-[#ff5864]">Log in</button></div></motion.div>}
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge>Free trial includes 200 swipes</Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-zinc-950 md:text-7xl">Swipe smarter with your personal ninja.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">Automate your Tinder swiping with custom timing, right-swipe percentage, random breaks, Passport city cycling, and API-key access built for free trials and premium users.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button type="button" onClick={() => navigate("signup")} className="h-14 rounded-2xl bg-[#ff5864] px-7 text-base font-black text-white shadow-lg shadow-rose-300/50 hover:bg-[#ff2a4e]">Start free trial <Icon name="arrow-right" className="ml-2 h-5 w-5" /></Button><Button type="button" variant="outline" onClick={() => scrollToSection("pricing")} className="h-14 rounded-2xl border-rose-200 bg-white px-7 text-base font-black hover:bg-rose-50">View pricing</Button></div>
          <div className="mt-8 flex max-w-xl flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-zinc-500"><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />No setup stress</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />API key unlock</span><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff5864]" />Premium ready</span></div>
        </motion.div>
        <SwipeDemo />
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16"><div className="max-w-2xl"><p className="text-sm font-black uppercase tracking-[0.25em] text-[#ff5864]">Features</p><h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Built around the extension you already tested.</h2><p className="mt-4 text-lg leading-8 text-zinc-600">The website should feel like the app: compact, direct, red-and-black branding, clear status, and simple controls.</p></div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{featureCards.map((feature) => <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} body={feature.body} />)}</div></section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-16"><div className="rounded-[2rem] bg-zinc-950 p-6 text-white shadow-2xl shadow-zinc-300/50 md:p-10"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-sm font-black uppercase tracking-[0.25em] text-rose-300">Pricing</p><h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Start free. Upgrade when ready.</h2></div><p className="max-w-md leading-7 text-white/60">The trial gives users a real taste of NinjaSwiper, then premium unlocks continued swiping through their API key.</p></div><div className="mt-10 grid gap-5 lg:grid-cols-2">{plans.map((plan) => <div key={plan.name} className={cn("rounded-3xl p-6", plan.featured ? "bg-white text-zinc-950" : "bg-white/8 text-white")}><div className="flex items-start justify-between gap-4"><div><h3 className="text-2xl font-black">{plan.name}</h3><p className={plan.featured ? "text-zinc-500" : "text-white/55"}>{plan.detail}</p></div>{plan.featured && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-[#ff5864]">POPULAR</span>}</div><div className="mt-6 flex items-end gap-2"><span className="text-5xl font-black">{plan.price}</span>{plan.price !== "Free" && <span className="pb-2 text-zinc-500">/mo</span>}</div><Button type="button" onClick={() => navigate(plan.featured ? "payment" : "signup")} className={cn("mt-6 h-12 w-full rounded-2xl font-black", plan.featured ? "bg-[#ff5864] text-white hover:bg-[#ff2a4e]" : "bg-white text-zinc-950 hover:bg-white/90")}>{plan.cta}</Button><div className="mt-6 space-y-3">{plan.perks.map((perk) => <div key={perk} className="flex items-center gap-3 text-sm font-semibold"><Icon name="check" className={cn("h-5 w-5", plan.featured ? "text-[#ff5864]" : "text-rose-300")} />{perk}</div>)}</div></div>)}</div></div></section>

      <section id="faq" className="mx-auto max-w-4xl px-6 py-16"><div className="text-center"><p className="text-sm font-black uppercase tracking-[0.25em] text-[#ff5864]">FAQ</p><h2 className="mt-3 text-4xl font-black tracking-tight">Simple answers before you start.</h2></div><div className="mt-10 space-y-4">{faqs.map(([question, answer]) => <Card key={question} className="rounded-3xl border-rose-100 bg-white/80 shadow-sm"><CardContent className="p-6"><h3 className="font-black text-zinc-950">{question}</h3><p className="mt-2 leading-7 text-zinc-600">{answer}</p></CardContent></Card>)}</div></section>

      <footer className="mx-auto max-w-7xl px-6 py-10"><div className="flex flex-col items-center justify-between gap-5 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row"><div className="flex items-center gap-3"><LogoMark /><div><div className="font-black">NinjaSwiper</div><div className="text-sm text-zinc-500">© 2026 ninjaswiper.com</div></div></div><div className="flex gap-5 text-sm font-semibold text-zinc-500"><button type="button" onClick={() => navigate("terms")} className="hover:text-[#ff5864]">Terms</button><button type="button" onClick={() => navigate("contact")} className="hover:text-[#ff5864]">Contact</button></div></div></footer>
    </main>
  );
}

export default function NinjaSwiperLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [route, setRoute] = useState<RouteName>(() => (typeof window === "undefined" ? "home" : getRouteFromPath(window.location.pathname)));

  const navigate = useCallback((nextRoute: RouteName) => {
    setRoute(nextRoute);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      const nextPath = routes[nextRoute] || routes.home;
      window.history.pushState({}, "", nextPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleNavClick(sectionId: string) {
    if (route !== "home") {
      navigate("home");
      setTimeout(() => scrollToSection(sectionId), 50);
      return;
    }
    scrollToSection(sectionId);
    setMobileMenuOpen(false);
  }

  if (route === "login" || route === "signup") return <AuthLayout mode={route} onNavigate={navigate} />;
  if (route === "forgotPassword") return <ForgotPasswordLayout onNavigate={navigate} />;
  if (route === "updatePassword") return <UpdatePasswordLayout onNavigate={navigate} />;
  if (route === "dashboard") return <DashboardLayout onNavigate={navigate} />;
  if (route === "payment") return <PaymentLayout onNavigate={navigate} />;
  if (route === "terms") return <TermsLayout onNavigate={navigate} />;
  if (route === "contact") return <ContactLayout onNavigate={navigate} />;

  return <LandingPage navigate={navigate} handleNavClick={handleNavClick} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />;
}
