export const metadata = {
  title: 'How Quro Tech Works',
  description: 'Overview of how Quro Tech issues and verifies certificates.'
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">How Quro Tech Works</h1>
      <p className="text-sm text-muted-foreground mb-3">
        Quro Tech issues verified internship certificates with unique serials and QR codes.
        Each certificate is stored as a record in our database and can be verified publicly
        using the certificate serial or QR code which links to the verify page.
      </p>
      <h2 className="font-semibold mt-4">Issuance process</h2>
      <ol className="list-decimal ml-6 text-sm mt-2 space-y-2">
        <li>Student completes internship and assessments.</li>
        <li>Administrator generates certificate; a serial and QR are embedded.</li>
        <li>Certificate is stored, and the student receives a digital copy and QR link.</li>
      </ol>
    </div>
  )
}
