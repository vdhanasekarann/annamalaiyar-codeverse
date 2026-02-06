// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCsiu_3nGZyqel5DYb6POqE3ugMFSiYzjc",
  authDomain: "kannizcon-ites.firebaseapp.com",
  projectId: "kannizcon-ites",
  storageBucket: "kannizcon-ites.firebasestorage.app",
  messagingSenderId: "767077984626",
  appId: "1:767077984626:web:0568cd48ca27c8f0bc15eb",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app); // default region (us-central1) - matches your emulator default

if (import.meta.env.DEV) {
  // Emulator host + port (functions emulator usually runs on 5001)
  connectFunctionsEmulator(functions, "localhost", 5001);
}
