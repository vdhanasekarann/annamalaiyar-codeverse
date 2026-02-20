import { useTranslation } from "react-i18next";

const TERMS_SECTIONS = [
  {
    title: "Service Description",
    content: "CodeVerse AI OS provides AI-powered GPT tools and digital services.",
  },
  {
    title: "Plan Details",
    content:
      "Starter - ₹199/month\nPro - ₹399/month\nYearly - ₹1999/year\nLifetime - ₹6999 one-time",
  },
  {
    title: "Refund Policy",
    content:
      "Refunds are processed only for duplicate payments or technical errors. Partial refunds may apply. Refunds are handled via Razorpay.",
  },
  {
    title: "Cancellation Policy",
    content: "Users may cancel anytime. Access remains until billing period ends.",
  },
  {
    title: "Usage Limits",
    content:
      "Free users have daily GPT usage limits. Premium users get extended or unlimited usage.",
  },
  {
    title: "Support Policy",
    content: "Email support available within 24-48 hours.",
  },
  {
    title: "Data Privacy",
    content:
      "We do not sell personal data. Authentication cookies are secure and encrypted.",
  },
  {
    title: "Liability Disclaimer",
    content: "CodeVerse is not responsible for misuse of AI outputs.",
  },
];

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen text-white px-3 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-5">
        <section className="glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl">
          <div className="text-center">
            <img src="/logo.png" alt="CodeVerse Logo" className="h-14 sm:h-16 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold">{t("terms") || "Terms"} & Conditions</h1>
            <p className="text-zinc-300 mt-2">Annamalaiyar CodeVerse - aicodeverse.com</p>
            <p className="text-zinc-400 text-sm">Tamil Nadu, India</p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {TERMS_SECTIONS.map((section) => (
            <article
              key={section.title}
              className="glass-panel border border-white/10 rounded-2xl p-5 sm:p-6"
            >
              <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
