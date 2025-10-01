"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"

const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  return (
    <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]}`} />
  )
}

const Download = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const Share2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
)

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const Award = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

type Props = {
  name: string
  internshipTitle: string
  durationLabel: string
  serial: string
  qrPayload: string
  isPreview?: boolean
  showActions?: boolean
}

export default function CertificatePreview({
  name,
  internshipTitle,
  durationLabel,
  serial,
  qrPayload,
  isPreview = false,
  showActions = false,
}: Props) {
  function normalizeInternshipTitle(raw: string) {
    if (!raw) return 'Internship'
    const s = raw.toLowerCase()
    if (s.includes('frontend')) return 'Frontend Developer Internship'
    if (s.includes('front-end')) return 'Frontend Developer Internship'
    if (s.includes('backend')) return 'Backend Developer Internship'
    if (s.includes('back-end')) return 'Backend Developer Internship'
    if (s.includes('full') && s.includes('stack')) return 'Full-Stack Developer Internship'
    if (s.includes('fullstack') || s.includes('full-stack')) return 'Full-Stack Developer Internship'
    if (s.includes('data')) return 'Data Science Internship'
    if (s.includes('devops')) return 'DevOps Internship'
    if (s.includes('ui')) return 'UI/UX Internship'
    if (s.includes('intern')) return raw
    return raw + ' Internship'
  }

  const displayTitle = normalizeInternshipTitle(internshipTitle || '')
  const [qr, setQr] = useState<string | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const gen = async () => {
      setIsLoadingQR(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 200))
      // Prefer canonical verify URL so scanning the QR opens the verify page with the serial prefilled
      const runtimeBase = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')
      // In local development, prefer explicit localhost so QR codes scanned during dev resolve to your machine
      const fallbackDevBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
      const base = runtimeBase || fallbackDevBase
      const verifyUrl = base ? `${base.replace(/\/$/, '')}/verify?serial=${encodeURIComponent(serial)}` : `/verify?serial=${encodeURIComponent(serial)}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayload || verifyUrl || serial || "QuroTech")}`
        if (!cancelled) {
          setQr(qrUrl)
          setIsLoadingQR(false)
        }
      } catch (e) {
        if (!cancelled) setIsLoadingQR(false)
      }
    }
    gen()
    return () => {
      cancelled = true
    }
  }, [qrPayload, serial])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 1200
      canvas.height = 850

      // Enhanced gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#ffffff")
      gradient.addColorStop(0.3, "#f8fafc")
      gradient.addColorStop(0.7, "#f1f5f9")
      gradient.addColorStop(1, "#e2e8f0")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Decorative border with rounded corners
      ctx.strokeStyle = "#0f172a"
      ctx.lineWidth = 12
      ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50)
      
      // Inner border with gradient
      const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      borderGradient.addColorStop(0, "#fbbf24")
      borderGradient.addColorStop(0.5, "#f59e0b")
      borderGradient.addColorStop(1, "#d97706")
      ctx.strokeStyle = borderGradient
      ctx.lineWidth = 6
      ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70)

      // Elegant header section
      const headerGradient = ctx.createLinearGradient(0, 35, 0, 120)
      headerGradient.addColorStop(0, "#1e293b")
      headerGradient.addColorStop(1, "#334155")
      ctx.fillStyle = headerGradient
      ctx.fillRect(35, 35, canvas.width - 70, 85)

  // Company name with shadow effect
  // Polished company title: gradient fill + subtle embossed shadow
  ctx.shadowColor = "rgba(0,0,0,0.18)"
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 3
  ctx.textAlign = "center"

  // gradient for title
  const titleGradient = ctx.createLinearGradient(canvas.width / 2 - 200, 0, canvas.width / 2 + 200, 0)
  titleGradient.addColorStop(0, "#fff")
  titleGradient.addColorStop(0.5, "#f8fafc")
  titleGradient.addColorStop(1, "#f3f4f6")

  ctx.font = "600 46px serif"
  ctx.fillStyle = titleGradient
  ctx.fillText("Quro Tech", canvas.width / 2, 98)
  // Removed subtitle under company name

      // Decorative medal / ribbon to the left of title
      const medalX = canvas.width / 2 - 320
      const medalY = 68
      // ribbon
      ctx.fillStyle = "#f59e0b"
      ctx.beginPath()
      ctx.moveTo(medalX - 10, medalY)
      ctx.lineTo(medalX + 6, medalY + 36)
      ctx.lineTo(medalX - 6, medalY + 36)
      ctx.closePath()
      ctx.fill()
      // circular medal
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(medalX + 8, medalY + 46, 28, 0, Math.PI * 2)
      ctx.fill()
      // inner gold circle
      ctx.fillStyle = "#f59e0b"
      ctx.beginPath()
      ctx.arc(medalX + 8, medalY + 46, 20, 0, Math.PI * 2)
      ctx.fill()
      // star inside medal
      ctx.fillStyle = "#fff"
      ctx.save()
      ctx.translate(medalX + 8, medalY + 46)
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * 8, -Math.sin((18 + i * 72) / 180 * Math.PI) * 8)
        ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * 4, -Math.sin((54 + i * 72) / 180 * Math.PI) * 4)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Watermark (very subtle)
      ctx.save()
      ctx.globalAlpha = 0.06
      ctx.font = "bold 84px serif"
      ctx.fillStyle = "#0f172a"
      ctx.translate(canvas.width / 2, canvas.height / 2 + 50)
      ctx.rotate(-0.05)
      ctx.fillText("Quro Tech", -120, 0)
      ctx.restore()

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

    // Subtitle with gold accent (positioned a bit higher to free space for the certificate title)
    ctx.fillStyle = "#fbbf24"
    ctx.font = "18px serif"
    const subtitleY = 150
    ctx.fillText("• ISO 9001:2015 Certified • Trusted Digital Verification •", canvas.width / 2, subtitleY)

    // Certificate title with decorative elements
    // compute an adaptive font size so it scales with canvas width
    ctx.fillStyle = "#1e293b"
    const adaptiveTitleSize = Math.max(26, Math.round(canvas.width * 0.028)) // ~34px for 1200px width
    ctx.font = `italic ${adaptiveTitleSize}px serif`
    // place the title just below the subtitle and keep it visually centered between header and name
    const titleY = subtitleY + adaptiveTitleSize + 8
    ctx.fillText("CERTIFICATE OF INTERNSHIP", canvas.width / 2, titleY)

    // Decorative line directly under the title (adaptive spacing)
    ctx.strokeStyle = "#fbbf24"
    ctx.lineWidth = 3
    const lineY = titleY + Math.round(adaptiveTitleSize * 0.6)
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 200, lineY)
    ctx.lineTo(canvas.width / 2 + 200, lineY)
    ctx.stroke()

      // Certificate text
      ctx.fillStyle = "#475569"
      ctx.font = "24px serif"
      ctx.fillText("This is to certify that", canvas.width / 2, 290)

      // Name with responsive size and wrapping so very long names don't overflow
      ctx.fillStyle = "#1e293b"
      const maxNameWidth = canvas.width - 220

      // Break name into lines that fit, try to keep on one line by shrinking font
      const measureNameLines = (fontSize: number) => {
        ctx.font = `bold ${fontSize}px serif`
        const words = name.split(" ")
        const lines: string[] = []
        let line = ""
        for (let i = 0; i < words.length; i++) {
          const test = line ? line + " " + words[i] : words[i]
          const width = ctx.measureText(test).width
          if (width > maxNameWidth && line) {
            lines.push(line)
            line = words[i]
          } else {
            line = test
          }
        }
        if (line) lines.push(line)
        return lines
      }

      let nameFont = 64
      let nameLines = measureNameLines(nameFont)
      // if name is too long for one line, try reducing font first
      while (nameLines.length === 1 && ctx.measureText(nameLines[0]).width > maxNameWidth && nameFont > 28) {
        nameFont -= 2
        nameLines = measureNameLines(nameFont)
      }

      // If still multiple lines, settle on a comfortable font size for multiline
      if (nameLines.length > 1) {
        nameFont = Math.max(36, Math.min(48, nameFont))
        ctx.font = `bold ${nameFont}px serif`
        const lineHeight = nameFont + 8
        const startY = 360 - ((nameLines.length - 1) * lineHeight) / 2
        for (let i = 0; i < nameLines.length; i++) {
          ctx.fillText(nameLines[i], canvas.width / 2, startY + i * lineHeight)
        }
        // underline under the last rendered line
        const lastLine = nameLines[nameLines.length - 1]
        const lastWidth = ctx.measureText(lastLine).width
        ctx.strokeStyle = "#fbbf24"
        ctx.lineWidth = 4
        ctx.beginPath()
        const underlineY = startY + (nameLines.length - 1) * lineHeight + 8
        ctx.moveTo(canvas.width / 2 - lastWidth / 2, underlineY)
        ctx.lineTo(canvas.width / 2 + lastWidth / 2, underlineY)
        ctx.stroke()
      } else {
        // single line name
        ctx.font = `bold ${nameFont}px serif`
        ctx.fillText(name, canvas.width / 2, 360)
        const nameWidth = ctx.measureText(name).width
        ctx.strokeStyle = "#fbbf24"
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2 - nameWidth / 2, 375)
        ctx.lineTo(canvas.width / 2 + nameWidth / 2, 375)
        ctx.stroke()
      }

      // Achievement text
      ctx.fillStyle = "#475569"
      ctx.font = "26px serif"
      ctx.fillText("has successfully completed the comprehensive", canvas.width / 2, 420)

      // Course title with emphasis
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 40px serif"
  // Helper to wrap text centered
  const drawWrappedText = (text: string, cx: number, cy: number, maxW: number, lh: number) => {
        const words = text.split(" ")
        const lines: string[] = []
        let line = ""
        for (let i = 0; i < words.length; i++) {
          const test = line ? line + " " + words[i] : words[i]
          const width = ctx.measureText(test).width
          if (width > maxW && line) {
            lines.push(line)
            line = words[i]
          } else {
            line = test
          }
        }
        if (line) lines.push(line)

        const startY = cy - ((lines.length - 1) * lh) / 2
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i].toUpperCase(), cx, startY + i * lh)
        }
      }

  drawWrappedText((displayTitle || 'Internship'), canvas.width / 2, 470, 800, 44)

    // Duration with styling (single line)
    ctx.fillStyle = "#64748b"
    ctx.font = "20px serif"
    const durationText = `Duration: ${durationLabel}`
    ctx.fillText(durationText, canvas.width / 2, 520)

      // Achievement message
      ctx.fillStyle = "#475569"
      ctx.font = "20px serif"
      ctx.fillText("with outstanding performance and dedication", canvas.width / 2, 540)

      // Footer section
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 18px monospace"
      ctx.textAlign = "left"
      ctx.fillText(`Certificate ID: ${serial}`, 80, 720)
      
      ctx.fillStyle = "#64748b"
      ctx.font = "16px serif"
      ctx.fillText("Date of Issue: " + new Date().toLocaleDateString(), 80, 745)
  // Show the canonical certificate URL on the canvas footer
  const displayCertUrl = (typeof window !== 'undefined' ? `${window.location.origin}/verify?serial=${encodeURIComponent(serial)}` : (process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/verify?serial=${encodeURIComponent(serial)}` : (process.env.NODE_ENV === 'development' ? `http://localhost:3000/verify?serial=${encodeURIComponent(serial)}` : 'qurotech.com/verify')))
  ctx.fillText(`Verify at: ${displayCertUrl}`, 80, 770)

      // Signature section
      ctx.textAlign = "right"
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 18px serif"
      ctx.fillText("Authorized by Quro Tech", canvas.width - 80, 720)
      
      ctx.fillStyle = "#64748b"
      ctx.font = "16px serif"
      ctx.fillText("Digitally Verified & Secured", canvas.width - 80, 745)
      ctx.fillText("✓ Authentic Certificate", canvas.width - 80, 770)

      // Add QR code if available
      if (qr) {
        const qrImg = new Image()
        qrImg.crossOrigin = "anonymous"
        qrImg.onload = () => {
          // QR code background
          // QR code background (smaller & rounded for a neater look)
          const qrBoxSize = 120
          const qrX = canvas.width - 60 - qrBoxSize
          const qrY = 560
          // rounded rect background
          const radius = 12
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.moveTo(qrX + radius, qrY)
          ctx.arcTo(qrX + qrBoxSize, qrY, qrX + qrBoxSize, qrY + qrBoxSize, radius)
          ctx.arcTo(qrX + qrBoxSize, qrY + qrBoxSize, qrX, qrY + qrBoxSize, radius)
          ctx.arcTo(qrX, qrY + qrBoxSize, qrX, qrY, radius)
          ctx.arcTo(qrX, qrY, qrX + qrBoxSize, qrY, radius)
          ctx.closePath()
          ctx.fill()
          // subtle border
          ctx.strokeStyle = "#e6edf3"
          ctx.lineWidth = 1
          ctx.stroke()

          // draw QR image centered inside the rounded box with padding
          const qrPadding = 8
          ctx.drawImage(qrImg, qrX + qrPadding, qrY + qrPadding, qrBoxSize - qrPadding * 2, qrBoxSize - qrPadding * 2)

          const link = document.createElement("a")
          link.download = `${name.replace(/\s+/g, "_")}_${serial}_Certificate.png`
          link.href = canvas.toDataURL()
          link.click()
          setIsDownloading(false)
        }
        qrImg.src = qr
      } else {
        const link = document.createElement("a")
        link.download = `${name.replace(/\s+/g, "_")}_${serial}_Certificate.png`
        link.href = canvas.toDataURL()
        link.click()
        setIsDownloading(false)
      }
    } catch (error) {
      console.error("Download failed:", error)
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} - ${internshipTitle} Certificate`,
          text: `Check out my certificate from Quro Tech for ${internshipTitle}`,
          url: `${window.location.origin}/certificate/${encodeURIComponent(serial)}`,
        })
      } catch (error) {
    navigator.clipboard.writeText(`${window.location.origin}/certificate/${encodeURIComponent(serial)}`)
      }
    } else {
  navigator.clipboard.writeText(`${window.location.origin}/certificate/${encodeURIComponent(serial)}`)
    }
  }

  

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-4">
      <div className="relative group">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-3xl blur-3xl" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
        
        <div className="relative bg-background rounded-3xl border-2 border-border shadow-2xl overflow-hidden">
          {/* Elegant header with golden accent */}
          <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" />

          <div className="p-6 md:p-12 bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-600" />
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Quro Tech
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500" />
                    ))}
                  </div>
                  <span>ISO 9001:2015 Certified • Trusted Digital Verification</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Official seal */}
                <div className="relative group/seal">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-4 border-yellow-300/50">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 blur group-hover/seal:scale-110 transition-transform duration-300" />
                </div>
                
                {/* QR Code */}
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border-2 border-muted shadow-lg p-2 group-hover:scale-105 transition-transform duration-300">
                    {isLoadingQR ? (
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <LoadingSpinner size="sm" />
                        <span className="text-xs text-muted-foreground">QR</span>
                      </div>
                    ) : qr ? (
                      <img src={qr} alt="QR code" className="w-full h-full object-contain" crossOrigin="anonymous" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        QR
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate title */}
            <div className="text-center mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-muted-foreground italic mb-2">
                CERTIFICATE OF INTERNSHIP
              </h2>
              <div className="w-28 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto" />
            </div>

            {/* Main content */}
            <div className="text-center space-y-6 mb-8">
              <p className="text-lg text-muted-foreground font-medium">
                This is to certify that
              </p>
              
              <div className="relative">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                  {name}
                </h3>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" />
              </div>
              
              <p className="text-lg text-muted-foreground font-medium">
                has successfully completed the comprehensive
              </p>
              
              <h4 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                {displayTitle}
              </h4>
              
              {/* Duration is shown on the certificate artwork; remove duplicate badge to avoid repetition */}
              
              <p className="text-base text-muted-foreground italic">
                with outstanding performance and dedication
              </p>
            </div>

            {/* Footer */}
            <div className="border-t pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2 font-mono font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Certificate ID: <span className="text-primary font-bold">{serial}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Issue Date: {new Date().toLocaleDateString()}
                  </div>
                  {/* Small duration label shown in footer for clarity */}
                  <div className="text-xs text-muted-foreground italic">{durationLabel}</div>
                  <div className="text-muted-foreground">
                    {(() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : ""
                      return (
                        <span>
                          Verify at: {isPreview ? "qurotech.com/verify" : `${origin}/verify`}
                        </span>
                      )
                    })()}
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="font-semibold">Authorized by Quro Tech</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Digitally Verified & Secured
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <Award className="w-3 h-3" />
                    Authentic Certificate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            size="lg"
          >
            {isDownloading ? <LoadingSpinner size="sm" /> : <Download className="w-5 h-5" />}
            {isDownloading ? "Generating..." : "Download Certificate"}
          </Button>
          
          <Button 
            onClick={handleShare} 
            variant="outline" 
            className="flex items-center gap-2 border-2 hover:bg-accent/50"
            size="lg"
          >
            <Share2 className="w-5 h-5" />
            Share
          </Button>
          
          <Button
            onClick={() => window.open(`/certificate/${encodeURIComponent(serial)}`, "_blank")}
            variant="secondary"
            className="flex items-center gap-2"
            size="lg"
          >
            <Eye className="w-5 h-5" />
            Verify
          </Button>
        </div>
      )}
    </div>
  )
}
