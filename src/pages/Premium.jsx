import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useAuth } from "../context/AuthContext";
import { PLAN_LIMITS } from "../config/limits";
import GlassCard from "../components/GlassCard";
import { useTheme } from "../context/ThemeContext";

const PLANS = [
  {
    title: "Starter",
    price: "₹199 / month",
    key: "starter",
    subtitle: "Great for individual creators",
  },
  {
    title: "Pro",
    price: "₹3 / month",
    key: "pro",
    subtitle: "Best for power users",
    highlight: true,
  },
  {
    title: "Yearly",
    price: "₹1999 / year",
    key: "yearly",
    subtitle: "Lower annual cost",
  },
  {
    title: "Lifetime",
    price: "₹6999 / lifetime",
    key: "lifetime",
    subtitle: "One-time purchase",
  },
];

function toLimitText(value) {
  return Number.isFinite(value) ? String(value) : "Unlimited";
}

export default function PremiumPage() {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-zinc-900/75 to-black/90" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />

      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 py-10 sm:py-16">
        <GlassCard theme={theme} className="glass-card-float p-6 sm:p-10 mb-8 text-center rounded-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            {t("upgradeTitle") || "Upgrade to CodeVerse PRO"}
          </h1>
          <p className="text-zinc-300">
            {t("upgradeSubtitle") || "Unlimited GPT access • Faster responses • Priority features"}
          </p>
        </GlassCard>

        <section className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan, index) => (
            <PlanCard
              key={plan.key}
              title={plan.title}
              price={plan.price}
              planKey={plan.key}
              subtitle={plan.subtitle}
              highlight={plan.highlight}
              user={user}
              setUser={setUser}
              navigate={navigate}
              theme={theme}
              delay={index * 140}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function PlanCard({
  title,
  price,
  planKey,
  subtitle,
  highlight,
  user,
  setUser,
  navigate,
  theme,
  delay = 0,
}) {
  const { t } = useTranslation();
  const accent = "var(--accent, #4f46e5)";
  const limits = PLAN_LIMITS[planKey] || { daily: 0, devices: 1 };

  const upgrade = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Razorpay checkout is not available right now.");
      return;
    }

    const res = await apiFetch("/api/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: planKey }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Order creation failed: " + (err.error || res.status));
      return;
    }

    const order = await res.json();

    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Annamalaiyar CodeVerse AI",
      description: `${title} Plan`,
      order_id: order.id,
      prefill: {
        email: user.email,
      },
      handler: async function (response) {
        try {
          const verifyRes = await apiFetch("/api/razorpay/verify", {
            method: "POST",
            body: JSON.stringify({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            const err = await verifyRes.json().catch(() => ({}));
            const traceSuffix = err?.traceId ? ` (trace: ${err.traceId})` : "";
            throw new Error((err.error || `HTTP ${verifyRes.status}`) + traceSuffix);
          }
          const verifyData = await verifyRes.json().catch(() => ({}));

          const meRes = await apiFetch("/api/auth/me");
          if (meRes.ok) {
            const freshUser = await meRes.json();
            setUser?.(freshUser);
          }

          const invoiceSuffix =
            verifyData?.invoiceEmailed === false
              ? " Plan upgraded. Invoice email is pending; please check again shortly."
              : " Plan upgraded.";
          alert(`Payment successful!${invoiceSuffix}`);
          navigate("/dashboard");
        } catch (err) {
          alert("Payment verification failed: " + (err?.message || "Unknown error"));
        }
      },
      theme: { color: accent },
    }).open();
  };

  return (
    <GlassCard
      theme={theme}
      className={`glass-card-float relative rounded-2xl p-5 sm:p-6 flex flex-col min-h-[350px] ${
        highlight ? "ring-2 ring-white/25 shadow-2xl" : ""
      }`}
      style={{
        "--float-delay": `${delay}ms`,
        borderColor: highlight ? `${accent}55` : undefined,
        boxShadow: highlight ? `0 0 24px ${accent}55` : undefined,
      }}
    >
      {highlight && (
        <span
          className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded"
          style={{ backgroundColor: accent, color: "#111" }}
        >
          {t("popular") || "Popular"}
        </span>
      )}

      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-zinc-300 text-xs mt-1">{subtitle}</p>
        <p className="text-3xl font-bold mt-4">{price}</p>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-zinc-200">
        <li>{`Daily GPT Usage: ${toLimitText(limits.daily)}`}</li>
        <li>{`Device Limit: ${limits.devices}`}</li>
        <li>Priority checkout enabled</li>
        <li>Plan auto-activation after payment</li>
      </ul>

      <button
        onClick={upgrade}
        className="mt-auto w-full py-2.5 rounded-lg font-semibold text-black"
        style={{ backgroundColor: accent }}
      >
        {t("upgrade") || "Upgrade"}
      </button>
    </GlassCard>
  );
}
