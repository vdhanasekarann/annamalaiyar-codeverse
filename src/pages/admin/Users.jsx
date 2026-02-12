import { useEffect, useState } from "react";
import { requireAuth } from "../../utils/auth";
import { API_BASE } from "../../config/api";
import { apiFetch } from "../../lib/apiFetch";
import { Link } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    requireAuth("admin").then(load);
  }, []);

  async function load() {
    const res = await apiFetch("/api/admin/users", {
      credentials: "include",
    });
    setUsers(await res.json());
  }

  async function action(email, action, value) {
    await apiFetch("/api/admin/users/action", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, action, value }),
    });
    load();
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">👥 Users</h1>

      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[650px]">
            <thead>
          <tr className="border-b border-zinc-700">
            <th>Email</th>
            <th>Plan</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.email} className="border-b border-zinc-800">
              <td>{u.email}</td>
              <td>{u.plan}</td>
              <td>{u.role}</td>
              <td>{u.blocked ? "Blocked" : "Active"}</td>
              <td className="space-x-2">
                <button onClick={() => action(u.email, u.blocked ? "unblock" : "block")}>
                  {u.blocked ? "Unblock" : "Block"}
                </button>

                <button onClick={() => action(u.email, "plan", "pro")}>
                  Upgrade Pro
                </button>

                <button onClick={() => action(u.email, "role", u.role === "admin" ? "user" : "admin")}>
                  Toggle Role
                </button>

                <button onClick={() => action(u.email, "delete")}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
    </div>
  );
}
