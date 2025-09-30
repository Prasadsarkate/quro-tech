"use client"

import { useCart } from "@/hooks/use-cart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { RazorpayCheckout } from "@/components/razorpay-checkout"

export default function CheckoutPage() {
  const { items, removeItem, clear } = useCart()
  const total = items.reduce((sum, i) => sum + i.price, 0)
  const [showPayment, setShowPayment] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handlePaymentSuccess = () => {
    clear()
    setSuccess(
      "Payment successful! Your certificates are being generated and will be available in your profile shortly.",
    )
    setShowPayment(false)
  }

  const razorpayItems = items.map((item, index) => ({
    id: `item-${index}`,
    name: item.title,
    // include both internship title and a human-readable duration label
    internship: item.title,
    durationLabel: item.durationLabel || (item.duration === "1-month" ? "1 Month" : item.duration === "2-months" ? "2 Months" : "Custom"),
    price: item.price,
    quantity: 1,
  }))

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-primary">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{success}</p>
            <Button onClick={() => (window.location.href = "/profile")} className="w-full">
              View My Certificates
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cart Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
              Your Cart
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground">Your cart is empty</p>
                <Button onClick={() => (window.location.href = "/")} variant="outline" className="mt-4">
                  Browse Certificates
                </Button>
              </div>
            ) : (
              <>
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.duration === "custom"
                          ? `${item.customHours || 0} hrs, ${item.customWeeks || 0} weeks`
                          : item.duration === "1-month"
                            ? "1 Month Duration"
                            : "2 Months Duration"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">₹{item.price}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(idx)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">₹{total}</span>
                  </div>

                  {!showPayment && (
                    <Button className="w-full" onClick={() => setShowPayment(true)} disabled={items.length === 0}>
                      Proceed to Payment
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        <div className="space-y-6">
          {showPayment && items.length > 0 ? (
            <RazorpayCheckout items={razorpayItems} total={total} onSuccess={handlePaymentSuccess} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Secure Payment</h4>
                    <p className="text-xs text-muted-foreground">
                      Complete your purchase using our secure Razorpay payment system
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Instant Generation</h4>
                    <p className="text-xs text-muted-foreground">
                      Certificates are generated immediately after successful payment
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">ISO Verification</h4>
                    <p className="text-xs text-muted-foreground">
                      Each certificate includes unique serial and QR code for verification
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Download & Share</h4>
                    <p className="text-xs text-muted-foreground">Access your certificates anytime from your profile</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
