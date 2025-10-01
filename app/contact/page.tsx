export const metadata = {
  title: 'Contact - Quro Tech',
  description: 'Contact information for Quro Tech support and business inquiries.'
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>
  <p className="text-sm text-muted-foreground mb-3">For support, email <a className="underline" href="mailto:qurotechofficial@gmail.com">qurotechofficial@gmail.com</a>.</p>
  <p className="text-sm text-muted-foreground mb-3">For business inquiries, email <a className="underline" href="mailto:qurotechofficial@gmail.com">qurotechofficial@gmail.com</a>.</p>
      <p className="text-sm text-muted-foreground">Phone: +91 98765 43210 (Mon-Fri, 10:00-18:00 IST)</p>
    </div>
  )
}
