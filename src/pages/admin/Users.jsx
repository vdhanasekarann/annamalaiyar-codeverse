import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/apiFetch";

async function readApiError(res, fallback) {
  const data = await res.clone().json().catch(() => null);
  if (data?.error) return data.error;
  const rawText = await res.text().catch(() => "");
  const text = String(rawText || "").trim();
  if (text && text.length <= 180) return `${fallback} (${res.status}): ${text}`;
  return `${fallback} (${res.status})`;
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const res = await apiFetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Failed to load users"));
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
      setLoadError(err?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function action(email, actionType, value) {
    const res = await apiFetch("/api/admin/users/action", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, action: actionType, value }),
    });

    if (!res.ok) {
      alert(await readApiError(res, "User action failed"));
      return;
    }

    load();
  }

  const stats = useMemo(
    () => ({
      total: users.length,
      blocked: users.filter((u) => u.blocked).length,
      admins: users.filter((u) => u.role === "admin").length,
    }),
    [users]
  );

  return (
    <div className="p-3 sm:p-6 text-white space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">{t("adminUsers") || "Admin Users"}</h1>

      {loading && (
        <div className="text-sm rounded-lg border border-white/15 bg-black/30 px-3 py-2">
          Loading users...
        </div>
      )}
      {loadError && (
        <div className="text-sm rounded-lg border border-red-400/35 bg-red-950/35 text-red-100 px-3 py-2">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Admins" value={stats.admins} />
        <StatCard label={t("blockedStatus") || "Blocked"} value={stats.blocked} />
      </div>

      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.email} className="glass-panel border border-white/10 p-4 rounded-xl">
            <div className="font-semibold break-all">{u.email}</div>
            <div className="text-sm text-zinc-300 mt-1">
              {(t("planLabel") || "Plan") + `: ${u.plan}`}
            </div>
            <div className="text-sm text-zinc-300">{`Role: ${u.role}`}</div>
            <div className="text-sm text-zinc-300">
              {(t("status") || "Status") +
                `: ${
                  u.blocked
                    ? t("blockedStatus") || "Blocked"
                    : t("activeStatus") || "Active"
                }`}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ActionButton onClick={() => action(u.email, u.blocked ? "unblock" : "block")}>
                {u.blocked ? "Unblock" : "Block"}
              </ActionButton>
              <ActionButton onClick={() => action(u.email, "plan", "pro")}>
                Upgrade Pro
              </ActionButton>
              <ActionButton
                onClick={() => action(u.email, "role", u.role === "admin" ? "user" : "admin")}
              >
                Toggle Role
              </ActionButton>
              <ActionButton onClick={() => action(u.email, "delete")} danger>
                Delete
              </ActionButton>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto glass-panel border border-white/10 p-4 rounded-xl">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="py-2 pr-2">Email</th>
              <th className="py-2 pr-2">{t("planLabel") || "Plan"}</th>
              <th className="py-2 pr-2">Role</th>
              <th className="py-2 pr-2">{t("status") || "Status"}</th>
              <th className="py-2 pr-2">{t("actions") || "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-white/10 align-top">
                <td className="py-3 pr-2 break-all">{u.email}</td>
                <td className="py-3 pr-2">{u.plan}</td>
                <td className="py-3 pr-2">{u.role}</td>
                <td className="py-3 pr-2">
                  {u.blocked ? t("blockedStatus") || "Blocked" : t("activeStatus") || "Active"}
                </td>
                <td className="py-3 pr-2">
                  <div className="flex flex-wrap gap-2">
                    <ActionButton onClick={() => action(u.email, u.blocked ? "unblock" : "block")}>
                      {u.blocked ? "Unblock" : "Block"}
                    </ActionButton>
                    <ActionButton onClick={() => action(u.email, "plan", "pro")}>
                      Upgrade Pro
                    </ActionButton>
                    <ActionButton
                      onClick={() => action(u.email, "role", u.role === "admin" ? "user" : "admin")}
                    >
                      Toggle Role
                    </ActionButton>
                    <ActionButton onClick={() => action(u.email, "delete")} danger>
                      Delete
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-panel border border-white/10 p-4 rounded-xl">
      <div className="text-xs text-zinc-300">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function ActionButton({ children, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
        danger
          ? "bg-red-600/80 hover:bg-red-500 text-white"
          : "bg-black/45 border border-white/15 hover:bg-black/65 text-white"
      }`}
    >
      {children}
    </button>
  );
}
