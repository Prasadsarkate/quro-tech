export const metadata = {
  title: 'Refund Policy - Quro Tech',
  description: 'Refund policy for certificates and courses provided by Quro Tech.'
}

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Refund Policy</h1>
      <p className="text-sm text-muted-foreground mb-3">
        We strive to provide high-quality internship certificates and related services. Refunds are
        evaluated on a case-by-case basis. Generally, refunds are not provided for completed
        certificate issuance. If you believe you are eligible for a refund due to an error on our
        part or other exceptional circumstances, contact support within 14 days of purchase.
      </p>
      <h2 className="font-semibold mt-4">How to request a refund</h2>
      <ol className="list-decimal ml-6 text-sm mt-2 space-y-2">
  <li>Send an email to qurotechofficial@gmail.com with your order details.</li>
        <li>Include screenshots or evidence supporting your claim.</li>
        <li>Our team will review and respond within 5-7 business days.</li>
      </ol>
    </div>
  )
}
