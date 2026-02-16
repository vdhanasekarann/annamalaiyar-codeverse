// src/api/chatClient.js
import { apiFetch } from "../lib/apiFetch";

export async function sendMessage(history) {
  const res = await apiFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Chat API error: " + text);
  }

  const data = await res.json();
  return data.reply;
}
