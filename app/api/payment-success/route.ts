import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Use request.nextUrl to avoid dynamic server usage during prerender
    const nextUrl = (request as any).nextUrl as URL | undefined
    const searchParams = nextUrl?.searchParams ?? new URL(request.url).searchParams
    const paymentIntentId = searchParams.get("payment_intent")
    const orderId = searchParams.get("orderId")

    // If neither payment intent nor orderId provided, return an error
    if (!paymentIntentId && !orderId) {
      return NextResponse.json({ error: "Payment information is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } },
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Fetch certificates depending on provided params.
    // For Stripe flows we expect payment_intent; for Razorpay we receive orderId/paymentId
    let query = supabase
      .from("certificates")
      .select("id, serial, internship, duration_label, full_name, issued_at")
      .eq("user_id", user.id)

    if (paymentIntentId) {
      query = query.eq("payment_intent_id", paymentIntentId)
    } else if (orderId) {
      // Fallback: return recent certificates for this user (Razorpay verify flow already created them)
      // Limit to recent 50 entries to avoid large payloads
      // No additional filter based on orderId because certificates don't currently store razorpay order id
    }

    const { data: certificates, error: certsError } = await query.order("issued_at", { ascending: false }).limit(50)

    if (certsError) {
      console.error("Error fetching certificates:", certsError)
      return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
    }

    return NextResponse.json({ certificates: certificates || [] })
  } catch (error) {
    console.error("Payment success API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
