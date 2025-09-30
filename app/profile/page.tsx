import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CertificatePreview from "@/components/certificate-preview"
import ProfileForm from "@/components/profile-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Certificate = {
  id: string
  serial: string
  internship: string
  duration_label: string
  custom_hours: number | null
  custom_weeks: number | null
  price: number
  full_name: string
  issued_at: string
}

export default async function ProfilePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let profileName: string | null = null
  let profileEmail: string | null = null
  let profileAge: number | null = null
  let profileGender: string | null = null
  let dbMissingProfiles = false
  try {
    // First try to load the full set of columns (email, age, gender).
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, age, gender")
      .eq("id", user.id)
      .maybeSingle()

    if ((profileError as any)?.code === "PGRST205") {
      // profiles table not initialized yet
      profileName = null
      dbMissingProfiles = true
    } else if (profileError) {
      const msg = (profileError as any)?.message || ''
      // If the error indicates missing columns, try a fallback that selects only full_name
      if (msg.toLowerCase().includes('column') || msg.toLowerCase().includes('does not exist')) {
        try {
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle()
          if (!fallbackError) {
            profileName = fallbackProfile?.full_name ?? null
          } else {
            console.log('[v0] profiles fallback error:', fallbackError.message)
            profileName = null
          }
        } catch (e: any) {
          console.log('[v0] profiles fallback threw:', e?.message || e)
          profileName = null
        }
      } else {
        console.log('[v0] profiles query error:', profileError.message)
        profileName = null
      }
    } else {
      profileName = profile?.full_name ?? null
      profileEmail = (profile as any)?.email ?? null
      profileAge = (profile as any)?.age ?? null
      profileGender = (profile as any)?.gender ?? null
    }
  } catch (err: any) {
    console.log("[v0] profiles query threw:", err?.message || err)
    profileName = null
  }

  let safeCerts: Certificate[] = []
  let dbMissingCerts = false
  try {
    const { data: certs, error: certsError } = await supabase
      .from("certificates")
      .select("id, serial, internship, duration_label, custom_hours, custom_weeks, price, full_name, issued_at")
      .eq('user_id', user.id)
      .order("issued_at", { ascending: false })

    if ((certsError as any)?.code === "PGRST205") {
      // certificates table not initialized yet
      safeCerts = []
      dbMissingCerts = true
    } else if (certsError) {
      console.log("[v0] certificates query error:", certsError.message)
      safeCerts = []
    } else {
      safeCerts = certs ?? []
    }
  } catch (err: any) {
    console.log("[v0] certificates query threw:", err?.message || err)
    safeCerts = []
  }

  const dbNotInitialized = dbMissingProfiles || dbMissingCerts

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Your Profile
        </h1>
        <p className="text-muted-foreground">
          Welcome{profileName ? `, ${profileName}` : ""}. Manage your certificates and account settings.
        </p>
      </div>
  {/* Profile edit form */}
      <ProfileForm
        initialName={profileName}
        initialEmail={profileEmail ?? user?.email ?? null}
        initialAge={profileAge}
        initialGender={profileGender}
        initialSaved={!!profileName}
        initialUserId={user.id}
      />

      {dbNotInitialized && (
        <div role="alert" className="rounded-lg border border-amber-400/40 bg-amber-50 text-amber-900 p-4 text-sm">
          <div className="font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Database not initialized
          </div>
          <p className="opacity-90 mt-1">
            Please run the SQL scripts in scripts/sql: 001_create_profiles.sql and 002_create_certificates.sql to create
            required tables and policies.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Your Certificates
          </h2>
          {safeCerts.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {safeCerts.length} certificate{safeCerts.length > 1 ? "s" : ""} earned
            </div>
          )}
        </div>

        {safeCerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-4">Start your learning journey and earn your first certificate</p>
            <Link href="/">
              <Button>Browse Certificates</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {safeCerts.map((c) => (
              <div key={c.id} className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-primary">{c.internship}</h3>
                    <p className="text-sm text-muted-foreground">{c.duration_label}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      Serial: <span className="text-primary font-semibold">{c.serial}</span>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold text-primary">₹{c.price}</div>
                    <div className="text-xs text-muted-foreground">{new Date(c.issued_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <CertificatePreview
                  name={c.full_name}
                  internshipTitle={c.internship}
                  durationLabel={c.duration_label}
                  serial={c.serial}
                  qrPayload={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/verify?serial=${encodeURIComponent(c.serial)}`}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
