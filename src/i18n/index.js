import { createI18n } from "vue-i18n";
import ptBR from "../locales/pt-BR.json";
import es from "../locales/es.json";
import en from "../locales/en.json";

const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.languages[0];

  if (browserLang.startsWith("pt")) return "pt-BR";
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("en")) return "en";

  return "pt-BR";
};

const i18n = createI18n({
  legacy: false,
  locale: getBrowserLanguage(),
  fallbackLocale: "pt-BR",
  messages: {
    "pt-BR": ptBR,
    es: es,
    en: en,
  },
});

export default i18n;
