const PROVIDER_CONFIG = {
  openai: {
    env: "OPENAI_API_KEY",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  anthropic: {
    env: "ANTHROPIC_API_KEY",
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
  },
  gemini: {
    env: "GEMINI_API_KEY",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },
};

const SYSTEM_PROMPTS = {
  general: "You are the CodeVerse AI orchestrator. Be useful, clear, and honest about uncertainty.",
  developer: "You are a senior software engineering assistant. Prioritize correct, secure, maintainable solutions; state assumptions and include focused tests or validation steps when useful.",
  researcher: "You are a careful research assistant. Separate established facts from assumptions, state uncertainty, and never invent citations or claim live web research unless tools actually provide it.",
  creator: "You are a creative content assistant. Produce original, audience-aware ideas and drafts, and avoid unsupported factual claims.",
};

function availableProviders() {
  return Object.keys(PROVIDER_CONFIG).filter((provider) => process.env[PROVIDER_CONFIG[provider].env]);
}

function providerOrder(requestedProvider) {
  const preferred = requestedProvider && requestedProvider !== "auto" ? [requestedProvider] : [];
  return [...new Set([...preferred, "openai", "anthropic", "gemini"])].filter((provider) =>
    availableProviders().includes(provider)
  );
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .slice(-20)
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 12000),
    }));
}

function providerError(data, status, provider) {
  const error = new Error(data.error?.message || `${provider} request failed`);
  error.status = status;
  return error;
}

async function callOpenAI(messages, systemPrompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: PROVIDER_CONFIG.openai.model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw providerError(data, response.status, "OpenAI");
  return data.choices?.[0]?.message?.content || "No response was returned.";
}

async function callAnthropic(messages, systemPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: PROVIDER_CONFIG.anthropic.model,
      max_tokens: 1200,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw providerError(data, response.status, "Anthropic");
  return data.content?.map((part) => part.text || "").join("") || "No response was returned.";
}

async function callGemini(messages, systemPrompt) {
  const model = PROVIDER_CONFIG.gemini.model;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) throw providerError(data, response.status, "Gemini");
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "No response was returned.";
}

const callers = { openai: callOpenAI, anthropic: callAnthropic, gemini: callGemini };

export default async function orchestrate(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const messages = normalizeMessages(req.body?.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "A user message is required" });
  }

  const providers = providerOrder(req.body?.provider);
  if (!providers.length) return res.status(503).json({ error: "No AI provider is configured" });
  const mode = Object.hasOwn(SYSTEM_PROMPTS, req.body?.mode) ? req.body.mode : "general";
  const systemPrompt = SYSTEM_PROMPTS[mode];

  const failures = [];
  for (const provider of providers) {
    try {
      const reply = await callers[provider](messages, systemPrompt);
      return res.json({ reply, provider, model: PROVIDER_CONFIG[provider].model, mode });
    } catch (error) {
      console.error(`AI provider ${provider} failed:`, error.message);
      failures.push({
        provider,
        status: Number.isInteger(error.status) ? error.status : null,
        message: error.message,
      });
    }
  }

  return res.status(502).json({ error: "All configured AI providers failed", failures });
}
