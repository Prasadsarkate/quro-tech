import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getStripe } from "@/lib/stripe"
import crypto from "crypto"

function generateSerial(): string {
  const year = new Date().getFullYear()
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `QT-${year}-${rand}`
}

function normalizeInternshipTitle(raw: string) {
  if (!raw) return raw
  const s = raw.toLowerCase()
  if (s.includes('frontend')) return 'Frontend Developer Internship'
  if (s.includes('front-end')) return 'Frontend Developer Internship'
  if (s.includes('backend')) return 'Backend Developer Internship'
  if (s.includes('back-end')) return 'Backend Developer Internship'
  if (s.includes('full') && s.includes('stack')) return 'Full-Stack Developer Internship'
  if (s.includes('fullstack') || s.includes('full-stack')) return 'Full-Stack Developer Internship'
  if (s.includes('data')) return 'Data Science Internship'
  if (s.includes('devops')) return 'DevOps Internship'
  if (s.includes('ui')) return 'UI/UX Internship'
  // fallback: ensure it ends with 'Internship'
  if (s.includes('intern')) return raw
  return raw + ' Internship'
}

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment intent ID required" }, { status: 400 })
    }

    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Retrieve payment intent from Stripe
    let stripe
    try {
      stripe = getStripe()
    } catch (err) {
      console.error("Stripe not configured:", err)
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .eq("user_id", user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if already processed
    if (order.status === "completed") {
      return NextResponse.json({ message: "Payment already processed" })
    }

    // Get user profile for full name
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

    const fullName = profile?.full_name || "Student"

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      user_id: user.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      stripe_payment_intent_id: paymentIntentId,
      stripe_charge_id: paymentIntent.latest_charge as string,
      status: "succeeded",
    })

    if (paymentError) {
      console.error("Payment record error:", paymentError)
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
    }

    // Generate certificates for each item
    const certificates = []
    const items = order.items as any[]

    for (const item of items) {
      let serial = generateSerial()
      const internshipTitle = normalizeInternshipTitle(item.title || item.internship || '')

      // Ensure serial uniqueness
      for (let i = 0; i < 3; i++) {
        const { data: exists } = await supabase.from("certificates").select("id").eq("serial", serial).single()

        if (!exists) break
        serial = generateSerial()
      }

      const durationLabel =
        item.duration === "custom"
          ? `${item.customHours || 0} hrs, ${item.customWeeks || 0} weeks`
          : item.duration === "1-month"
            ? "1 Month"
            : "2 Months"

      const { data: certificate, error: certError } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          full_name: fullName,
          internship: internshipTitle,
          duration_label: durationLabel,
          custom_hours: item.duration === "custom" ? item.customHours || 0 : null,
          custom_weeks: item.duration === "custom" ? item.customWeeks || 0 : null,
          price: item.price,
          serial,
        })
        .select()
        .single()

      if (certError) {
        console.error("Certificate creation error:", certError)
        continue
      }

      certificates.push(certificate)
    }

    // Update order status
    await supabase.from("orders").update({ status: "completed" }).eq("id", order.id)

    return NextResponse.json({
      success: true,
      certificates,
      message: `Successfully generated ${certificates.length} certificate(s)`,
    })
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
