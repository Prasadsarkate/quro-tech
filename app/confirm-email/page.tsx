"use client"

import React, { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ConfirmEmailPage() {
  const [checking, setChecking] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      setChecking(true)
      setMessage('Waiting for email confirmation...')
      for (let i = 0; i < 15 && !cancelled; i++) {
        try {
          const { data } = await supabase.auth.getUser()
          const user = data?.user ?? null
          // Supabase sets email_confirmed_at when email is confirmed in some setups
          // Fallback: if user exists and email is not null, consider verified
          if (user && (user.email || (user.user_metadata && (user.user_metadata as any).email_confirmed))) {
            // redirect to profile
            router.push('/profile')
            return
          }
        } catch (e) {
          // ignore and retry
        }
        await new Promise((r) => setTimeout(r, 2000))
      }
      if (!cancelled) setMessage('We could not detect verification automatically. Please try logging in or refresh this page after verifying your email.')
      setChecking(false)
    }
    poll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Confirming your email</h1>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {checking && <p className="text-sm">Checking... (this tab will redirect when your email is verified)</p>}
    </div>
  )
}
