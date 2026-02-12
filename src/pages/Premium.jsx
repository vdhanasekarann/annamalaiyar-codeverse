import { requireAuth } from "../utils/auth";
import { apiFetch } from "../lib/apiFetch";

export default function PremiumPage() {
  return (
    <div className="os-bg min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-2 py-16">
        <h1 className="text-3xl font-bold mb-2">
          Unlock all 50+ AI GPT Apps
        </h1>
        <p className="text-zinc-300 mb-8">
          Higher limits • Premium styles • Faster access
        </p>

        <div className="grid sm:grid-cols-4 gap-2">
          <Plan title="Starter" price="₹199 / month" planKey="starter" />
          <Plan title="Pro" price="₹399 / month" planKey="pro" highlight />
          <Plan title="Yearly" price="₹1999 / year" planKey="yearly" />
          <Plan title="Lifetime" price="₹6999 / lifetime" planKey="lifetime" />
        </div>
      </div>
    </div>
  );
}

function Plan({ title, price, planKey, highlight }) {

  const upgrade = async () => {
    await requireAuth();

    const res = await apiFetch("/api/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: planKey })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return alert("Order creation failed: " + (err.error || res.status));
    }

    const order = await res.json();

    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Annamalaiyar CodeVerse AI",
      description: `${title} Plan`,
      order_id: order.id,

      handler: async function (response) {
        try {
          await apiFetch("/razorpay/verify", {
            method: "POST",
            body: JSON.stringify({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
            }),
          });

          // 🔥 THIS IS THE REAL FIX
          await apiFetch("/auth/me", { credentials: "include" });

          alert("Payment successful! Plan upgraded.");

          window.location.reload();

        } catch (err) {
          alert("Payment verification failed");
        }
      },

      theme: { color: "#4f46e5" },
    }).open();
  };

  return (
    <div
  className={`relative rounded-2xl p-6
    bg-gradient-to-br from-zinc-900 to-black
    border border-white/10
    flex flex-col justify-between
    ${highlight ? "ring-2 ring-indigo-500 scale-105" : ""}
  `}
>
  {highlight && (
    <span className="absolute top-3 right-3 text-xs bg-indigo-600 px-2 py-1 rounded">
      Popular
    </span>
  )}

  <div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-3xl font-bold mt-3">{price}</p>
  </div>

  <button
    onClick={upgrade}
    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg"
  >
    Upgrade
  </button>
</div>
  );
}