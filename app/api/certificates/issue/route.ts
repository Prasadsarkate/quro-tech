import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

type Body = {
  fullName: string
  internship: string
  durationLabel: string
  paymentReference: string
  customHours?: number
  customWeeks?: number
}

function priceFor(label: string) {
  if (label === "1 Month") return 400
  if (label === "2 Months") return 600
  return 700 // Custom
}

function generateSerial(): string {
  const d = new Date()
  const y = String(d.getUTCFullYear()).slice(-2)
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const rand = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
  return `QT-${y}${m}-${rand(5)}-${Math.floor(Math.random() * 900 + 100)}`
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fullName, internship, durationLabel, paymentReference, customHours, customWeeks } = (await req.json()) as Body

  if (!fullName || !internship || !durationLabel) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }
  if (!paymentReference || typeof paymentReference !== "string" || paymentReference.trim().length < 6) {
    return NextResponse.json({ error: "Invalid or missing payment reference." }, { status: 400 })
  }

  const price = priceFor(durationLabel)

  let lastError: any = null
  for (let i = 0; i < 3; i++) {
    const serial = generateSerial()
    const insert = await supabase
      .from("certificates")
      .insert([
        {
          user_id: user.id,
          full_name: fullName,
          internship,
          duration_label: durationLabel,
          custom_hours: durationLabel === "Custom" ? (customHours ?? null) : null,
          custom_weeks: durationLabel === "Custom" ? (customWeeks ?? null) : null,
          price,
          serial,
        },
      ])
      .select("id, serial")
      .single()

    if (insert.data && !insert.error) {
      const verifyUrl = `${req.nextUrl.origin}/verify?serial=${encodeURIComponent(insert.data.serial)}`
      return NextResponse.json(
        { certificateId: insert.data.id, serial: insert.data.serial, verifyUrl },
        { status: 201 },
      )
    }

    // Handle missing table with a clear message
    if (insert.error?.message?.toLowerCase().includes("could not find the table")) {
      return NextResponse.json(
        {
          error:
            "Database not initialized. Please run scripts/sql/001_create_profiles.sql and scripts/sql/002_create_certificates.sql.",
          details: insert.error.message,
        },
        { status: 503 },
      )
    }

    // Retry on unique serial collision
    if ((insert.error as any)?.code === "23505") {
      lastError = insert.error
      continue
    }

    lastError = insert.error
    break
  }

  return NextResponse.json(
    { error: "Failed to issue certificate", details: lastError?.message || lastError },
    { status: 500 },
  )
}
