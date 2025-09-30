"use client"

import React, { useState } from "react"

type Props = {
  initialName?: string | null
  initialEmail?: string | null
  initialAge?: number | null
  initialGender?: string | null
  initialSaved?: boolean
  initialUserId?: string | null
}

export default function ProfileForm({
  initialName,
  initialEmail,
  initialAge,
  initialGender,
  initialSaved,
  initialUserId,
}: Props) {
  const [name, setName] = useState<string>(initialName ?? "")
  const [email, setEmail] = useState<string>(initialEmail ?? "")
  const [age, setAge] = useState<number | "">(initialAge ?? "")
  const [gender, setGender] = useState<string>(initialGender ?? "")
  // initialSaved indicates the server already had a name on load.
  // We don't permanently lock inputs after a save — allow editing after refresh.
  const [saved, setSaved] = useState<boolean>(false) // session-local saved flag
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // localStorage key per-user so we can keep age/gender/email in-browser until DB migration
  const storageKey = initialUserId ? `profile:${initialUserId}` : null

  // On mount, if server didn't provide details, try loading saved details from localStorage
  React.useEffect(() => {
    if (!storageKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (initialName == null && parsed.full_name) setName(parsed.full_name)
        if (initialEmail == null && parsed.email) setEmail(parsed.email)
        if ((initialAge == null || initialAge === undefined) && parsed.age != null) setAge(parsed.age)
        if (initialGender == null && parsed.gender) setGender(parsed.gender)
      }
    } catch (e) {
      // ignore
    }
  }, [storageKey])

  function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setName(initialName ?? "")
    setEmail(initialEmail ?? "")
    setAge(initialAge ?? "")
    setGender(initialGender ?? "")
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const body = {
        full_name: name,
        email: email || null,
        age: age === "" ? null : age,
        gender: gender || null,
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const text = (json && (json.message || json.error)) || (await res.text())
        setMessage(`Save failed: ${text || res.status}`)
      } else {
        // If API returned a profile, update local fields so age/gender populate immediately.
        if (json && (json as any).profile) {
          const p = (json as any).profile
          setName((p.full_name as string) ?? name)
          setEmail((p.email as string) ?? email)
          setAge(typeof p.age === 'number' ? (p.age as number) : age)
          setGender((p.gender as string) ?? gender)
        }

        // If the API returned { fallback: true } it means only full_name was saved because
        // the DB is missing the email/age/gender columns. Notify the user.
        if (json && (json as any).fallback) {
          setMessage("Saved name only — run DB migration to persist email/age/gender (see scripts/003_add_profile_fields.sql)")
        } else {
          setMessage("Saved successfully")
        }

        // mark as saved for this session so we can show an Edit button
        setSaved(true)

        // persist to localStorage as a fallback so user sees values on refresh until migration applied
        if (storageKey) {
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ full_name: name, email: email || null, age: age === '' ? null : age, gender: gender || null }),
            )
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err: any) {
      setMessage(`Save error: ${err?.message || err}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

  <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Full name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Email</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Age</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={age === "" ? "" : String(age)}
              onChange={(e) => {
                const v = e.target.value
                if (v === "") setAge("")
                else setAge(Number(v))
              }}
              
              type="number"
              min={0}
              placeholder="e.g. 25"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Gender</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border rounded text-sm"
          >
            Reset
          </button>
          {saved && (
            <button
              onClick={(e) => {
                e.preventDefault()
                setSaved(false)
                setMessage(null)
              }}
              className="inline-flex items-center px-3 py-1 border rounded text-sm"
            >
              Edit
            </button>
          )}
        </div>
      </form>

      {message && <div className="mt-3 text-sm">{message}</div>}
    </div>
  )
}
