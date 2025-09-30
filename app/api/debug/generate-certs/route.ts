import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const body = await req.json()
    const { orderId } = body || {}
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

    const { data: order, error: orderErr } = await supabase.from("orders").select().eq("id", orderId).maybeSingle()
    if (orderErr || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const userId = order.user_id
    if (!userId) return NextResponse.json({ error: "Order has no user_id" }, { status: 400 })

    // fetch user profile name
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle()
    const fullName = (profile as any)?.full_name || "Participant"

    const certificates: any[] = []
    for (const item of order.items || []) {
      const serial = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const internship = item.course || item.name || "Certificate"
      const duration_label = item.duration_label || item.duration || "N/A"
      const price = item.price ?? null

      const { data: cert, error: certErr } = await supabase
        .from("certificates")
        .insert({
          serial,
          internship,
          duration_label,
          custom_hours: item.custom_hours ?? null,
          custom_weeks: item.custom_weeks ?? null,
          price,
          full_name: fullName,
          user_id: userId,
          issued_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle()

      if (certErr) {
        console.error("dev cert insert error:", certErr)
        continue
      }

      certificates.push(cert)
    }

    // mark order as completed
    await supabase.from("orders").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", orderId)

    return NextResponse.json({ ok: true, certificates })
  } catch (e) {
    console.error("dev/generate-certs error:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
