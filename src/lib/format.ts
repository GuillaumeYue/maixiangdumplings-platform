export const intlLocale = (locale: string) =>
  locale === "zh" ? "zh-CN" : locale === "en" ? "en-CA" : "fr-CA";

export const formatMoney = (cents: number, locale: string = "fr") =>
  new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol" }).format(cents / 100);

type Localized = { nameFr: string; nameEn?: string | null; nameZh?: string | null };
type LocalizedDesc = { descFr?: string | null; descEn?: string | null; descZh?: string | null };

/** French is mandatory; other languages fall back to French. */
export function localName(item: Localized, locale: string) {
  if (locale === "en") return item.nameEn ?? item.nameFr;
  if (locale === "zh") return item.nameZh ?? item.nameFr;
  return item.nameFr;
}

export function localDesc(item: LocalizedDesc, locale: string) {
  if (locale === "en") return item.descEn ?? item.descFr ?? "";
  if (locale === "zh") return item.descZh ?? item.descFr ?? "";
  return item.descFr ?? "";
}

export const formatTime = (d: Date, locale: string) =>
  new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "America/Toronto", timeStyle: "short" }).format(d);

export const formatDateTime = (d: Date, locale: string) =>
  new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);

/** YYYY-MM-DD in local time, for <input type="date">. */
export const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
