import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/apiFetch";

const FORECAST_MONTHS = 6;

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toMonthKey(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-").map((v) => Number(v));
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

function shiftMonth(monthKey, offset) {
  const [y, m] = monthKey.split("-").map((v) => Number(v));
  const d = new Date(y, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildMonthlyStats(paymentRows) {
  const byMonth = new Map();

  paymentRows
    .filter((p) => p.status === "paid")
    .forEach((p) => {
      const key = toMonthKey(p.created_at);
      if (!key) return;

      if (!byMonth.has(key)) {
        byMonth.set(key, { revenue: 0, users: new Set() });
      }

      const row = byMonth.get(key);
      row.revenue += safeNumber(p.amount);
      if (p.email) row.users.add(p.email);
    });

  const keys = Array.from(byMonth.keys()).sort((a, b) => a.localeCompare(b));
  return keys.map((key) => ({
    key,
    label: monthLabel(key),
    revenue: safeNumber(byMonth.get(key)?.revenue || 0),
    users: safeNumber(byMonth.get(key)?.users?.size || 0),
  }));
}

function linearForecast(values, horizon) {
  if (!values.length) return [];
  const y = values.map((v) => safeNumber(v));
  if (y.length === 1) {
    return Array.from({ length: horizon }, () => ({
      value: y[0],
      low: y[0] * 0.9,
      high: y[0] * 1.1,
    }));
  }

  const n = y.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const xMean = x.reduce((s, v) => s + v, 0) / n;
  const yMean = y.reduce((s, v) => s + v, 0) / n;

  const numerator = x.reduce((s, xv, i) => s + (xv - xMean) * (y[i] - yMean), 0);
  const denominator = x.reduce((s, xv) => s + (xv - xMean) ** 2, 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  const mse =
    y.reduce((s, actual, i) => {
      const pred = intercept + slope * i;
      return s + (actual - pred) ** 2;
    }, 0) / n;
  const sigma = Math.sqrt(mse || 0);

  return Array.from({ length: horizon }, (_, idx) => {
    const xi = n + idx;
    const value = Math.max(0, intercept + slope * xi);
    const range = sigma * 1.25;
    return {
      value,
      low: Math.max(0, value - range),
      high: value + range,
    };
  });
}

function parseCompetitor(entry) {
  return {
    id: entry.id,
    name: (entry.name || "").trim(),
    monthlyRevenue: safeNumber(entry.monthlyRevenue),
    activeUsers: safeNumber(entry.activeUsers),
    growthPct: safeNumber(entry.growthPct),
    avgPrice: safeNumber(entry.avgPrice),
  };
}

export default function AdminRevenue() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [competitors, setCompetitors] = useState([
    {
      id: 1,
      name: "Competitor 1",
      monthlyRevenue: "",
      activeUsers: "",
      growthPct: "",
      avgPrice: "",
    },
  ]);
  const [nextCompetitorId, setNextCompetitorId] = useState(2);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/revenue", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : { plans: [] }
      ),
      apiFetch("/api/admin/payments", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : []
      ),
    ]).then(([revenue, paymentRows]) => {
      setPlans(Array.isArray(revenue?.plans) ? revenue.plans : []);
      setPayments(Array.isArray(paymentRows) ? paymentRows : []);
    });
  }, []);

  const totalRevenue = useMemo(
    () => plans.reduce((sum, plan) => sum + safeNumber(plan.revenue), 0),
    [plans]
  );

  const paidPayments = useMemo(
    () => payments.filter((p) => p.status === "paid"),
    [payments]
  );
  const refundedPayments = useMemo(
    () => payments.filter((p) => p.status === "refunded"),
    [payments]
  );

  const monthlyStats = useMemo(() => buildMonthlyStats(payments), [payments]);
  const currentMonth = monthlyStats[monthlyStats.length - 1] || { key: toMonthKey(new Date()), revenue: 0, users: 0 };
  const previousMonth = monthlyStats[monthlyStats.length - 2] || { revenue: 0, users: 0 };

  const monthlyRevenueGrowth =
    previousMonth.revenue > 0
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : currentMonth.revenue > 0
        ? 100
        : 0;

  const monthlyUserGrowth =
    previousMonth.users > 0
      ? ((currentMonth.users - previousMonth.users) / previousMonth.users) * 100
      : currentMonth.users > 0
        ? 100
        : 0;

  const uniquePaidUsers = useMemo(
    () => new Set(paidPayments.map((p) => p.email).filter(Boolean)).size,
    [paidPayments]
  );

  const arpu = uniquePaidUsers > 0 ? totalRevenue / uniquePaidUsers : 0;

  const competitorRows = useMemo(
    () =>
      competitors
        .map(parseCompetitor)
        .filter(
          (c) =>
            c.name ||
            c.monthlyRevenue > 0 ||
            c.activeUsers > 0 ||
            c.growthPct !== 0 ||
            c.avgPrice > 0
        ),
    [competitors]
  );

  const competitorAnalysis = useMemo(() => {
    if (!competitorRows.length) return [];

    return competitorRows.map((c) => {
      const revenueRatio =
        c.monthlyRevenue > 0
          ? (currentMonth.revenue / c.monthlyRevenue) * 100
          : 100;
      const growthDelta = monthlyRevenueGrowth - c.growthPct;
      const growthScore = clamp(50 + growthDelta * 2, 0, 100);
      const pricingScore =
        c.avgPrice > 0 ? clamp((arpu / c.avgPrice) * 100, 0, 130) : 100;
      const marketScore = Math.round(
        clamp(revenueRatio, 0, 140) * 0.5 + growthScore * 0.3 + pricingScore * 0.2
      );

      let status = "Close race";
      if (marketScore >= 65) status = "Ahead";
      if (marketScore < 45) status = "Behind";

      let recommendation = "Keep current strategy and monitor weekly.";
      if (status === "Behind") {
        recommendation = "Improve conversion funnel and pricing before scaling ads.";
      } else if (status === "Close race") {
        recommendation = "Focus on retention and launch one differentiated feature.";
      }

      return {
        ...c,
        marketScore,
        status,
        recommendation,
        revenueGap: currentMonth.revenue - c.monthlyRevenue,
        usersGap: currentMonth.users - c.activeUsers,
      };
    });
  }, [arpu, competitorRows, currentMonth.revenue, currentMonth.users, monthlyRevenueGrowth]);

  const revenueForecast = useMemo(
    () => linearForecast(monthlyStats.map((m) => m.revenue), FORECAST_MONTHS),
    [monthlyStats]
  );
  const userForecast = useMemo(
    () => linearForecast(monthlyStats.map((m) => m.users), FORECAST_MONTHS),
    [monthlyStats]
  );

  const growthProjection = useMemo(() => {
    const lastMonthKey = currentMonth.key || toMonthKey(new Date());
    return Array.from({ length: FORECAST_MONTHS }, (_, idx) => {
      const monthKey = shiftMonth(lastMonthKey, idx + 1);
      return {
        monthKey,
        label: monthLabel(monthKey),
        revenue: safeNumber(revenueForecast[idx]?.value || 0),
        revenueLow: safeNumber(revenueForecast[idx]?.low || 0),
        revenueHigh: safeNumber(revenueForecast[idx]?.high || 0),
        users: Math.round(safeNumber(userForecast[idx]?.value || 0)),
      };
    });
  }, [currentMonth.key, revenueForecast, userForecast]);

  const riskRadar = useMemo(() => {
    const signals = [];

    const totalPayments = paidPayments.length + refundedPayments.length;
    const refundRate = totalPayments > 0 ? (refundedPayments.length / totalPayments) * 100 : 0;
    if (refundRate >= 8) {
      signals.push({
        level: "High",
        title: "Refund rate is elevated",
        detail: `Refund rate is ${refundRate.toFixed(1)}% of payment events.`,
      });
    }

    if (monthlyRevenueGrowth < 0) {
      signals.push({
        level: "Medium",
        title: "Revenue trend is declining",
        detail: `Current month trend is ${monthlyRevenueGrowth.toFixed(1)}% vs previous month.`,
      });
    }

    if (monthlyStats.length < 3) {
      signals.push({
        level: "Low",
        title: "Limited historical data",
        detail: "Collect at least 3 months for more stable growth prediction.",
      });
    }

    const topPlan = plans
      .map((p) => ({ plan: p.plan, revenue: safeNumber(p.revenue) }))
      .sort((a, b) => b.revenue - a.revenue)[0];
    const topPlanShare = totalRevenue > 0 ? (safeNumber(topPlan?.revenue) / totalRevenue) * 100 : 0;
    if (topPlanShare > 70) {
      signals.push({
        level: "Medium",
        title: "Revenue concentration risk",
        detail: `${topPlan?.plan || "Top"} plan contributes ${topPlanShare.toFixed(1)}% of total revenue.`,
      });
    }

    if (!signals.length) {
      signals.push({
        level: "Healthy",
        title: "No immediate risk signals",
        detail: "Growth, refunds and revenue concentration look stable.",
      });
    }

    return signals;
  }, [monthlyRevenueGrowth, monthlyStats.length, paidPayments.length, plans, refundedPayments.length, totalRevenue]);

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

  const updateCompetitor = (id, key, value) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
    );
  };

  const addCompetitor = () => {
    const id = nextCompetitorId;
    setCompetitors((prev) => [
      ...prev,
      {
        id,
        name: `Competitor ${id}`,
        monthlyRevenue: "",
        activeUsers: "",
        growthPct: "",
        avgPrice: "",
      },
    ]);
    setNextCompetitorId((prev) => prev + 1);
  };

  const removeCompetitor = (id) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const projectionMax = Math.max(
    1,
    ...monthlyStats.slice(-6).map((m) => safeNumber(m.revenue)),
    ...growthProjection.map((m) => safeNumber(m.revenue))
  );

  return (
    <div className="min-h-screen p-3 sm:p-6 text-white space-y-5">
      <h1 className="text-2xl sm:text-3xl font-bold">{t("adminRevenue") || "Admin Revenue"}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <SummaryCard label="Total Revenue" value={`Rs ${Math.round(totalRevenue)}`} sub={t("planDistribution") || "Plan Distribution"} />
        <SummaryCard label="Current Month Revenue" value={`Rs ${Math.round(currentMonth.revenue)}`} sub={`${currentMonth.label || "Current month"} revenue`} />
        <SummaryCard label="Monthly Growth" value={`${monthlyRevenueGrowth.toFixed(1)}%`} sub="Revenue month-over-month" />
        <SummaryCard label="Active Paid Users" value={`${currentMonth.users}`} sub={`ARPU Rs ${arpu.toFixed(1)}`} />
        {plans.map((plan) => (
          <SummaryCard
            key={plan.plan}
            label={plan.plan}
            value={`Rs ${safeNumber(plan.revenue)}`}
            sub={`${safeNumber(plan.users)} users`}
          />
        ))}
      </div>

      <section className="glass-panel border border-white/10 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg sm:text-xl font-semibold">Competitor Analysis Mode</h2>
          <button
            onClick={addCompetitor}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-black/45 border border-white/20 hover:bg-black/65"
          >
            Add Competitor
          </button>
        </div>

        <div className="grid gap-3">
          {competitors.map((row) => (
            <div key={row.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input
                  value={row.name}
                  onChange={(e) => updateCompetitor(row.id, "name", e.target.value)}
                  className="bg-zinc-900/80 border border-white/15 rounded px-2 py-2 text-sm"
                  placeholder="Competitor name"
                />
                <input
                  value={row.monthlyRevenue}
                  onChange={(e) => updateCompetitor(row.id, "monthlyRevenue", e.target.value)}
                  className="bg-zinc-900/80 border border-white/15 rounded px-2 py-2 text-sm"
                  placeholder="Monthly revenue"
                  inputMode="decimal"
                />
                <input
                  value={row.activeUsers}
                  onChange={(e) => updateCompetitor(row.id, "activeUsers", e.target.value)}
                  className="bg-zinc-900/80 border border-white/15 rounded px-2 py-2 text-sm"
                  placeholder="Active users"
                  inputMode="numeric"
                />
                <input
                  value={row.growthPct}
                  onChange={(e) => updateCompetitor(row.id, "growthPct", e.target.value)}
                  className="bg-zinc-900/80 border border-white/15 rounded px-2 py-2 text-sm"
                  placeholder="Growth %"
                  inputMode="decimal"
                />
                <div className="flex gap-2">
                  <input
                    value={row.avgPrice}
                    onChange={(e) => updateCompetitor(row.id, "avgPrice", e.target.value)}
                    className="flex-1 bg-zinc-900/80 border border-white/15 rounded px-2 py-2 text-sm"
                    placeholder="Avg price"
                    inputMode="decimal"
                  />
                  <button
                    onClick={() => removeCompetitor(row.id)}
                    className="px-2 rounded border border-red-500/30 text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="border-b border-white/10 text-left">
              <tr>
                <th className="py-2 pr-2">Competitor</th>
                <th className="py-2 pr-2">Market Score</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Revenue Gap</th>
                <th className="py-2 pr-2">Users Gap</th>
                <th className="py-2 pr-2">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {competitorAnalysis.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-300" colSpan={6}>
                    Enter competitor values to start analysis.
                  </td>
                </tr>
              ) : (
                competitorAnalysis.map((c) => (
                  <tr key={c.id} className="border-b border-white/10 align-top">
                    <td className="py-3 pr-2">{c.name || "Competitor"}</td>
                    <td className="py-3 pr-2 font-semibold">{c.marketScore}</td>
                    <td className={`py-3 pr-2 ${statusTone(c.status)}`}>{c.status}</td>
                    <td className={`py-3 pr-2 ${c.revenueGap >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                      Rs {Math.round(c.revenueGap)}
                    </td>
                    <td className={`py-3 pr-2 ${c.usersGap >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {Math.round(c.usersGap)}
                    </td>
                    <td className="py-3 pr-2 text-zinc-200">{c.recommendation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel border border-white/10 rounded-xl p-4 space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">AI Growth Predictor</h2>
        <p className="text-sm text-zinc-300">
          Forecasts next {FORECAST_MONTHS} months using historical payment trend. Model auto-updates from admin payment data.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3 space-y-3">
            <h3 className="text-sm font-semibold">Revenue Trajectory</h3>
            <div className="space-y-2">
              {[...monthlyStats.slice(-6).map((m) => ({ ...m, kind: "history" })), ...growthProjection.map((m) => ({ ...m, kind: "forecast" }))].map((row) => (
                <div key={`${row.kind}-${row.key || row.monthKey}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{row.label}</span>
                    <span>{`Rs ${Math.round(row.revenue)}`}</span>
                  </div>
                  <div className="h-2 rounded bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded ${row.kind === "history" ? "bg-indigo-400" : "bg-emerald-400"}`}
                      style={{ width: `${Math.max(2, (safeNumber(row.revenue) / projectionMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <h3 className="text-sm font-semibold mb-2">Projected Next 6 Months</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="border-b border-white/10 text-left">
                  <tr>
                    <th className="py-2 pr-2">Month</th>
                    <th className="py-2 pr-2">Predicted Revenue</th>
                    <th className="py-2 pr-2">Range</th>
                    <th className="py-2 pr-2">Predicted Users</th>
                  </tr>
                </thead>
                <tbody>
                  {growthProjection.map((m) => (
                    <tr key={m.monthKey} className="border-b border-white/10">
                      <td className="py-2 pr-2">{m.label}</td>
                      <td className="py-2 pr-2">{`Rs ${Math.round(m.revenue)}`}</td>
                      <td className="py-2 pr-2 text-zinc-300">
                        {`Rs ${Math.round(m.revenueLow)} - Rs ${Math.round(m.revenueHigh)}`}
                      </td>
                      <td className="py-2 pr-2">{m.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-zinc-300">
              Current month user growth: {monthlyUserGrowth.toFixed(1)}%
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel border border-white/10 rounded-xl p-4 space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">Risk Radar (Extra Feature)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {riskRadar.map((risk) => (
            <div key={`${risk.title}-${risk.level}`} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <div className={`text-xs font-semibold ${riskLevelTone(risk.level)}`}>{risk.level}</div>
              <div className="font-semibold mt-1">{risk.title}</div>
              <div className="text-sm text-zinc-300 mt-1">{risk.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel border border-white/10 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">{t("payments") || "Payments"}</h2>

        <div className="md:hidden space-y-3">
          {payments.map((payment) => (
            <div key={payment.payment_id} className="rounded-xl border border-white/10 bg-black/35 p-3">
              <div className="text-xs text-zinc-400 break-all">{payment.payment_id}</div>
              <div className="font-medium break-all mt-1">{payment.email}</div>
              <div className="text-sm text-zinc-300 mt-1">{`Plan: ${payment.plan}`}</div>
              <div className="text-sm text-zinc-300">{`Amount: Rs ${payment.amount}`}</div>
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
                  <td className="py-3 pr-2">{`Rs ${payment.amount}`}</td>
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
      </section>
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

function statusTone(status) {
  if (status === "Ahead") return "text-emerald-300";
  if (status === "Behind") return "text-red-300";
  return "text-yellow-300";
}

function riskLevelTone(level) {
  if (level === "High") return "text-red-300";
  if (level === "Medium") return "text-yellow-300";
  if (level === "Low") return "text-indigo-300";
  return "text-emerald-300";
}
