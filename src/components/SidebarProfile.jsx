import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function normalizeProfile(user, saved) {
  const fallbackName = user?.email ? user.email.split("@")[0] : "User";
  return {
    name: saved?.name || user?.name || fallbackName,
    email: saved?.email || user?.email || "",
    photo: saved?.photo || "",
  };
}

async function fileToSmallDataUrl(file) {
  const objectUrl = URL.createObjectURL(file);
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = objectUrl;
  });

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  URL.revokeObjectURL(objectUrl);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export default function SidebarProfile({ compact = false }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => (user?.email ? `profile_${user.email}` : null), [user?.email]);
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(() => normalizeProfile(user, null));
  const [draft, setDraft] = useState(() => normalizeProfile(user, null));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    const next = normalizeProfile(user, saved);
    setProfile(next);
    setDraft(next);
    setEditing(false);
  }, [storageKey, user]);

  const save = () => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(draft));
    setProfile(draft);
    setEditing(false);
  };

  const removeProfile = () => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
    const reset = normalizeProfile(user, null);
    setProfile(reset);
    setDraft(reset);
    setEditing(false);
  };

  if (!user) return null;
  const shown = editing ? draft : profile;
  const initials = (shown.name || "U").slice(0, 1).toUpperCase();

  return (
    <div className={`rounded-xl border border-white/10 bg-black/35 ${compact ? "p-2" : "p-3"} text-white`}>
      <div className="flex items-center gap-3">
        {shown.photo ? (
          <img src={shown.photo} alt={shown.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-600/70 border border-white/20 grid place-items-center font-semibold">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">{shown.name}</div>
          <div className="text-[11px] text-zinc-300 truncate">{shown.email}</div>
        </div>
      </div>

      {editing && (
        <div className="mt-3 space-y-2">
          <input
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-zinc-900/80 border border-white/15 rounded px-2 py-1 text-xs"
            placeholder="Name"
          />
          <input
            value={draft.email}
            onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-zinc-900/80 border border-white/15 rounded px-2 py-1 text-xs"
            placeholder="Email"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs px-2 py-1 rounded border border-white/15 bg-zinc-900/60"
            >
              Upload Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const small = await fileToSmallDataUrl(file);
                setDraft((p) => ({ ...p, photo: small }));
              }}
            />
            {draft.photo && (
              <button
                onClick={() => setDraft((p) => ({ ...p, photo: "" }))}
                className="text-xs px-2 py-1 rounded border border-red-400/40 text-red-300"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-white/15 bg-zinc-900/60"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        ) : (
          <>
            <button
              onClick={save}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-emerald-300/30 text-emerald-200 bg-emerald-600/20"
            >
              <Save className="w-3 h-3" /> Save
            </button>
            <button
              onClick={() => {
                setDraft(profile);
                setEditing(false);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-white/15"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </>
        )}
        <button
          onClick={removeProfile}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-400/40 text-red-300"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}
