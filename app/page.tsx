"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import CertificatePreview from "@/components/certificate-preview"
import { LoadingButton } from "@/components/loading-spinner"
import { CardSkeleton, HeroSkeleton } from "@/components/loading-skeleton"

type DurationOption = "1-month" | "2-months" | "custom"

const internships = [
  {
    slug: "frontend",
    title: "Frontend Developer Internship",
    description: "Modern web UI: React, accessibility, performance.",
  },
  {
    slug: "backend",
    title: "Backend Developer Internship",
    description: "APIs, databases, security, and reliability.",
  },
  {
    slug: "fullstack",
    title: "Full-Stack Developer Internship",
    description: "Ship end-to-end features with confidence.",
  },
  { slug: "datascience", title: "Data Science Internship", description: "Data wrangling, modeling, and insights." },
]

function priceFor(duration: DurationOption) {
  if (duration === "1-month") return 400
  if (duration === "2-months") return 600
  return 700
}

export default function HomePage() {
  const { addItem } = useCart()
  const [selectedDuration, setSelectedDuration] = useState<Record<string, DurationOption>>({})
  const [customHours, setCustomHours] = useState<Record<string, number>>({})
  const [customWeeks, setCustomWeeks] = useState<Record<string, number>>({})
  const [previewName, setPreviewName] = useState("Your Name")
  const [isLoading, setIsLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const onAddToCart = async (slug: string) => {
    setAddingToCart(slug)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const duration = selectedDuration[slug] || "1-month"
    const price = priceFor(duration)
    addItem({
      internship: slug,
      title: internships.find((i) => i.slug === slug)?.title || slug,
      duration,
      durationLabel:
        duration === "1-month"
          ? "1 Month"
          : duration === "2-months"
          ? "2 Months"
          : `${customHours[slug] || 0} hrs, ${customWeeks[slug] || 0} weeks`,
      price,
      customHours: duration === "custom" ? customHours[slug] || 0 : undefined,
      customWeeks: duration === "custom" ? customWeeks[slug] || 0 : undefined,
    })
    setAddingToCart(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-12 fade-in">
        <HeroSkeleton />
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="h-6 w-32 bg-muted rounded-full skeleton" />
            <div className="h-8 w-64 bg-muted rounded skeleton" />
            <div className="h-4 w-96 bg-muted rounded skeleton" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-16 fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border border-primary/20 shadow-2xl glow-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="relative grid gap-8 md:grid-cols-2 items-center p-8 md:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-medium backdrop-blur-sm border border-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>ISO 9001:2015 Certified</span>
              <span className="opacity-70">•</span>
              <span>Trusted Worldwide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              Official Internship Certificates from Quro Tech
            </h1>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Trusted by learners worldwide. Each certificate includes a unique QR and serial number for instant public
              verification. Choose 1 month (₹400), 2 months (₹600), or a customized certificate (₹700).
            </p>
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <a href="#internships">Browse Internships</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-3 text-base backdrop-blur-sm bg-transparent"
                asChild
              >
                <a href="/checkout">Go to Checkout</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {["Live mentor support", "Live classes", "Hands-on projects", "Team working"].map((feature, i) => (
                <span
                  key={i}
                  className="rounded-full px-4 py-2 text-sm bg-card/50 text-foreground ring-1 ring-primary/20 backdrop-blur-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="max-w-md space-y-3">
              <Label htmlFor="name" className="text-base font-medium">
                Preview with your name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Alex Kumar"
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                className="rounded-xl border-primary/20 focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
          {/* Hero image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
            <img
              src="/images/hero-certificate.jpg"
              alt="Sample certificate preview on desk"
              className="relative w-full rounded-2xl border border-primary/20 shadow-2xl hover:shadow-3xl transition-shadow duration-500"
            />
          </div>
        </div>
      </section>

      <section id="internships" className="space-y-8">
        <div className="text-center space-y-4">
          <Badge className="rounded-full px-4 py-2 bg-primary/10 text-primary border-primary/20">
            ISO 9001:2015 Certified
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Choose Your Internship</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add certificates to cart and purchase instantly with our secure checkout.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {internships.map((intern) => {
            const duration = selectedDuration[intern.slug] || "1-month"
            const price = priceFor(duration)
            const isAddingThisItem = addingToCart === intern.slug

            return (
              <Card
                key={intern.slug}
                className="rounded-2xl border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <span className="text-balance">{intern.title}</span>
                    <span className="text-primary font-bold text-2xl">₹{price}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">{intern.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Duration</Label>
                      <Select
                        value={duration}
                        onValueChange={(v: DurationOption) => setSelectedDuration((s) => ({ ...s, [intern.slug]: v }))}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-month">1 Month (₹400)</SelectItem>
                          <SelectItem value="2-months">2 Months (₹600)</SelectItem>
                          <SelectItem value="custom">Custom (₹700)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {duration === "custom" && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Custom Details</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            min={0}
                            placeholder="Hours"
                            value={customHours[intern.slug] || ""}
                            onChange={(e) => setCustomHours((s) => ({ ...s, [intern.slug]: Number(e.target.value) }))}
                            className="rounded-xl"
                          />
                          <Input
                            type="number"
                            min={0}
                            placeholder="Weeks"
                            value={customWeeks[intern.slug] || ""}
                            onChange={(e) => setCustomWeeks((s) => ({ ...s, [intern.slug]: Number(e.target.value) }))}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <LoadingButton
                      onClick={() => onAddToCart(intern.slug)}
                      isLoading={isAddingThisItem}
                      className="rounded-xl flex-1"
                    >
                      {isAddingThisItem ? "Adding..." : "Add to Cart"}
                    </LoadingButton>
                    <Button variant="outline" className="rounded-xl bg-transparent" asChild>
                      <a href="/checkout">Checkout</a>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Certificate Preview</Label>
                    <div className="rounded-xl overflow-hidden">
                      <CertificatePreview
                        name={previewName || "Your Name"}
                        internshipTitle={intern.title}
                        durationLabel={
                          duration === "custom"
                            ? `${customHours[intern.slug] || 0} hrs, ${customWeeks[intern.slug] || 0} weeks`
                            : duration === "1-month"
                              ? "1 Month"
                              : "2 Months"
                        }
                        serial="QT-PREVIEW-00000"
                        qrPayload="https://qurotech.example/verify/QT-PREVIEW-00000"
                        isPreview
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Why Quro Tech */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl p-4 bg-card ring-1 ring-accent/30 hover:shadow-md transition">
          <div className="font-semibold">ISO Certified</div>
          <p className="text-sm text-muted-foreground mt-1">
            Certificates aligned with ISO 9001:2015 standards for consistency and quality.
          </p>
        </div>
        <div className="rounded-xl p-4 bg-card ring-1 ring-accent/30 hover:shadow-md transition">
          <div className="font-semibold">QR & Serial</div>
          <p className="text-sm text-muted-foreground mt-1">
            Each certificate includes a unique QR and serial for public verification.
          </p>
        </div>
        <div className="rounded-xl p-4 bg-card ring-1 ring-accent/30 hover:shadow-md transition">
          <div className="font-semibold">Instant Issuance</div>
          <p className="text-sm text-muted-foreground mt-1">
            Buy and receive in your profile immediately after checkout.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "ISO Certified",
            desc: "Certificates aligned with ISO 9001:2015 standards for consistency and quality.",
          },
          { title: "QR & Serial", desc: "Each certificate includes a unique QR and serial for public verification." },
          { title: "Instant Issuance", desc: "Buy and receive in your profile immediately after checkout." },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 bg-gradient-to-br from-card to-card/50 ring-1 ring-primary/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300"
          >
            <div className="font-semibold text-lg mb-2">{item.title}</div>
            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Live Mentor Support",
            desc: "Get doubts resolved quickly with live mentor guidance.",
            gradient: "from-primary/10 to-primary/5",
          },
          {
            title: "Live Classes",
            desc: "Learn in real-time with structured, interactive sessions.",
            gradient: "from-accent/10 to-accent/5",
          },
          {
            title: "Hands-on Experience",
            desc: "Practice with assignments designed to build real skills.",
            gradient: "from-primary/10 to-primary/5",
          },
          {
            title: "Live Project Working",
            desc: "Ship a capstone project to showcase on your resume.",
            gradient: "from-accent/10 to-accent/5",
          },
          {
            title: "Team Working",
            desc: "Collaborate in teams and learn modern workflows.",
            gradient: "from-primary/10 to-primary/5",
          },
          {
            title: "Career Guidance",
            desc: "Resume tips, interview prep, and portfolio reviews.",
            gradient: "from-accent/10 to-accent/5",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`rounded-2xl p-6 bg-gradient-to-br ${item.gradient} ring-1 ring-primary/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300`}
          >
            <div className="font-semibold text-lg mb-2">{item.title}</div>
            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Certificate Gallery */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Certificate Gallery</h2>
        <p className="text-sm text-muted-foreground">
          See how your certificate will look. Each carries a gold seal, unique serial and QR.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <img
            src="/images/certificates/quro-standard.jpg"
            alt="Quro Tech standard certificate"
            className="w-full rounded-lg border"
          />
          <img
            src="/images/certificates/quro-gold.jpg"
            alt="Quro Tech gold certificate"
            className="w-full rounded-lg border"
          />
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-8 md:p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Contact & Support</h2>
        <div className="text-lg text-muted-foreground max-w-2xl mx-auto">
          <p>
            For buying-related queries, write to{" "}
            <a href="mailto:qurotechofficial@gmail.com" className="text-primary underline font-medium">
              qurotechofficial@gmail.com
            </a>
            .
          </p>
          <p className="text-sm text-muted-foreground mt-2">whatshap only +91 9921080226</p>

          <ul className="text-sm text-muted-foreground mt-4 space-y-1 list-disc list-inside">
            <li><strong>Payments:</strong> All payments are final and non-refundable unless required by law.</li>
            <li><strong>Community Guidelines:</strong> Be respectful. Harassment, hate speech, or disruptive behaviour will lead to removal.</li>
            <li><strong>Copyright:</strong> Course content and certificates are the intellectual property of Quro Tech. Unauthorized redistribution is prohibited.</li>
          </ul>
        </div>
        <Button size="lg" className="rounded-full px-8 py-3 text-base font-semibold" asChild>
          <a href="mailto:qurotechofficial@gmail.com">Contact Us</a>
        </Button>
      </section>
    </div>
  )
}
