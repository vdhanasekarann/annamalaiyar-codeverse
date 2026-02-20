import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/apiFetch";

export default function AdminRevenue() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/revenue", { credentials: "include" }).then((r) => (r.ok ? r.json() : { plans: [] })),
      apiFetch("/api/admin/payments", { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ]).then(([revenue, paymentRows]) => {
      setPlans(Array.isArray(revenue?.plans) ? revenue.plans : []);
      setPayments(Array.isArray(paymentRows) ? paymentRows : []);
    });
  }, []);

  const totalRevenue = useMemo(
    () => plans.reduce((sum, plan) => sum + Number(plan.revenue || 0), 0),
    [plans]
  );

  const refundPayment = async (paymentId, amount) => {
    const ok = confirm("Issue refund for this payment?");
    if (!ok) return;

    const res = await apiFetch("/api/admin/refund", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, amount }),
    });

    if (res.ok) {
      setPayments((prev) =>
        prev.map((row) =>
          row.payment_id === paymentId ? { ...row, status: "refunded" } : row
        )
      );
      return;
    }
    alert("Refund failed");
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 text-white space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">{`📊 ${t("adminRevenue") || "Admin Revenue"}`}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <SummaryCard label="Total Revenue" value={`₹${totalRevenue}`} sub={t("planDistribution") || "Plan Distribution"} />
        {plans.map((plan) => (
          <SummaryCard
            key={plan.plan}
            label={plan.plan}
            value={`₹${plan.revenue}`}
            sub={`${plan.users} users`}
          />
        ))}
      </div>

      <div className="glass-panel border border-white/10 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">{`💳 ${t("payments") || "Payments"}`}</h2>

        <div className="md:hidden space-y-3">
          {payments.map((payment) => (
            <div key={payment.payment_id} className="rounded-xl border border-white/10 bg-black/35 p-3">
              <div className="text-xs text-zinc-400 break-all">{payment.payment_id}</div>
              <div className="font-medium break-all mt-1">{payment.email}</div>
              <div className="text-sm text-zinc-300 mt-1">{`Plan: ${payment.plan}`}</div>
              <div className="text-sm text-zinc-300">{`${t("amount") || "Amount"}: ₹${payment.amount}`}</div>
              <div className={`text-sm mt-1 ${statusClass(payment.status)}`}>{payment.status}</div>
              {payment.status === "paid" && (
                <button
                  onClick={() => refundPayment(payment.payment_id, payment.amount)}
                  className="mt-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600/80 hover:bg-red-500"
                >
                  {t("refund") || "Refund"}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead className="text-left border-b border-white/10">
              <tr>
                <th className="py-2 pr-2">{t("paymentId") || "Payment ID"}</th>
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">{t("planLabel") || "Plan"}</th>
                <th className="py-2 pr-2">{t("amount") || "Amount"}</th>
                <th className="py-2 pr-2">{t("status") || "Status"}</th>
                <th className="py-2 pr-2">{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id} className="border-b border-white/10">
                  <td className="py-3 pr-2 text-xs break-all">{payment.payment_id}</td>
                  <td className="py-3 pr-2 break-all">{payment.email}</td>
                  <td className="py-3 pr-2">{payment.plan}</td>
                  <td className="py-3 pr-2">{`₹${payment.amount}`}</td>
                  <td className={`py-3 pr-2 ${statusClass(payment.status)}`}>{payment.status}</td>
                  <td className="py-3 pr-2">
                    {payment.status === "paid" && (
                      <button
                        onClick={() => refundPayment(payment.payment_id, payment.amount)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600/80 hover:bg-red-500"
                      >
                        {t("refund") || "Refund"}
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

function SummaryCard({ label, value, sub }) {
  return (
    <div className="glass-panel border border-white/10 rounded-xl p-4">
      <div className="opacity-75 text-sm">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      <div className="text-xs text-zinc-300 mt-1">{sub}</div>
    </div>
  );
}

function statusClass(status) {
  if (status === "paid") return "text-green-400";
  if (status === "refunded") return "text-yellow-400";
  return "text-red-400";
}
