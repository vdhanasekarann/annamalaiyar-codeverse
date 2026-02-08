import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import { apiFetch } from "../lib/apiFetch";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const sendMagicLink = async () => {
    if (!email) return alert("Email required");

    const res = await apiFetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.devLink) {
      window.location.href = data.devLink;
    } else {
      alert("Magic link sent");
    }
  };

  useEffect(() => {
    if (!window.google) return;
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (res) => {
        const r = await apiFetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential: res.credential }),
        });

        if (r.ok) navigate("/dashboard");
        else alert("Google login failed");
      },
    });

    const btn = document.getElementById("googleBtn");
    if (btn) {
      window.google.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large",
      });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail) return alert("Email required");

    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: cleanEmail }),
    });

    if (!res.ok) return alert("Login failed");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">CodeVerse AI OS</h1>

        <div id="googleBtn" className="flex justify-center" />

        <div className="text-center opacity-50">OR</div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          />

          <button
            type="button"
            onClick={sendMagicLink}
            className="w-full bg-zinc-700 hover:bg-zinc-600 p-2 rounded"
          >
            Send Magic Link
          </button>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded font-semibold"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}