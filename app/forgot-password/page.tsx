"use client"

import React, { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/profile` : undefined,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setMessage("Password reset email sent. Check your inbox.")
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Sending..." : "Send reset email"}
        </Button>
      </form>
    </div>
  )
}
