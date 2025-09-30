import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Suspense } from "react"
import { createServerClient } from '@/lib/supabase/server'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Quro Tech Certificates",
  description: "ISO-certified, QR-verifiable internship certificates by Quro Tech.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user ?? null

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} antialiased`}>
        {/* Announcement bar */}
        <div className="bg-primary text-primary-foreground text-center text-xs py-2">
          Best Internship Certificates • ISO 9001:2015 • QR & Serial Verification Included
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <header className="bg-primary text-primary-foreground shadow-sm">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                {/* Swap placeholder for real logo asset */}
                <img src="/images/quro-logo.jpg" alt="Quro Tech logo" className="h-7 w-7" />
                <span className="font-semibold text-lg">Quro Tech</span>
              </Link>
              <nav className="flex items-center gap-3">
                <Link href="/verify" className="text-sm px-3 py-1.5 rounded-md hover:bg-primary/20">
                  Verify Certificate
                </Link>
                <Link href="/profile" className="text-sm px-3 py-1.5 rounded-md hover:bg-primary/20">
                  Profile
                </Link>
                {!user ? (
                  <Link href="/login" className="text-sm px-3 py-1.5 rounded-md hover:bg-primary/20">
                    Login
                  </Link>
                ) : (
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="text-sm px-3 py-1.5 rounded-md hover:bg-primary/20">
                      Logout
                    </button>
                  </form>
                )}
                {/* Use accent color for CTA to stand out on primary header */}
                <Link href="/checkout" className="text-sm rounded-md bg-accent text-accent-foreground px-3 py-2">
                  Cart / Checkout
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t bg-card">
            <div className="mx-auto max-w-6xl px-4 py-8 grid gap-4 md:grid-cols-3">
              <div>
                <div className="font-semibold">Quro Tech</div>
                <p className="text-sm text-muted-foreground">
                  ISO-certified, digitally verifiable certificates for modern tech internships.
                </p>
              </div>
              <div>
                <div className="font-semibold">Trust & Security</div>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>• ISO 9001:2015 Certified</li>
                  <li>• Unique QR & Serial on every certificate</li>
                  <li>• Public verification on our website</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold">Quick Links</div>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>
                    <Link href="/#internships" className="hover:underline">
                      Browse Internships
                    </Link>
                  </li>
                  <li>
                    <Link href="/checkout" className="hover:underline">
                      Checkout
                    </Link>
                  </li>
                  <li>
                    <Link href="/verify" className="hover:underline">
                      Verify Certificate
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </footer>
        </Suspense>
      </body>
    </html>
  )
}
