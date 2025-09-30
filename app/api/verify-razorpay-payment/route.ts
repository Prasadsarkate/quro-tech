import { type NextRequest, NextResponse } from "next/server"
import { razorpayService, type RazorpayPaymentData } from "@/lib/razorpay"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const paymentData: RazorpayPaymentData = await request.json()
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentData

    // Verify payment signature
    const isValid = razorpayService.verifyPayment(paymentData)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Use Supabase service role key for server-side operations (bypass RLS)
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase service role configuration")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Try to find the order by razorpay_order_id regardless of user
    let order: any = null
    let orderFindError: any = null
    try {
      const res = await supabase.from("orders").select().eq("razorpay_order_id", razorpay_order_id).limit(1).maybeSingle()
      order = (res as any)?.data ?? null
      orderFindError = (res as any)?.error ?? null
    } catch (e) {
      orderFindError = e
    }

    // If orders table missing or lookup failed, try to fetch the Razorpay order directly
    if (orderFindError || !order) {
      try {
        const razorOrder = await razorpayService.fetchOrder(razorpay_order_id)
        // Parse notes for items and user_id
        order = {
          id: razorOrder.id,
          items: razorOrder.notes?.items || [],
          user_id: razorOrder.notes?.user_id || null,
        }
      } catch (e) {
        console.error("Order lookup error:", orderFindError || e)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
    }

    // Try to update the order status in the local orders table. If the table doesn't exist
    // or update fails, we will fallback to the `order` object we built from Razorpay.
    let updatedOrder: any = null
    try {
      const res = await supabase
        .from("orders")
        .update({
          status: "completed",
          razorpay_payment_id,
          razorpay_signature,
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpay_order_id)
        .select()
        .maybeSingle()

      updatedOrder = (res as any)?.data ?? null
      if ((res as any)?.error) {
        console.warn("Order update warning:", (res as any).error)
      }
    } catch (e) {
      console.warn("Order update exception (likely missing table):", e)
    }

    // Source for cert creation: prefer updatedOrder (local DB) if available, else fallback to order (from Razorpay)
    const sourceOrder = updatedOrder || order

    // Determine which user_id to use for certificate creation: prefer sourceOrder.user_id
    const targetUserId = sourceOrder?.user_id || null

    if (!targetUserId) {
      console.error("No user associated with order; cannot create certificate without user_id")
      return NextResponse.json({ error: "User not associated with order" }, { status: 400 })
    }

    // Try to get user's display name from profiles table
    let fullName = null
    try {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", targetUserId).maybeSingle()
      fullName = (profile as any)?.full_name ?? null
    } catch (e) {
      fullName = null
    }

    // Generate certificates for each item in the sourceOrder
    const certificates: any[] = []
    for (const item of sourceOrder.items || []) {
      const serial = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      // Map item fields into certificate schema
  // Normalize internship/title from multiple possible item shapes
  const internship = (item.internship || item.course || item.name || item.title || "Internship") as string
  const duration_label = (item.duration_label || item.duration || "N/A") as string
      const price = item.price ?? null

      const insertPayload: any = {
        serial,
        internship,
        duration_label,
        custom_hours: item.custom_hours ?? null,
        custom_weeks: item.custom_weeks ?? null,
        price: price,
        full_name: fullName || item.full_name || "Participant",
        user_id: targetUserId,
        issued_at: new Date().toISOString(),
      }

      const { data: certificate, error: certError } = await supabase
        .from("certificates")
        .insert(insertPayload)
        .select()
        .maybeSingle()

      if (certError) {
        console.error("Certificate creation error:", certError)
        continue
      }

      certificates.push(certificate)
    }

    return NextResponse.json({
      success: true,
      orderId: sourceOrder?.id ?? updatedOrder?.id ?? razorpay_order_id,
      paymentId: razorpay_payment_id,
      certificates,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
