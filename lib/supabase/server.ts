import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Creates a Supabase server client with cookie handling
 * Don't put this client in a global variable - always create new instances
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are not configured, return a minimal guest-like client to
  // avoid throwing during server component rendering (for example, layout).
  // This keeps the app renderable in demo/dev environments without full
  // Supabase configuration. API routes should still use createServerClientSync
  // or createServerClient and handle the missing configuration as needed.
  if (!url || !key) {
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: null }
        },
      },
      // Minimal placeholder for from/select/update used elsewhere — they will
      // throw if used in this demo mode; this encourages using the server
      // client only when Supabase is configured.
      from() {
        return {
          select() {
            return { data: null, error: new Error("Supabase not configured") }
          },
          insert() {
            return { data: null, error: new Error("Supabase not configured") }
          },
          update() {
            return { data: null, error: new Error("Supabase not configured") }
          },
          order() { return this },
          limit() { return this },
          eq() { return this },
        }
      },
    } as any
  }

  return createSupabaseServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

/**
 * Creates a Supabase server client for API routes (synchronous version)
 * Use this in API routes where you can't use async/await for the client creation
 */
export function createServerClientSync() {
  // For API routes, we'll create a simpler client without cookie handling
  // since API routes handle cookies differently
  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for API routes
      },
    },
  })
}
