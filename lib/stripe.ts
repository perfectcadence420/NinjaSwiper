import Stripe from "stripe";
import { requireEnv } from "./env";

export function createStripe() {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2024-12-18.acacia",
  });
}
