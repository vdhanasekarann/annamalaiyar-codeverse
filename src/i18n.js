import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: { welcome: "Welcome" } },
  ta: { translation: { welcome: "வரவேற்கிறோம்" } },
  hi: { translation: { welcome: "स्वागत है" } },
  ml: { translation: { welcome: "സ്വാഗതം" } },
  kn: { translation: { welcome: "ಸ್ವಾಗತ" } },
  te: { translation: { welcome: "స్వాగతం" } }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
