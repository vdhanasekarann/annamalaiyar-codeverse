import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Navigate, Link } from "react-router-dom";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      devices: "Active Devices",
      recent: "Recently Used",
      home: "Home",
      gptApps: "GPT Apps",
      terms: "Terms",
      premium: "Premium",
      brand: "CodeVerse AI OS",
      logout: "Logout",
      viewReviews: "View Reviews",
      locked: "🔒 Limit reached",
      usedToday: "used today",
      unlimited: "Unlimited",
      searchPlaceholder: "Search GPTs...",
    },
  },
  ta: { translation: { welcome: "வரவேற்கிறோம்" } },
  hi: { translation: { welcome: "स्वागत है" } },
  ml: { translation: { welcome: "സ്വാഗതം" } },
  kn: { translation: { welcome: "ಸ್ವಾಗತ" } },
  te: { translation: { welcome: "స్వాగతం" } },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    activeDevices:"Active Devices",
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
