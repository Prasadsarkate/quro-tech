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
    const { userId, items } = body || {}
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    if (!items || !Array.isArray(items)) return NextResponse.json({ error: "Missing items[]" }, { status: 400 })

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle()
    const fullName = (profile as any)?.full_name || "Participant"

    const created: any[] = []
    for (const item of items) {
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
        console.error("force-create cert error:", certErr)
        continue
      }

      created.push(cert)
    }

    return NextResponse.json({ ok: true, created })
  } catch (e) {
    console.error("dev/force-create-certs error:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
