import { NextResponse } from "next/server"
import { razorpayService } from "@/lib/razorpay"

export async function GET() {
  try {
    const result = await razorpayService.testCredentials()
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
