import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
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
    if (data.devLink) window.location.href = data.devLink;
    else alert("Magic link sent to your email");
  };

  useEffect(() => {
    if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return;

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

    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large", width: 320 }
    );
  }, [navigate]);

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="flex md:w-1/2 w-full h-48 md:h-auto relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-indigo-500 to-black opacity-90" />
        <div className="relative z-10 text-white p-16 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">AI CodeVerse OS</h1>
          <p className="text-xl mb-6">Create. Build. Launch.<br/>
            The AI platform trusted by creators, founders, learners & innovators.</p>
          <p className="opacity-80">
            Join 100,000+ minds already building the future.<br/>
            Start free. Upgrade anytime.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white text-black">
        <div className="w-full max-w-md p-10">

          <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
          <p className="text-sm opacity-60 mb-6">
            Sign in to continue your AI journey
          </p>

          <div id="googleBtn" className="mb-4 flex justify-center" />

          <div className="text-center text-sm opacity-50 mb-4">OR</div>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border p-3 rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={sendMagicLink}
            className="w-full bg-black text-white p-3 rounded mb-3"
          >
            Send Magic Link
          </button>

          <p className="text-xs opacity-50 text-center mt-6">
            Secure login • No password required
          </p>

        </div>
      </div>
    </div>
  );
}
