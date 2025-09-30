import crypto from "crypto"

export interface RazorpayOrderData {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export interface RazorpayPaymentData {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export class RazorpayService {
  private keyId: string
  private keySecret: string
  private isDemo: boolean

  constructor() {
    // Trim env values to avoid accidental trailing whitespace/newlines from copy-paste
    this.keyId = (process.env.RAZORPAY_KEY_ID || "").toString().trim() || "demo_key_id"
    this.keySecret = (process.env.RAZORPAY_KEY_SECRET || "").toString().trim() || "demo_key_secret"
    this.isDemo = !(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

    if (this.isDemo) {
      console.log("[v0] Running in demo mode - using mock Razorpay service")
    } else {
      // Log keyId but never print the secret; show masked info for debugging
      console.log("[v0] Running in production mode with real Razorpay credentials", { keyId: this.keyId, secretLength: this.keySecret.length })
    }
  }

  getKeyId(): string {
    return this.keyId
  }

  async createOrder(amount: number, currency = "INR", receipt?: string): Promise<RazorpayOrderData> {
    console.log("[v0] RazorpayService.createOrder called with:", { amount, currency, receipt, isDemo: this.isDemo })

    if (this.isDemo) {
      console.log("[v0] Creating mock Razorpay order for amount:", amount)
      const mockOrder = {
        id: `order_demo_${Date.now()}`,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        status: "created",
      }
      console.log("[v0] Mock order created:", mockOrder)
      return mockOrder
    }

    try {
      const orderData: any = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      }

      // If caller attached __next_order_notes on this service instance, include it
      try {
        const anyThis: any = this as any
        if (anyThis.__next_order_notes) {
          orderData.notes = anyThis.__next_order_notes
        }
      } catch (e) {
        // ignore
      }

      // include notes if provided in receipt parameter (we'll pass notes via receipt param sometimes)
      // (Note: createOrder callers may set orderData.notes externally by mutating this object)

      console.log("[v0] Making request to Razorpay API with data:", orderData)

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify(orderData),
      })

      console.log("[v0] Razorpay API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Razorpay API error:", errorText)
        throw new Error(`Failed to create Razorpay order: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] Razorpay order created successfully:", result)
      return result
    } catch (error) {
      console.error("[v0] Error in createOrder:", error)
      throw error
    }
  }

  // Fetch an existing Razorpay order by id
  async fetchOrder(orderId: string): Promise<any> {
    if (this.isDemo) {
      return { id: orderId, amount: 0, currency: "INR", status: "created", notes: {} }
    }

    try {
      const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`,
        },
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Razorpay fetchOrder failed: ${response.status} ${text}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("[v0] Error fetching Razorpay order:", error)
      throw error
    }
  }

  /**
   * Test credentials by making a minimal request to Razorpay and returning the raw response.
   * Useful for local debugging. Returns an object describing success or failure.
   */
  async testCredentials(): Promise<{ ok: boolean; status?: number; body?: any; error?: string }> {
    if (this.isDemo) {
      return { ok: true, body: { mock: true, message: "demo mode" } }
    }

    try {
      const orderData = { amount: 100, currency: "INR", receipt: `test_${Date.now()}` }
      console.log('[v0] Testing Razorpay credentials with data:', orderData)

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify(orderData),
      })

      const status = response.status
      const text = await response.text()
      let parsed: any = text
      try {
        parsed = JSON.parse(text)
      } catch (e) {
        // leave as text
      }

      if (!response.ok) {
        return { ok: false, status, body: parsed }
      }

      return { ok: true, status, body: parsed }
    } catch (error) {
      console.error('[v0] Error in testCredentials:', error)
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  verifyPayment(paymentData: RazorpayPaymentData): boolean {
    if (this.isDemo) {
      console.log("[v0] Mock payment verification - always returns true")
      return true
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentData

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", this.keySecret).update(body.toString()).digest("hex")

    return expectedSignature === razorpay_signature
  }
}

export const razorpayService = new RazorpayService()
