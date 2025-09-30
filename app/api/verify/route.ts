import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serial = searchParams.get("serial")
  if (!serial) return new NextResponse("Missing serial", { status: 400 })

  // Use service role to bypass RLS and return limited data
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await supabase
    .from("certificates")
    .select("full_name, internship, duration_label, serial, issued_at")
    .eq("serial", serial)
    .maybeSingle()

  if (error || !data) return new NextResponse("Not found", { status: 404 })
  return NextResponse.json(data)
}
