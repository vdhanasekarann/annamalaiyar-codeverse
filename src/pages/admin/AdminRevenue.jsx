import { useEffect, useState } from "react";
import { API_BASE } from "../../config/api";
import { apiFetch } from "../../lib/apiFetch";

export default function AdminRevenue() {
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/revenue", { credentials: "include" })
        .then(r => r.json()),
      apiFetch("/api/admin/payments", { credentials: "include" })
        .then(r => r.json()),
    ]).then(([rev, pay]) => {
      setPlans(rev.plans);
      setPayments(pay);
    });
  }, []);

  const refundPayment = async (paymentId, amount) => {
  const ok = confirm("Issue refund for this payment?");
  if (!ok) return;

  const res = await apiFetch("/api/admin/refund", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, amount })
  });

  if (res.ok) {
    setPayments(p =>
      p.map(x =>
        x.payment_id === paymentId
          ? { ...x, status: "refunded" }
          : x
      )
    );
  } else {
    alert("Refund failed");
  }
};

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">📊 Admin Revenue</h1>

      {/* PLAN REVENUE */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {plans.map(p => (
          <Card
            key={p.plan}
            title={p.plan}
            value={`₹${p.revenue}`}
            sub={`${p.users} users`}
          />
        ))}
      </div>

      {/* PAYMENTS */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">💳 Payments</h2>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="text-left">
            <tr className="border-b border-zinc-700">
              <th>ID</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id} className="border-b border-zinc-800">
                <td className="py-2 text-xs">{p.payment_id}</td>
                <td>{p.email}</td>
                <td>{p.plan}</td>
                <td>₹{p.amount}</td>
                <td>
                  <span className={
                    p.status === "paid"
                      ? "text-green-400"
                      : p.status === "refunded"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }>
                    {p.status}
                  </span>
                </td>
                <td>
                  {p.status === "paid" && (
                    <button
                      onClick={() => refundPayment(p.payment_id, p.amount)}
                      className="px-3 py-1 bg-red-600 rounded text-xs"
                    >
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, sub }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl">
      <div className="opacity-70">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-50">{sub}</div>
    </div>
  );
}