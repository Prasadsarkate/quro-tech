import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getStripe, formatAmountForStripe } from "@/lib/stripe"

type CartItem = {
  internship: string
  title: string
  duration: "1-month" | "2-months" | "custom"
  price: number
  customHours?: number
  customWeeks?: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items }: { items: CartItem[] } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
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

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0)
    const stripeAmount = formatAmountForStripe(totalAmount)

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: stripeAmount,
        currency: "INR",
        status: "pending",
        items: items,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create Stripe PaymentIntent
    let stripe
    try {
      stripe = getStripe()
    } catch (err) {
      console.error("Stripe not configured:", err)
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: "inr",
      metadata: {
        order_id: order.id,
        user_id: user.id,
        items_count: items.length.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update order with Stripe PaymentIntent ID
    await supabase.from("orders").update({ stripe_payment_intent_id: paymentIntent.id }).eq("id", order.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount: totalAmount,
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
