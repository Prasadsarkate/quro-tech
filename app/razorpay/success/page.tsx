import React from "react"

export default function RazorpaySuccessPage({ searchParams }: { searchParams: any }) {
  const { payment_id, order_id, signature } = searchParams || {}
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Payment Success</h1>
      <p className="text-sm">Payment ID: {payment_id}</p>
      <p className="text-sm">Order ID: {order_id}</p>
      <p className="text-sm">Signature: {signature}</p>
      <p className="text-sm text-muted-foreground">Note: This demo page shows the raw response. Verify payment on server for production.</p>
    </div>
  )
}
