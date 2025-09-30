"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface CartItem {
  id: string
  name: string
  course?: string
  internship?: string
  durationLabel?: string
  price: number
  quantity: number
}

interface RazorpayCheckoutProps {
  items: CartItem[]
  total: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const CreditCard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
)

const Smartphone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
    />
  </svg>
)

const Banknote = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
)

export function RazorpayCheckout({ items, total, onSuccess, onError }: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      console.log("[v0] Starting payment process for total:", total)

      // Create order
      const orderResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          items: items.map((item) => ({
            name: item.name,
            course: item.course || item.internship || item.name,
            duration_label: item.durationLabel || item.durationLabel || item.course || item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      console.log("[v0] Order response status:", orderResponse.status)

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text()
        console.log("[v0] Order creation failed:", errorText)
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()
      console.log("[v0] Order created successfully:", orderData)

      const isDemoMode = orderData.keyId === "demo_key_id"

      if (isDemoMode) {
        console.log("[v0] Demo mode detected - simulating payment success")
        // In demo mode, simulate successful payment after a short delay
        setIsProcessing(true)
        setTimeout(() => {
          router.push(`/payment-success?orderId=${orderData.orderId}&paymentId=demo_payment_${Date.now()}`)
          onSuccess?.()
          setIsProcessing(false)
        }, 2000)
        return
      }

      // Load Razorpay script for real payments
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK")
      }

      // Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Quro Tech Certificates",
  description: `Certificate${items.length > 1 ? "s" : ""} for ${items.map((item) => item.durationLabel || item.course || item.internship || item.name).join(", ")}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          setIsProcessing(true)

          try {
            // Verify payment
            const verifyResponse = await fetch("/api/verify-razorpay-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed")
            }

            const verifyData = await verifyResponse.json()

            // Redirect to success page
            router.push(`/payment-success?orderId=${verifyData.orderId}&paymentId=${verifyData.paymentId}`)
            onSuccess?.()
          } catch (error) {
            console.error("Payment verification error:", error)
            onError?.("Payment verification failed. Please contact support.")
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#8B5CF6",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setIsProcessing(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      onError?.(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Complete Payment
        </CardTitle>
        <CardDescription>Secure payment powered by Razorpay</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Order Summary</h3>
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.durationLabel || item.course || item.internship}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{item.price}</p>
                {item.quantity > 1 && <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>}
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span className="text-purple-600">₹{total}</span>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-600" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>All major cards accepted</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4 text-purple-600" />
            <span>UPI & Net Banking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Banknote className="h-4 w-4 text-orange-600" />
            <span>Wallets supported</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || isProcessing}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Creating Order...
            </>
          ) : isProcessing ? (
            <>
              <LoadingSpinner className="mr-2 h-5 w-5" />
              Processing Payment...
            </>
          ) : (
            <>Pay ₹{total}</>
          )}
        </Button>

        {/* Powered by Razorpay */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Powered by Razorpay
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
