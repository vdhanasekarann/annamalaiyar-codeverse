// src/components/Navbar.jsx
import React from "react";
import { Navigate, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="nav">
      <div className="nav-left">
        <button className="active" onClick={(e) => window.showPage?.(e, "web")}>Web Development</button>
        <button onClick={(e) => window.showPage?.(e, "mobile")}>Mobile Apps</button>
        <button onClick={(e) => window.showPage?.(e, "cloud")}>Cloud Solutions</button>
        <button onClick={(e) => window.showPage?.(e, "ai")}>AI Solutions</button>
        <button onClick={(e) => window.showPage?.(e, "custom")}>Custom Software</button>
        <button onClick={(e) => window.showPage?.(e, "pricing")}>Pricing</button>
      </div>

      <div className="nav-right">
        <a href="/ff-premium-checkout.html" style={{ textDecoration: "none" }}>
          <button>FF Premium Checkout</button>
        </a>
        <a href="/privacy-ff-gpt.html" style={{ textDecoration: "none" }}>
          <button>FF GPT Privacy</button>
        </a>
        <button onClick={(e) => window.showPage?.(e, "contact")}>Contact</button>
      </div>
    </div>
  );
}
