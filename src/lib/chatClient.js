// src/lib/chatClient.js
export async function sendMessage(history) {
  const res = await fetch("/api/chat", {
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
