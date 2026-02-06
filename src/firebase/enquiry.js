// src/firebase/enquiry.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./config";

export async function submitEnquiry(payload) {
  // payload: { name, email, projectType, budget, details }
  const docRef = await addDoc(collection(db, "enquiries"), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  // optional: call notify function (non-blocking pattern)
  try {
    const notifyFn = httpsCallable(functions, "notifyEnquiry");
    await notifyFn({ ...payload, enquiryId: docRef.id });
  } catch (err) {
    // log but don't fail the whole submission (optional)
    console.warn("notifyEnquiry failed:", err);
  }

  return { ok: true, id: docRef.id };
}