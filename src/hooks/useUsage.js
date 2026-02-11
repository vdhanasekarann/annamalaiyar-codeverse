import { useState, useEffect } from "react";
import { apiFetch } from "../lib/apiFetch";

export function useUsage(email) {
  const [usage, setUsage] = useState({});

  async function refresh() {
    const r = await apiFetch(`/api/usage?email=${email}`);
    setUsage(await r.json());
  }

  useEffect(() => {
    if (email) refresh();
  }, [email]);

  return { usage, refresh };
}
