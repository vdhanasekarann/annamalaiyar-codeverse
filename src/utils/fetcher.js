// safeFetch: fetch and try to parse JSON safely.
// Returns { ok, status, data, text } where data is parsed JSON or null.
export async function safeFetch(url, opts) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    const trimmed = text.trim();

    // If it looks like JSON (object or array), try parse
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const json = JSON.parse(trimmed);
        return { ok: res.ok, status: res.status, data: json, text };
      } catch (err) {
        // parse error — fallthrough
        console.warn("safeFetch: JSON parse failed for", url, err);
      }
    }

    // Not JSON — return text so caller can fallback
    return { ok: res.ok, status: res.status, data: null, text };
  } catch (err) {
    // network error
    console.error("safeFetch error", err);
    return { ok: false, status: 0, data: null, text: "" };
  }
}