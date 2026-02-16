import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Navigate, Link } from "react-router-dom";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      devices: "Active Devices",
      activeDevices: "Active Devices",
      aiTools: "AI Tools ▾",
      revenue: "Revenue",
      users: "Users",
      aiInsight: "AI Insight",
      aiInsightText: "You are most active in Education category apps. Try more Lifestyle GPTs to balance your usage.",
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
      edit: "Edit",
      delete: "Delete",
      revoke: "Revoke",
      askAI: "Ask AI",
      upgrade: "Upgrade",
      noActiveDevices: "No active devices found.",
      searchEmpty: "No results found",
    },
  },
  ta: {
    translation: {
      welcome: "வரவேற்கிறோம்",
      home: "முகப்பு",
      gptApps: "GPT செயலிகள்",
      terms: "விதிமுறைகள்",
      premium: "பிரீமியம்",
      brand: "CodeVerse AI OS",
      logout: "வெளியேறு",
      searchPlaceholder: "GPT-களை தேடு...",
      edit: "மாற்று",
      delete: "அழி",
      revoke: "ரத்து செய்",
    },
  },
  hi: {
    translation: {
      welcome: "स्वागत है",
      home: "होम",
      gptApps: "GPT ऐप्स",
      terms: "नियम",
      premium: "प्रीमियम",
      brand: "CodeVerse AI OS",
      logout: "लॉग आउट",
      searchPlaceholder: "GPT खोजें...",
      edit: "संपादित",
      delete: "हटाएँ",
      revoke: "रद्द करें",
    },
  },
  ml: {
    translation: {
      welcome: "സ്വാഗതം",
      home: "ഹോം",
      gptApps: "GPT ആപ്പുകൾ",
      terms: "നിബന്ധനകൾ",
      premium: "പ്രിമിയം",
      brand: "CodeVerse AI OS",
      logout: "ലോഗ് ഔട്ട്",
      searchPlaceholder: "GPT-കൾ തിരയൂ...",
      edit: "തിരുത്തുക",
      delete: "അഴിച്ചു",
      revoke: "റദ്ദാക്കുക",
    },
  },
  kn: {
    translation: {
      welcome: "ಸ್ವಾಗತ",
      home: "ಮುಖಪುಟ",
      gptApps: "GPT ಅಪ್ಲಿಕೆಶನ್‌ಗಳು",
      terms: "ನಿಯಮಗಳು",
      premium: "ಪ್ರಿಮಿಯಂ",
      brand: "CodeVerse AI OS",
      logout: "ಲಾಗ್ ಔಟ್",
      searchPlaceholder: "GPT-ಗಳನ್ನು ಹುಡುಕಿ...",
      edit: "ಸಂಪಾದಿಸು",
      delete: "ಅಳಿಸು",
      revoke: "ರದ್ದುಗೊಳಿಸು",
    },
  },
  te: {
    translation: {
      welcome: "స్వాగతం",
      home: "హోమ్",
      gptApps: "GPT యాప్స్",
      terms: "నియమాలు",
      premium: "ప్రీమియం",
      brand: "CodeVerse AI OS",
      logout: "లాగ్ అవుట్",
      searchPlaceholder: "GPTలను శోధించండి...",
      edit: "మార్చు",
      delete: "తొలగించు",
      revoke: "రద్దు చేయి",
    },
  },
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
