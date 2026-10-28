import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localePrefix: "as-needed",
  localeDetection: false, // Loi 96: French is the default regardless of browser language
});
