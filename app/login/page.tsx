"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      window.location.href = "/profile"
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="flex justify-between items-center">
        <Link href="/forgot-password" className="text-sm text-primary underline">
          Forgot password?
        </Link>
        <p className="text-sm">
          No account?{" "}
          <Link href="/register" className="text-primary underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
