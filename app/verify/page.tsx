"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CertificatePreview from "@/components/certificate-preview"

type Verified = null | {
  full_name: string
  internship: string
  duration_label: string
  serial: string
  issued_at: string
}

export default function VerifyPage() {
  const [serial, setSerial] = useState("")
  const [verified, setVerified] = useState<Verified>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onVerify = async () => {
    setError(null)
    setLoading(true)
    setVerified(null)
    const res = await fetch(`/api/verify?serial=${encodeURIComponent(serial)}`)
    setLoading(false)
    if (!res.ok) {
      setError("Certificate not found.")
      return
    }
    const data = await res.json()
    setVerified(data)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Verify Certificate</h1>
        <p className="text-sm text-muted-foreground">Enter the certificate serial number to verify authenticity.</p>
      </div>

      <div className="flex items-center gap-2 justify-center">
        <Input
          className="w-full max-w-xl"
          placeholder="Enter serial e.g. QT-2025-AB123"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
        />
        <Button onClick={onVerify} disabled={!serial || loading}>
          {loading ? "Checking..." : "Verify"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {verified && (
        <div className="space-y-6">
          <p className="text-sm text-center">Certificate found. Issued at: {verified.issued_at ? new Date(verified.issued_at).toLocaleString() : 'Unknown'}</p>

          {/* Certificate preview full-width / large */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <CertificatePreview
                name={verified.full_name}
                internshipTitle={verified.internship}
                durationLabel={verified.duration_label}
                serial={verified.serial}
                qrPayload={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/verify?serial=${encodeURIComponent(verified.serial)}`
                    : ""
                }
                showActions={true}
                isPreview={false}
              />
            </div>
          </div>

          {/* Details card below the certificate */}
          <div className="max-w-4xl mx-auto p-6 border rounded-lg bg-background">
            <h3 className="text-xl font-semibold mb-3">Verification details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">Name:</span> {verified.full_name}</p>
                <p className="text-sm"><span className="font-medium">Internship:</span> {verified.internship}</p>
                <p className="text-sm"><span className="font-medium">Duration:</span> {verified.duration_label}</p>
                <p className="text-sm"><span className="font-medium">Issued at:</span> {verified.issued_at ? new Date(verified.issued_at).toLocaleDateString() : 'Unknown'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Proof of completion</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Hands-on project experience</li>
                  <li>Team collaboration and teamwork</li>
                  <li>Capstone / final assessment completed</li>
                  <li>Mentorship and reviews attended</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => window.open(`/verify?serial=${encodeURIComponent(verified.serial)}`, '_blank')} variant="outline">Open verify link</Button>
              <Button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/verify?serial=${encodeURIComponent(verified.serial)}`)}>Copy verify link</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
