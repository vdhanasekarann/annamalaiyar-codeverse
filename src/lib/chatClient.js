// src/lib/chatClient.js
import { apiFetch } from "./apiFetch";

export async function sendMessage(history) {
  const res = await apiFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Chat failed");
  }

  return data.reply;
}
