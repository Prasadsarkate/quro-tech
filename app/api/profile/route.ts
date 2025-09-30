import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { full_name?: string; email?: string; age?: number | null; gender?: string }
    | null

  const full_name = body?.full_name?.trim()
  const email = body?.email?.trim()
  const age = typeof body?.age === 'number' ? (body?.age as number) : null
  const gender = body?.gender?.trim() || null

  if (!full_name) return new NextResponse('Missing name', { status: 400 })

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name, email: email || null, age: age ?? null, gender: gender || null })
    .select('*')
  if ((error as any)?.code === "PGRST205") {
    return new NextResponse(
      "Database not initialized. Please run the SQL scripts in scripts/sql to create required tables.",
      { status: 503 },
    )
  }
  if (error) {
    const msg = (error as any)?.message || ''
    // If columns don't exist yet, try a fallback upsert for just full_name so at least the name is saved.
    if (msg.toLowerCase().includes('column') || msg.toLowerCase().includes('does not exist')) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name })
        .select('id, full_name')
        .maybeSingle()
      if (fallbackError) return new NextResponse(fallbackError.message || 'Failed to save profile', { status: 400 })
      return NextResponse.json({ ok: true, fallback: true, profile: fallbackData ?? null })
    }

    return new NextResponse(error.message, { status: 400 })
  }
  // data should be an array (PostgREST returns array for upsert with select)
  const saved = Array.isArray(data) ? data[0] ?? null : (data as any)
  return NextResponse.json({ ok: true, profile: saved })
}
