export const metadata = {
  title: 'Project Disclaimer - Demo',
  description: 'Disclaimer that this site uses the Quro Tech name only for testing/demo purposes.'
}

export default function ProjectDisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Project Disclaimer</h1>
      <p className="text-sm text-muted-foreground mb-3">
        This website is a demo project and uses the name "Quro Tech" for demonstration and testing
        purposes only. It is not operated by or affiliated with any real company named Quro Tech.
        Please do not treat information on this site as official company communication.
      </p>
      <p className="text-sm text-muted-foreground">
        If you have concerns or need a production-grade certificate system for your organization,
  contact the development team at <a href="mailto:qurotechofficial@gmail.com" className="underline">qurotechofficial@gmail.com</a>.
      </p>
    </div>
  )
}
