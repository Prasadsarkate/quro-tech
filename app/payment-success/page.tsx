"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import CertificatePreview from "@/components/certificate-preview"

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Download = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const Share2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
)

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

type Certificate = {
  id: string
  serial: string
  internship: string
  duration_label: string
  full_name: string
  issued_at: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const paymentIntentId = searchParams.get("payment_intent")
  const orderId = searchParams.get("orderId")
  const paymentId = searchParams.get("paymentId")

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!paymentIntentId && !orderId) {
        setError("No payment information found")
        setIsLoading(false)
        return
      }

      try {
        // Prefer payment_intent (Stripe); fallback to orderId/paymentId for Razorpay flows
        const query = paymentIntentId ? `payment_intent=${encodeURIComponent(paymentIntentId)}` : `orderId=${encodeURIComponent(orderId || "")}&paymentId=${encodeURIComponent(paymentId || "")}`
        const response = await fetch(`/api/payment-success?${query}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch certificates")
        }

        setCertificates(data.certificates || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertificates()
  }, [paymentIntentId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Your Payment</h1>
          <p className="text-muted-foreground">Please wait while we generate your certificates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Payment Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => (window.location.href = "/checkout")} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button onClick={() => (window.location.href = "/profile")} className="flex-1">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground">
              Your {certificates.length} certificate{certificates.length > 1 ? "s have" : " has"} been generated
              successfully
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Transaction Complete</h3>
                  <p className="text-sm text-green-600">
                    {certificates.length} certificate{certificates.length > 1 ? "s" : ""} ready for download
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Payment ID</p>
                <p className="font-mono text-xs text-green-800">{paymentIntentId?.slice(-8)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Certificates</h2>
            <Button onClick={() => (window.location.href = "/profile")} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All in Profile
            </Button>
          </div>

          <div className="grid gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-primary">{cert.internship}</h3>
                    <p className="text-sm text-muted-foreground">{cert.duration_label}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      Serial: <span className="text-primary font-semibold">{cert.serial}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/verify?serial=${encodeURIComponent(cert.serial)}`, "_blank")}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${cert.full_name} - ${cert.internship} Certificate`,
                            text: `Check out my certificate from Quro Tech for ${cert.internship}`,
                            url: `${window.location.origin}/verify?serial=${encodeURIComponent(cert.serial)}`,
                          })
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>

                <CertificatePreview
                  name={cert.full_name}
                  internshipTitle={cert.internship}
                  durationLabel={cert.duration_label}
                  serial={cert.serial}
                  qrPayload={`${window.location.origin}/verify?serial=${encodeURIComponent(cert.serial)}`}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Download className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">Download</h4>
                <p className="text-xs text-muted-foreground">Save high-quality PNG versions of your certificates</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Share2 className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">Share</h4>
                <p className="text-xs text-muted-foreground">
                  Share your achievements on social media or with employers
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">Verify</h4>
                <p className="text-xs text-muted-foreground">
                  Anyone can verify your certificate using the QR code or serial number
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button onClick={() => (window.location.href = "/profile")}>
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                Browse More Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
