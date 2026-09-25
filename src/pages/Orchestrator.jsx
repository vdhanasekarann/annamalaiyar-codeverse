import { useState } from "react";
import { Bot, ChevronDown, LoaderCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";

const providers = [
  { id: "auto", label: "Auto route", detail: "Best available model" },
  { id: "openai", label: "OpenAI", detail: "Fast general assistant" },
  { id: "anthropic", label: "Anthropic", detail: "Careful reasoning" },
  { id: "gemini", label: "Gemini", detail: "Google multimodal model" },
];

const modes = [
  { id: "general", label: "General" },
  { id: "developer", label: "Developer" },
  { id: "researcher", label: "Research" },
  { id: "creator", label: "Content creator" },
];

export default function Orchestrator() {
  const [provider, setProvider] = useState("auto");
  const [mode, setMode] = useState("general");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = providers.find((item) => item.id === provider);

  async function submit(event) {
    event.preventDefault();
    const content = prompt.trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setBusy(true);

    try {
      const response = await apiFetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, mode, messages: nextMessages }),
      });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          const providerDetails = Array.isArray(data?.failures)
            ? data.failures.map((failure) => `${failure.provider}${failure.status ? ` (${failure.status})` : ""}: ${failure.message}`).join("; ")
            : "";
          const message = providerDetails || data?.error || (response.status === 404
            ? "The orchestrator route is missing from the deployed API. Deploy the backend update and try again."
            : response.status === 401 || response.status === 403
              ? "Your session is unavailable or expired. Sign in again to use the orchestrator."
              : `The orchestrator could not respond (HTTP ${response.status}).`);
          throw new Error(message);
        }
        if (!data?.reply) throw new Error("The API returned an invalid orchestrator response.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply, provider: data.provider }]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl text-white">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
            <Sparkles className="h-4 w-4" /> CodeVerse AI 2.0
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">One workspace. Every model.</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">Route each task to the right AI provider while keeping your conversation in one place.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-200"><ShieldCheck className="h-4 w-4" /> Keys stay on the server</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur-xl">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Model router</p>
          <div className="space-y-1">
            {providers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setProvider(item.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${provider === item.id ? "border-yellow-300/60 bg-yellow-300/10" : "border-transparent hover:border-white/15 hover:bg-white/5"}`}
              >
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-1 block text-xs text-white/45">{item.detail}</span>
              </button>
            ))}
          </div>
          <label htmlFor="orchestrator-mode" className="mt-5 block px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Task mode</label>
          <select
            id="orchestrator-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#171b26] px-3 py-2 text-sm text-white outline-none focus:border-yellow-300/60"
          >
            {modes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-white/55">
            Auto route tries the selected provider first, then uses another configured provider if it is unavailable.
          </div>
        </aside>

        <div className="flex min-h-[560px] flex-col rounded-2xl border border-white/10 bg-[#10151d]/85 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-yellow-300 text-black"><Bot className="h-4 w-4" /></span><span className="text-sm font-medium">Orchestrator chat</span></div>
            <div className="relative flex items-center gap-1 text-xs text-white/55"><ChevronDown className="h-3 w-3" /> {selected.label}</div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {!messages.length && <div className="grid h-full place-items-center text-center text-white/45"><div><Sparkles className="mx-auto mb-3 h-7 w-7 text-yellow-300" /><p className="text-sm">What are you building today?</p><p className="mt-1 text-xs">Ask for a plan, compare approaches, or start a coding task.</p></div></div>}
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-yellow-300 text-black" : "border border-white/10 bg-white/5 text-white/85"}`}><p className="whitespace-pre-wrap">{message.content}</p>{message.provider && <span className="mt-2 block text-[10px] uppercase tracking-widest opacity-45">{message.provider}</span>}</div>)}
            {busy && <div className="flex items-center gap-2 text-xs text-white/50"><LoaderCircle className="h-4 w-4 animate-spin" /> Routing your request...</div>}
          </div>

          {error && <p className="px-4 pb-2 text-xs text-red-300">{error}</p>}
          <form onSubmit={submit} className="border-t border-white/10 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-black/25 p-2 focus-within:border-yellow-300/50">
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(event); } }} rows={2} placeholder="Ask the AI orchestrator..." className="min-h-12 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30" />
              <button type="submit" disabled={busy || !prompt.trim()} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-yellow-300 text-black transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
            <p className="px-2 pt-2 text-[10px] text-white/35">AI output can be inaccurate. Review important decisions before acting.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
