import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useAuth } from "../context/AuthContext";

export default function PremiumPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-black opacity-80" />

      <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Upgrade to CodeVerse PRO</h1>
        <p className="text-zinc-300 mb-12">Unlimited GPT access • Faster responses • Priority features</p>

        <div className="grid gap-8 md:grid-cols-4">
          <Plan title="Starter" price="₹199 / month" planKey="starter" user={user} navigate={navigate} />
          <Plan title="Pro" price="₹399 / month" planKey="pro" highlight user={user} navigate={navigate} />
          <Plan title="Yearly" price="₹1999 / year" planKey="yearly" user={user} navigate={navigate} />
          <Plan title="Lifetime" price="₹6999 / lifetime" planKey="lifetime" user={user} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}

function Plan({ title, price, planKey, highlight, user, navigate }) {
  const upgrade = async () => {
    if (!user) {
      navigate("/login");
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
      handler: async function (response) {
        try {
          await apiFetch("/api/razorpay/verify", {
            method: "POST",
            body: JSON.stringify({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
            }),
          });

          await apiFetch("/api/auth/me");
          alert("Payment successful! Plan upgraded.");
          window.location.reload();
        } catch {
          alert("Payment verification failed");
        }
      },
      theme: { color: "#4f46e5" },
    }).open();
  };

  return (
    <div
      className={`glass relative rounded-2xl p-6 bg-gradient-to-br from-zinc-900 to-black border border-white/10 flex flex-col justify-between ${
        highlight ? "scale-110 ring-2 ring-indigo-500 shadow-xl" : ""
      }`}
    >
      {highlight && (
        <span className="absolute top-3 right-3 text-xs bg-indigo-600 px-2 py-1 rounded">Popular</span>
      )}

      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-3">{price}</p>
      </div>

      <button onClick={upgrade} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg">
        Upgrade
      </button>
    </div>
  );
}
