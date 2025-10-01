"use client"

import React, { useState } from "react"

export default function RazorpayCheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10000, currency: 'INR', items: [{ name: 'Sample Certificate', qty: 1 }] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Order creation failed')

      // Load Razorpay SDK
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options: any = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: 'Quro Tech',
          description: 'Certificate purchase',
          handler: function (response: any) {
            // On success redirect to success page with payment details (ideally verify on server)
            window.location.href = `/razorpay/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&signature=${response.razorpay_signature}`
          },
          prefill: { name: '', email: '' },
          theme: { color: '#F59E0B' },
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Razorpay Checkout (Demo)</h1>
      <p>This is a demo checkout page. Amount set to ₹100.00.</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button onClick={createOrder} disabled={loading} className="px-4 py-2 bg-primary text-white rounded">
        {loading ? 'Processing...' : 'Pay ₹100'}
      </button>
    </div>
  )
}
