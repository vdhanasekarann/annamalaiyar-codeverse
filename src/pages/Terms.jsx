import { useTranslation } from "react-i18next";

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    paragraphs: [
      "By accessing or using CodeVerse AI, websites, apps, GPT tools, APIs, or services (\"Services\"), you agree to be legally bound by these Terms. If you do not agree, you must not use the Services.",
    ],
  },
  {
    title: "2. Service Description",
    paragraphs: [
      "CodeVerse provides AI-powered software tools, SaaS products, automation services, APIs, and custom development solutions.",
      "Features may change, improve, or be discontinued at any time.",
    ],
  },
  {
    title: "3. Eligibility",
    paragraphs: [
      "You must be at least 18 years old and legally capable of entering into binding contracts.",
      "By using our Services, you confirm that all information provided is accurate and truthful.",
    ],
  },
  {
    title: "4. Account Responsibility",
    paragraphs: ["You are responsible for:"],
    bullets: [
      "Maintaining access to your email login",
      "All activity under your account",
      "Ensuring device and browser security",
    ],
    footer: "We are not liable for unauthorized access caused by user negligence.",
  },
  {
    title: "5. Plans & Pricing",
    paragraphs: [
      "Starter - \u20B9199/month",
      "Pro - \u20B9399/month",
      "Yearly - \u20B91999/year",
      "Lifetime - \u20B96999 one-time",
    ],
    footer:
      "Prices may change anytime. Existing subscriptions remain valid until the billing cycle ends.",
  },
  {
    title: "6. Payments",
    paragraphs: [
      "Payments are processed securely via third-party gateways such as Razorpay.",
      "We do not store card or banking information.",
      "By making a payment, you agree to the payment provider's terms and policies.",
    ],
  },
  {
    title: "7. Refund Policy",
    paragraphs: ["Refunds are only issued for:"],
    bullets: [
      "Duplicate payments",
      "Technical billing errors",
      "Failed transactions where amount was deducted",
    ],
    footer: "Approved refunds are processed through the original payment method.",
  },
  {
    title: "8. Cancellation Policy",
    paragraphs: [
      "You may cancel your subscription anytime.",
      "Access continues until the end of the current billing period.",
      "No prorated refunds are provided unless required by law.",
    ],
  },
  {
    title: "9. Usage Policy",
    paragraphs: ["You agree not to:"],
    bullets: [
      "Use services for illegal or harmful purposes",
      "Attempt unauthorized system access",
      "Reverse engineer software",
      "Resell or exploit platform access",
      "Upload malicious or harmful content",
    ],
  },
  {
    title: "10. AI Output Disclaimer",
    paragraphs: [
      "AI-generated results are automated outputs based on algorithms.",
      "They may contain inaccuracies or outdated information.",
      "Users must verify outputs before relying on them.",
      "We are not responsible for decisions made based on AI responses.",
    ],
  },
  {
    title: "11. Intellectual Property",
    paragraphs: [
      "All platform code, systems, branding, and software remain the intellectual property of Annamalaiyar CodeVerse.",
      "Users retain ownership of their own uploaded content.",
    ],
  },
  {
    title: "12. Third-Party Services",
    paragraphs: [
      "Our platform may integrate third-party providers including hosting services, databases, analytics, AI APIs, and payment gateways.",
      "We are not responsible for third-party service failures or outages.",
    ],
  },
  {
    title: "13. Data Privacy",
    paragraphs: [
      "We do not sell personal data.",
      "Data is protected using secure authentication, encryption, and industry-standard safeguards.",
      "See our Privacy Policy for details.",
    ],
  },
  {
    title: "14. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, CodeVerse is not liable for indirect, incidental, or consequential damages, loss of data, profits, or business interruption.",
    ],
  },
  {
    title: "15. Termination",
    paragraphs: [
      "We may suspend or terminate accounts that violate these Terms, misuse services, or pose security risks.",
    ],
  },
  {
    title: "16. Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of India.",
      "Any disputes shall fall under jurisdiction of courts in Tamil Nadu.",
    ],
  },
  {
    title: "17. Changes to Terms",
    paragraphs: [
      "We may update these Terms anytime.",
      "Continued use of services after updates constitutes acceptance.",
    ],
  },
  {
    title: "18. Contact",
    paragraphs: [
      "Email: codeverseteam@aicodeverse.com",
      "Company: KANNIZCON IT ENABLING SERVICES (AI CODEVERSE)",
    ],
  },
];

export default function TermsPage() {
  const { t } = useTranslation();
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen text-white px-3 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-5">
        <section className="glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl">
          <div className="text-center">
            <img src="/AICodeverse.png" alt="CodeVerse Logo" className="h-14 sm:h-16 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold">{t("terms") || "Terms"} & Conditions</h1>
            <p className="text-zinc-300 mt-2">
              Annamalaiyar CodeVerse -{" "}
              <a
                href="https://aicodeverse.com"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white"
              >
                aicodeverse.com
              </a>
              {" , "}
              <a
                href="https://kannizconites.com"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white"
              >
                kannizconites.com
              </a>
            </p>
            <p className="text-zinc-300 mt-2">
              Company: KANNIZCON IT ENABLING SERVICES (AI CODEVERSE)
            </p>
            <p className="text-zinc-400 text-sm">Tamil Nadu, India</p>
            <p className="text-zinc-500 text-xs mt-2">Last Updated: {lastUpdated}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {TERMS_SECTIONS.map((section) => (
            <article key={section.title} className="glass-panel border border-white/10 rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold mb-2">{section.title}</h2>

              <div className="space-y-2 text-zinc-300 text-sm leading-relaxed">
                {section.paragraphs?.map((line) => (
                  <p key={line}>{line}</p>
                ))}

                {section.bullets?.length > 0 && (
                  <ul className="list-disc ml-5 space-y-1">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.footer ? <p>{section.footer}</p> : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
