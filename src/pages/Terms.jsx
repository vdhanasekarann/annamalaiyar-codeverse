export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="text-center">
          <img src="/logo.png" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          <p>Annamalaiyar CodeVerse – aicodeverse.com</p>
          <p>Tamil Nadu, India</p>
        </div>

        <Section title="Service Description">
          CodeVerse AI OS provides AI-powered GPT tools and digital services.
        </Section>

        <Section title="Plan Details">
          Starter – ₹199/month  
          Pro – ₹399/month  
          Yearly – ₹1999/year  
          Lifetime – ₹6999 one-time  
        </Section>

        <Section title="Refund Policy">
          Refunds are processed only for duplicate payments or technical errors.
          Partial refunds may apply. Refunds are handled via Razorpay.
        </Section>

        <Section title="Cancellation Policy">
          Users may cancel anytime. Access remains until billing period ends.
        </Section>

        <Section title="Usage Limits">
          Free users have daily GPT usage limits.
          Premium users get extended or unlimited usage.
        </Section>

        <Section title="Support Policy">
          Email support available within 24–48 hours.
        </Section>

        <Section title="Data Privacy">
          We do not sell personal data.
          Authentication cookies are secure and encrypted.
        </Section>

        <Section title="Liability Disclaimer">
          CodeVerse is not responsible for misuse of AI outputs.
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-zinc-400 text-sm leading-relaxed">
        {children}
      </p>
    </div>
  );
}