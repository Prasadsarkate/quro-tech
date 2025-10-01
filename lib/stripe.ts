import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
  }
  _stripe = new Stripe(key, { apiVersion: "2025-08-27.basil", typescript: true })
  return _stripe
}

export const formatAmountForStripe = (amount: number): number => {
  // Convert rupees to paise (multiply by 100)
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  // Convert paise to rupees (divide by 100)
  return amount / 100
}
