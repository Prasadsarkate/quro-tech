import CertificateGenerator from "@/components/certificate-generator"

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Generate Your Certificate</h1>
        <p className="text-sm text-muted-foreground">
          After payment, paste your payment reference to issue your certificate. You must be logged in.
        </p>
      </div>
      <CertificateGenerator />
    </div>
  )
}
