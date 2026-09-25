import { useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, Camera, ChartColumn, Plus, ReceiptText, Trash2, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SMART_INVESTMENT_GPT_URL = "https://chatgpt.com/g/g-69540976edfc8191bbd23bace9d9dfdd-smart-investment-budget-planner-ai";

const PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
];

const CATEGORIES = ["Food", "Transport", "Home", "Bills", "Health", "Shopping", "Education", "Travel", "Other"];
const BAR_COLORS = ["#f5c451", "#58d6c2", "#7c9cff", "#f18b69", "#c392ef"];

function dateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStorageKey(email) {
  return `cv_expenses_v1:${String(email || "guest").toLowerCase()}`;
}

function readExpenses(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.id === "string" && Number.isFinite(Number(item.amount)) && /^\d{4}-\d{2}-\d{2}$/.test(item.date))
      : [];
  } catch {
    return [];
  }
}

function getPeriodRange(period, anchorDate) {
  const date = new Date(`${anchorDate}T12:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();

  if (period === "daily") {
    return { start: anchorDate, end: anchorDate, title: date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) };
  }
  if (period === "monthly") {
    const start = dateValue(new Date(year, month, 1, 12));
    const end = dateValue(new Date(year, month + 1, 0, 12));
    return { start, end, title: date.toLocaleDateString(undefined, { month: "long", year: "numeric" }) };
  }
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return { start, end, title: String(year) };
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function parseReceiptText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const totalLine = [...lines].reverse().find((line) => /grand\s*total|total\s*(due|amount)?|amount\s*due|net\s*amount/i.test(line));
  const amountTokens = totalLine?.match(/(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi) || [];
  const amountCandidates = amountTokens.map((token) => Number(token.replace(/[^0-9.]/g, ""))).filter((value) => Number.isFinite(value) && value > 0);
  const amount = amountCandidates.length ? Math.max(...amountCandidates) : null;

  let date = null;
  const isoDate = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  const localDate = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
  if (isoDate) {
    date = `${isoDate[1]}-${String(isoDate[2]).padStart(2, "0")}-${String(isoDate[3]).padStart(2, "0")}`;
  } else if (localDate) {
    date = `${localDate[3]}-${String(localDate[2]).padStart(2, "0")}-${String(localDate[1]).padStart(2, "0")}`;
  }
  if (date && Number.isNaN(new Date(`${date}T12:00:00`).getTime())) date = null;

  const normalizedText = text.toLowerCase();
  const category = /uber|ola|fuel|petrol|diesel|metro|bus|parking/.test(normalizedText)
    ? "Transport"
    : /grocery|supermarket|restaurant|cafe|food|bakery/.test(normalizedText)
      ? "Food"
      : /electricity|water bill|internet|mobile bill|utility/.test(normalizedText)
        ? "Bills"
        : "Other";

  return { amount, date, category };
}

function getChartData(period, anchorDate, expenses) {
  if (period === "daily") {
    const totals = new Map();
    expenses.forEach((expense) => totals.set(expense.category, (totals.get(expense.category) || 0) + Number(expense.amount)));
    return [...totals.entries()].map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value);
  }

  const anchor = new Date(`${anchorDate}T12:00:00`);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const buckets = period === "monthly"
    ? Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return { key: `${year}-${String(month + 1).padStart(2, "0")}-${day}`, label: day, value: 0 };
    })
    : Array.from({ length: 12 }, (_, index) => ({
      key: `${year}-${String(index + 1).padStart(2, "0")}`,
      label: new Date(year, index, 1).toLocaleDateString(undefined, { month: "short" }),
      value: 0,
    }));

  expenses.forEach((expense) => {
    const bucket = period === "monthly" ? buckets.find((item) => item.key === expense.date) : buckets[Number(expense.date.slice(5, 7)) - 1];
    if (bucket) bucket.value += Number(expense.amount);
  });
  return buckets;
}

export default function Expenses() {
  const { user } = useAuth();
  return <ExpenseTracker key={user?.email || "guest"} email={user?.email} />;
}

function ExpenseTracker({ email }) {
  const today = dateValue(new Date());
  const storageKey = getStorageKey(email);
  const [expenses, setExpenses] = useState(() => readExpenses(storageKey));
  const [period, setPeriod] = useState("daily");
  const [anchorDate, setAnchorDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenseDate, setExpenseDate] = useState(today);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const [readingReceipt, setReadingReceipt] = useState(false);
  const receiptInputRef = useRef(null);

  async function readReceipt(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setReceiptStatus("Choose an image of the receipt.");
      return;
    }

    setReadingReceipt(true);
    setReceiptStatus("Reading the receipt on this device. The image is not uploaded.");
    let worker;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("eng");
      const result = await worker.recognize(file);
      const parsed = parseReceiptText(result.data.text || "");
      if (parsed.amount) setAmount(String(parsed.amount));
      if (parsed.date) setExpenseDate(parsed.date);
      if (parsed.category !== "Other") setCategory(parsed.category);
      setReceiptStatus(parsed.amount
        ? "Receipt read. Check the suggested fields, correct anything needed, then save."
        : "Could not identify a clear total. Enter the amount manually and check any suggested date/category.");
    } catch {
      setReceiptStatus("Could not read this image. You can still enter the expense manually.");
    } finally {
      await worker?.terminate();
      setReadingReceipt(false);
    }
  }

  function saveExpenses(nextExpenses) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextExpenses));
      setExpenses(nextExpenses);
      setFormError("");
      return true;
    } catch {
      setFormError("Storage is full. Remove some old entries to continue saving.");
      return false;
    }
  }

  const range = getPeriodRange(period, anchorDate);
  const filteredExpenses = expenses
    .filter((expense) => expense.date >= range.start && expense.date <= range.end)
    .sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id));
  const total = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const average = filteredExpenses.length ? total / filteredExpenses.length : 0;
  const categoryTotals = CATEGORIES.map((name) => ({
    name,
    total: filteredExpenses.filter((expense) => expense.category === name).reduce((sum, expense) => sum + Number(expense.amount), 0),
  })).filter((item) => item.total > 0).sort((left, right) => right.total - left.total);
  const chartData = getChartData(period, anchorDate, filteredExpenses);
  const chartMax = Math.max(...chartData.map((item) => item.value), 1);
  const topCategory = categoryTotals[0];

  function handlePeriodChange(nextPeriod) {
    setPeriod(nextPeriod);
    const current = new Date(`${anchorDate}T12:00:00`);
    if (nextPeriod === "annual") setAnchorDate(`${current.getFullYear()}-01-01`);
    else if (nextPeriod === "monthly") setAnchorDate(dateValue(new Date(current.getFullYear(), current.getMonth(), 1, 12)));
  }

  function addExpense(event) {
    event.preventDefault();
    setFormError("");
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const nextExpenses = [...expenses, {
      id,
      amount: Math.round(parsedAmount * 100) / 100,
      category,
      date: expenseDate,
      note: note.trim().slice(0, 100),
    }];
    if (saveExpenses(nextExpenses)) {
      setAmount("");
      setNote("");
    }
  }

  function removeExpense(id) {
    saveExpenses(expenses.filter((expense) => expense.id !== id));
  }

  function changeAnchor(value) {
    if (!value) return;
    if (period === "annual") setAnchorDate(`${value}-01-01`);
    else if (period === "monthly") setAnchorDate(`${value}-01`);
    else setAnchorDate(value);
  }

  const pickerValue = period === "annual" ? anchorDate.slice(0, 4) : period === "monthly" ? anchorDate.slice(0, 7) : anchorDate;

  return (
    <main className="mx-auto max-w-6xl space-y-6 pb-10 text-white">
      <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300"><Wallet className="h-4 w-4" /> Personal finance</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Expense tracker</h1>
          <p className="mt-2 text-sm text-white/60">Log spending, spot patterns, and review your totals. Your entries stay on this device.</p>
        </div>
        <a href={SMART_INVESTMENT_GPT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-yellow-200 hover:text-yellow-100">Smart Investment &amp; Budget Planner <ArrowUpRight className="h-4 w-4" /></a>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-1" aria-label="Expense period">
          {PERIODS.map((option) => (
            <button key={option.id} type="button" aria-pressed={period === option.id} onClick={() => handlePeriodChange(option.id)} className={`rounded-lg px-4 py-2 text-sm transition ${period === option.id ? "bg-yellow-300 text-black" : "text-white/60 hover:text-white"}`}>
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <CalendarDays className="h-4 w-4" />
          <span className="sr-only">Choose period</span>
          <input type={period === "daily" ? "date" : period === "monthly" ? "month" : "number"} min={period === "annual" ? "2000" : undefined} max={period === "annual" ? String(new Date().getFullYear() + 1) : undefined} value={period === "annual" ? pickerValue : pickerValue} onChange={(event) => changeAnchor(event.target.value)} className="rounded-lg border border-white/15 bg-[#111722] px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/50" />
        </label>
      </section>

      <section className="grid gap-3 border-y border-white/10 py-4 sm:grid-cols-3">
        <div><p className="text-xs uppercase tracking-wider text-white/45">{range.title} total</p><p className="mt-1 text-2xl font-semibold">{formatMoney(total)}</p></div>
        <div><p className="text-xs uppercase tracking-wider text-white/45">Transactions</p><p className="mt-1 text-2xl font-semibold">{filteredExpenses.length}</p></div>
        <div><p className="text-xs uppercase tracking-wider text-white/45">Average transaction</p><p className="mt-1 text-2xl font-semibold">{formatMoney(average)}</p></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <div className="min-w-0 rounded-2xl border border-white/10 bg-[#10151d]/75 p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-2"><ChartColumn className="h-4 w-4 text-yellow-300" /><h2 className="font-semibold">{period === "daily" ? "Today by category" : period === "monthly" ? "Daily spending" : "Monthly spending"}</h2></div>
          {period === "daily" ? (
            chartData.length ? (
              <div className="space-y-3" role="img" aria-label="Today's expenses by category">
                {chartData.map((item, index) => (
                  <div key={item.label} className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-3 text-xs">
                    <span className="truncate text-white/60">{item.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${Math.max(3, item.value / chartMax * 100)}%`, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }} /></div>
                    <span className="tabular-nums text-white/80">{formatMoney(item.value)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="py-8 text-center text-sm text-white/45">Add an expense to see your daily chart.</p>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className={`flex h-48 items-end gap-1 border-b border-white/10 ${period === "monthly" ? "min-w-[760px]" : "min-w-[560px]"}`} role="img" aria-label={period === "monthly" ? "Daily expense totals for this month" : "Monthly expense totals for this year"}>
                {chartData.map((item, index) => (
                  <div key={item.key} title={`${item.label}: ${formatMoney(item.value)}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="max-w-full truncate text-[9px] text-white/45">{item.value > 0 ? formatMoney(item.value) : ""}</span>
                    <div className="w-full max-w-8 rounded-t-sm" style={{ height: `${item.value ? Math.max(4, item.value / chartMax * 100) : 0}%`, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }} />
                    <span className="text-[10px] text-white/50">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={addExpense} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold"><Plus className="h-4 w-4 text-yellow-300" /> Add expense</h2>
            <button type="button" onClick={() => receiptInputRef.current?.click()} disabled={readingReceipt} aria-label="Scan a receipt photo" title="Scan receipt with camera or choose an image" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-white/80 transition hover:border-yellow-300/40 hover:text-yellow-100 disabled:opacity-50"><Camera className="h-4 w-4" /> {readingReceipt ? "Reading…" : "Scan receipt"}</button>
            <input ref={receiptInputRef} type="file" accept="image/*" capture="environment" onChange={readReceipt} className="hidden" />
          </div>
          <div className="space-y-3">
            <label className="block text-xs text-white/55">Amount (INR)
              <input type="number" min="0.01" step="0.01" inputMode="decimal" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#111722] px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-300/50" />
            </label>
            <label className="block text-xs text-white/55">Category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#111722] px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-300/50">
                {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-xs text-white/55">Date
              <input type="date" required value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#111722] px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-300/50" />
            </label>
            <label className="block text-xs text-white/55">What was it for? <span className="text-white/35">(optional)</span>
              <input maxLength={100} value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. weekly groceries" className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#111722] px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-300/50" />
            </label>
            {receiptStatus && <p aria-live="polite" className="text-xs leading-5 text-yellow-100/80">{receiptStatus}</p>}
            {formError && <p role="alert" className="text-xs text-red-300">{formError}</p>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-200"><Plus className="h-4 w-4" /> Save expense</button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Transactions</h2><span className="text-xs text-white/45">{range.title}</span></div>
          {filteredExpenses.length ? (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-white/60"><ReceiptText className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{expense.note || expense.category}</p><p className="text-xs text-white/45">{expense.category} · {expense.date}</p></div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(expense.amount)}</span>
                  <button type="button" onClick={() => removeExpense(expense.id)} aria-label={`Delete ${expense.note || expense.category} expense`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-red-400/10 hover:text-red-200"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          ) : <p className="border-y border-white/10 py-8 text-center text-sm text-white/45">No expenses recorded for this period.</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <h2 className="mb-4 font-semibold">Category breakdown</h2>
          {categoryTotals.length ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-left text-xs text-white/45"><th className="pb-2 font-medium">Category</th><th className="pb-2 text-right font-medium">Share</th><th className="pb-2 text-right font-medium">Total</th></tr></thead>
              <tbody>{categoryTotals.map((item) => (
                <tr key={item.name} className="border-b border-white/[0.06] last:border-0"><th scope="row" className="py-2.5 text-left font-medium text-white/75">{item.name}</th><td className="py-2.5 text-right text-xs text-white/45">{total ? Math.round(item.total / total * 100) : 0}%</td><td className="py-2.5 text-right tabular-nums">{formatMoney(item.total)}</td></tr>
              ))}</tbody>
            </table>
          ) : <p className="py-4 text-sm text-white/45">Category totals will appear when you log expenses.</p>}
        </div>
      </section>

      <aside className="flex flex-col justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
        <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-yellow-200">A useful review prompt</p><p className="mt-1 text-sm text-white/65">{topCategory ? `${topCategory.name} is your largest category in this period. Check whether the total matches your plan before changing your budget.` : "After logging a few expenses, compare your largest category with your own budget or priorities."}</p><p className="mt-1 text-xs text-white/35">For tracking and reflection only; not financial advice.</p></div>
        <a href={SMART_INVESTMENT_GPT_URL} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-yellow-200 hover:text-yellow-100">Open related finance GPT <ArrowUpRight className="h-4 w-4" /></a>
      </aside>
    </main>
  );
}
