import { type NextRequest, NextResponse } from "next/server"
import { razorpayService } from "@/lib/razorpay"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Creating Razorpay order...")
    const { amount, currency = "INR", items } = await request.json()

    if (!amount || amount <= 0) {
      console.log("[v0] Invalid amount:", amount)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    console.log("[v0] Creating order for amount:", amount, "currency:", currency)

    // Create Razorpay order; include items and userId in notes for fallback
    const notes: any = { items: items || [] }

    try {
      const supabaseAuth = await createServerClient()
      const {
        data: { user },
        error: userError,
      } = await supabaseAuth.auth.getUser()
      const userId = user && !userError ? user.id : null
      if (userId) notes.user_id = userId
    } catch (e) {
      // ignore
    }

    // Pass notes via the order creation path: razorpayService will accept mutations on orderData
    const order = await (async () => {
      // create the order with notes by passing them through a temporary wrapper
      (razorpayService as any).__next_order_notes = notes
      try {
        return await razorpayService.createOrder(amount, currency)
      } finally {
        delete (razorpayService as any).__next_order_notes
      }
    })()
    console.log("[v0] Razorpay order created:", order.id)

    try {
      const supabaseAuth = await createServerClient()
      const {
        data: { user },
        error: userError,
      } = await supabaseAuth.auth.getUser()

      const userId = user && !userError ? user.id : null

      console.log("[v0] Storing order in database (userId:", userId, ")")

      // Always attempt to store the order record. If orders table doesn't exist, catch and continue.
      const { error: dbError } = await supabaseAuth.from("orders").insert({
        id: order.id,
        user_id: userId,
        amount: amount,
        currency: currency,
        status: "created",
        items: items,
        razorpay_order_id: order.id,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.log("[v0] Database storage failed (table may not exist or permission issue):", dbError.message)
        console.log("[v0] Continuing without database storage - this is normal for demo setups")
      } else {
        console.log("[v0] Order stored in database successfully")
      }
    } catch (dbError) {
      console.log("[v0] Database operation failed:", dbError)
      console.log("[v0] Continuing without database storage - this is normal for demo setups")
    }

    console.log("[v0] Order creation successful")
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayService.getKeyId(),
    })
  } catch (error) {
    console.error("[v0] Create order error:", error)
    return NextResponse.json(
      {
        error: "Failed to create order",
        // include error.message for local debugging; do not expose secrets in production
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
