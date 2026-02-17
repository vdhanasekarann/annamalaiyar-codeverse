// src/components/SideBar.jsx
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";

const linkClass = (isActive) => `px-3 py-2 rounded-xl transition ${isActive ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow" : "hover:bg-white/10"}`;


export default function SideBar({ mobile, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [avatar, setAvatar] = useState(null);
  const { collapsed, hovered, locked, setHovered, setCollapsed, lock, unlock, toggleCollapse } = useSidebar();
  const expanded = locked || hovered || !collapsed || !!mobile;
  const blobRef = useRef(null);
  const blobPathRef = useRef(null);
  const hamburgerRef = useRef(null);

  const go = path => {
    navigate(path);
    if (mobile && onNavigate) onNavigate();
  };

  const items = [
    { path: "/dashboard", label: t("home") || "Home", icon: "🏠" },
    { path: "/gpts", label: t("gptApps") || "GPT Apps", icon: "🤖" },
    { path: "/terms", label: t("terms") || "Terms", icon: "📄" },
    { path: "/premium", label: t("premium") || "Premium", icon: "💎" },
  ];
  if (user?.role === "admin") {
    items.push({ path: "/admin/revenue", label: t("revenue") || "Revenue", icon: "📊" });
    items.push({ path: "/admin/users", label: t("users") || "Users", icon: "👥" });
  }

  useEffect(() => {
    const blob = blobRef.current;
    const blobPath = blobPathRef.current;
    const hamburger = hamburgerRef.current;
    // Respect reduced motion and low-memory devices
      if (!blob || !blobPath) return;

      // Respect reduced-motion and low-memory devices
      let prefersReduced = false;
      let lowMemory = false;
      if (typeof window !== 'undefined') {
        try {
          prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          lowMemory = !!(navigator.deviceMemory && navigator.deviceMemory < 1.5);
        } catch (e) {}
      }
    if (prefersReduced || lowMemory) return;
    if (!blob || !blobPath) return;

    let height = window.innerHeight;
    let x = 0,
      y = height / 2,
      curveX = 10,
      curveY = 0,
      targetX = 0,
      xitteration = 0,
      yitteration = 0;

    const hoverZone = 150;
    const expandAmount = 20;

    function easeOutExpo(currentIteration, startValue, changeInValue, totalIterations) {
      return (
        changeInValue * (-Math.pow(2, (-10 * currentIteration) / totalIterations) + 1) + startValue
      );
    }

    function onMove(e) {
      x = e.pageX;
      y = e.pageY;
    }

    function onResize() {
      height = window.innerHeight;
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    let rafId;
    function svgCurve() {
      const menuExpanded = expanded;

      if (curveX > x - 1 && curveX < x + 1) {
        xitteration = 0;
      } else {
        if (menuExpanded) {
          targetX = 0;
        } else {
          xitteration = 0;
          if (x > hoverZone) {
            targetX = 0;
          } else {
            targetX = -(((60 + expandAmount) / 100) * (x - hoverZone));
          }
        }
        xitteration++;
      }

      if (curveY > y - 1 && curveY < y + 1) {
        yitteration = 0;
      } else {
        yitteration = 0;
        yitteration++;
      }

      curveX = easeOutExpo(xitteration, curveX, targetX - curveX, 100);
      curveY = easeOutExpo(yitteration, curveY, y - curveY, 100);

      const anchorDistance = 200;
      const curviness = anchorDistance - 40;

      const newCurve2 = `M60,${height}H0V0h60v${curveY - anchorDistance}c0,${curviness},${curveX},${curviness},${curveX},${anchorDistance}S60,${curveY},60,${curveY + anchorDistance * 2}V${height}z`;

      try {
        blobPath.setAttribute("d", newCurve2);
        blob.style.width = `${curveX + 60}px`;
        if (hamburger) hamburger.style.transform = `translate(${curveX}px, ${curveY}px)`;
      } catch (e) {
        // ignore
      }

      rafId = window.requestAnimationFrame(svgCurve);
    }

    rafId = window.requestAnimationFrame(svgCurve);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [expanded]);
    
  return (
    <aside
      {...(!mobile
        ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
        : {})}
      className={`glass-dark h-screen relative overflow-hidden text-white flex flex-col before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-600/10 before:via-purple-600/5 before:to-transparent before:pointer-events-none border-r border-white/6 transition-all duration-300 ${
        expanded ? "w-[240px] shadow-[0_8px_48px_rgba(99,102,241,0.15)]" : "w-16"
      }`}
    >

      {/* BRAND */}
      <div className="p-4 border-b border-white/10 font-semibold text-lg flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-white">CV</div>
        {expanded && <div>{t("brand") || "CodeVerse AI OS"}</div>}
        {expanded && (
          <button onClick={toggleCollapse} className="ml-auto text-xs text-indigo-200 px-2 py-1 rounded hover:bg-white/6">{collapsed ? 'Open' : 'Collapse'}</button>
        )}
      </div>

      {/* SVG blob for curved hover */}
      <div id="blob" ref={blobRef} className="pointer-events-none absolute right-0 top-0 h-full overflow-visible" style={{width: 60}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 800" className="h-full w-full">
          <path id="blob-path" ref={blobPathRef} d="M60,500H0V0h60c0,0,20,172,20,250S60,900,60,500z" fill="#0b1220" />
        </svg>
      </div>

      <div ref={hamburgerRef} className="hamburger absolute right-5 top-6 w-6 h-6 pointer-events-none">
        <div className="line bg-white/80 h-0.5 w-full my-1"></div>
        <div className="line bg-white/80 h-0.5 w-full my-1"></div>
        <div className="line bg-white/80 h-0.5 w-full my-1"></div>
      </div>

      {/* USER */}
      {user && (
        <div className="p-4 border-b border-white/10 flex gap-3 items-center">
          <div className="relative">
            <img
              src={
                avatar ||
                localStorage.getItem(`avatar_${user.email}`) ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  localStorage.setItem(`avatar_${user.email}`, reader.result);
                  setAvatar(reader.result);
                };
                reader.readAsDataURL(f);
              }}
            />
          </div>
          {expanded && (
            <>
              <div className="text-sm flex-1 min-w-0">
                <div className="truncate">{user.email}</div>
                <div className="text-xs opacity-60">{t(user.role) || user.role}</div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="avatar-upload" className="text-xs text-indigo-300 hover:underline cursor-pointer">
                  Edit
                </label>
                <button
                  onClick={() => {
                    localStorage.removeItem(`avatar_${user.email}`);
                    setAvatar(null);
                  }}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* NAV */}
      <nav className="flex-1 p-2 space-y-2">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => go(item.path)}
            className={`group w-full text-left px-3 py-3 rounded-2xl transition-all flex items-center gap-3 text-sm font-medium ${
              location.pathname === item.path
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg"
                : "hover:bg-white/6"
            }`}
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            {expanded && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={async () => {
          await apiFetch("/api/auth/logout", { method: "POST" });
          navigate("/login");
        }}
        className="m-3 py-2 rounded-2xl bg-red-500/20 hover:bg-red-500/30"
      >
        {expanded ? (t("logout") || "Logout") : "⎋"}
      </button>
    </aside>
  );
}

      
