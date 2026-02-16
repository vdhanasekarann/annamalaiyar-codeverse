// src/components/EnquiryForm.jsx
import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/apiFetch";

export default function EnquiryForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      projectType: form.get("projectType"),
      budget: form.get("budget"),
      details: form.get("details"),
    };

    if (!payload.name || !payload.email || !payload.details) {
      alert("Please fill required fields.");
      setLoading(false);
      return;
    }

    try {
      const resp = await apiFetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Failed");

      alert("Thank you! Your enquiry was submitted.");
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="enquiryForm" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label>Full Name</label>
          <input name="name" required />
        </div>

        <div className="form-field">
          <label>Email</label>
          <input name="email" type="email" required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Project Type</label>
          <select name="projectType">
            <option>Web App</option>
            <option>Mobile App</option>
            <option>Web + Mobile</option>
            <option>AI Solution</option>
            <option>Custom Software</option>
            <option>Consulting / Other</option>
          </select>
        </div>

        <div className="form-field">
          <label>Estimated Budget</label>
          <input name="budget" placeholder="₹1L – ₹3L" />
        </div>
      </div>

      <div className="form-field">
        <label>Project Details</label>
        <textarea name="details" required />
      </div>

      <div className="enquiry-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Enquiry"}
        </button>
      </div>
    </form>
  );
}
