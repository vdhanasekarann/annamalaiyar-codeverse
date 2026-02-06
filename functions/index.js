// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();
const db = admin.firestore();

// Use env var for local dev. In production prefer Firebase Secrets (firebase functions:secrets:set)
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

if (!OPENAI_KEY) {
  console.warn(
    "Warning: OPENAI_API_KEY is not set. The chatWithAssistant function will return a friendly fallback message."
  );
}

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

/* notifyEnquiry: save enquiry and optionally notify */
exports.notifyEnquiry = functions.https.onCall(async (data, context) => {
  try {
    await db.collection("enquiries").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "website-form",
    });
  } catch (err) {
    console.error("notifyEnquiry save error:", err);
  }
  return { ok: true };
});

/* chatWithAssistant: website AI chatbot */
exports.chatWithAssistant = functions.https.onCall(async (data, context) => {
  try {
    const history = Array.isArray(data.history) ? data.history : [];
    const trimmed = history.slice(-12);

    if (!OPENAI_KEY) {
      return {
        reply:
          "Chat service is not available right now (server not configured). Please try again later.",
      };
    }

    const messages = [
      {
        role: "system",
        content:
          "You are Kannizcon IT Enabling Services website assistant. Help visitors understand services (web, mobile, cloud, AI, DevOps), rough pricing ranges, and next steps. Be concise and friendly.",
      },
      ...trimmed,
    ];

    // OpenAI client call using the 'openai' package
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // change model if you prefer
      messages,
      max_tokens: 600,
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "How can I help you today?";

    return { reply };
  } catch (err) {
    console.error("chatWithAssistant error:", err);
    return {
      reply: "Sorry, I'm having trouble right now. Please try again later.",
    };
  }
});
