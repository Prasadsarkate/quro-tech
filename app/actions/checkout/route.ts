import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import crypto from "crypto"

type Item = {
  internship?: string
  title: string
  course?: string
  name?: string
  duration: "1-month" | "2-months" | "custom"
  price: number
  customHours?: number
  customWeeks?: number
}

function generateSerial(): string {
  const year = new Date().getFullYear()
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `QT-${year}-${rand}`
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { items: Item[] } | null
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return new NextResponse("No items", { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Unauthorized. Please log in.", { status: 401 })

  // get profile for full name; if table missing, fall back safely
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()
  const fullName = (profileError as any)?.code === "PGRST205" ? "Student" : profile?.full_name || "Student"

  // issue certificates (ensure serial uniqueness)
  const certs = []
  for (const it of body.items) {
    let serial = generateSerial()
    // try a few times to avoid collision
    for (let i = 0; i < 3; i++) {
      const { data: exists, error: existsErr } = await supabase
        .from("certificates")
        .select("id")
        .eq("serial", serial)
        .maybeSingle()
      if ((existsErr as any)?.code === "PGRST205") {
        return new NextResponse(
          "Database not initialized. Please run the SQL scripts in scripts/sql to create required tables.",
          { status: 503 },
        )
      }
      if (!exists) break
      serial = generateSerial()
    }
    const durationLabel =
      it.duration === "custom"
        ? `${it.customHours || 0} hrs, ${it.customWeeks || 0} weeks`
        : it.duration === "1-month"
          ? "1 Month"
          : "2 Months"

    // Normalize internship/title to ensure certificates clearly state the internship stream
    const internshipValue = (it.internship || it.title || it.course || it.name || "Internship") as string

    const { error } = await supabase.from("certificates").insert({
      user_id: user.id,
      full_name: fullName,
      internship: internshipValue,
      duration_label: durationLabel,
      custom_hours: it.duration === "custom" ? it.customHours || 0 : null,
      custom_weeks: it.duration === "custom" ? it.customWeeks || 0 : null,
      price: it.price,
      serial,
    })
    if ((error as any)?.code === "PGRST205") {
      return new NextResponse(
        "Database not initialized. Please run the SQL scripts in scripts/sql to create required tables.",
        { status: 503 },
      )
    }
    if (error) {
      return new NextResponse(error.message, { status: 400 })
    }
    certs.push({ serial })
  }

  return NextResponse.json({ ok: true, certs })
}
