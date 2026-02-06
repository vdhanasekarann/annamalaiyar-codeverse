// Simple dev API server for front-end development
// Run with: node dev-api.js
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/check-premium", (req, res) => {
  // return free or pro based on query (simple)
  const email = req.query.email || "";
  // example: toggle by email for quick testing
  const plan = email.includes("pro") ? "pro" : "free";
  return res.json({ plan });
});

app.get("/api/usage", (req, res) => {
  // return usage counts keyed by GPT id
  // Minimal example - every GPT unused
  return res.json({});
});

// mount any other small endpoints your frontend calls
app.get("/api/admin/revenue", (req, res) => {
  res.json({
    plans: [
      { plan: "starter", users: 12, revenue: 2388 },
      { plan: "pro", users: 6, revenue: 2394 },
    ],
  });
});

// optional webhook receiver for tests
app.post("/api/razorpay-webhook", (req, res) => {
  console.log("webhook received:", req.body);
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Dev API server listening on http://localhost:${PORT}`));