"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function priceFor(label: string) {
  if (label === "1 Month") return 400
  if (label === "2 Months") return 600
  return 700
}

export default function CertificateGenerator() {
  const [fullName, setFullName] = useState("")
  const [internship, setInternship] = useState("frontend")
  const [durationLabel, setDurationLabel] = useState("1 Month")
  const [customHours, setCustomHours] = useState<number | "">("")
  const [customWeeks, setCustomWeeks] = useState<number | "">("")
  const [paymentReference, setPaymentReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ serial: string; verifyUrl: string } | null>(null)

  const price = priceFor(durationLabel)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      // map key to human-friendly internship label
      const internshipLabelMap: Record<string, string> = {
        frontend: "Frontend Developer Internship",
        backend: "Backend Developer Internship",
        fullstack: "Full-Stack Developer Internship",
        datascience: "Data Science Internship",
      }

      const res = await fetch("/api/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          internship: internshipLabelMap[internship] || internship,
          durationLabel,
          paymentReference,
          customHours: durationLabel === "Custom" ? Number(customHours || 0) : undefined,
          customWeeks: durationLabel === "Custom" ? Number(customWeeks || 0) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to issue certificate")
      } else {
        setResult({ serial: data.serial, verifyUrl: data.verifyUrl })
      }
    } catch (e: any) {
      setError(e?.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border ring-1 ring-primary/20 p-4 bg-card">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label>Internship</Label>
          <Select value={internship} onValueChange={setInternship}>
            <SelectTrigger>
              <SelectValue placeholder="Select internship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend Developer</SelectItem>
              <SelectItem value="backend">Backend Developer</SelectItem>
              <SelectItem value="fullstack">Full-Stack Developer</SelectItem>
              <SelectItem value="datascience">Data Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select value={durationLabel} onValueChange={setDurationLabel}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 Month">1 Month (₹400)</SelectItem>
              <SelectItem value="2 Months">2 Months (₹600)</SelectItem>
              <SelectItem value="Custom">Custom (₹700)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {durationLabel === "Custom" && (
          <>
            <div className="space-y-2">
              <Label>Custom Hours</Label>
              <Input
                type="number"
                min={0}
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g., 120"
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Weeks</Label>
              <Input
                type="number"
                min={0}
                value={customWeeks}
                onChange={(e) => setCustomWeeks(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g., 8"
              />
            </div>
          </>
        )}
        <div className="space-y-2 md:col-span-2">
          <Label>Payment Reference</Label>
          <Input
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="e.g. PAY-123ABC (from your payment)"
          />
          <p className="text-xs text-muted-foreground">
            We’ll verify this reference before issuing. For testing, any value with 6+ characters will pass.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={loading || !fullName || !paymentReference}>
          {loading ? "Issuing..." : "Verify & Issue"}
        </Button>
        <div className="text-sm text-muted-foreground">Price: ₹{price}</div>
      </div>

      {error && <div className="text-sm text-destructive">Error: {error}</div>}

      {result && (
        <div className="text-sm space-y-1">
          <div className="font-medium">Certificate Issued</div>
          <div>Serial: {result.serial}</div>
          <div>
            Verify at:{" "}
            <a className="text-primary underline break-all" href={result.verifyUrl}>
              {result.verifyUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
