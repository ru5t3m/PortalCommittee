import kk from "@/messages/kk.json";
import ru from "@/messages/ru.json";

export const locales = ["kk", "ru"] as const;
export type Locale = (typeof locales)[number];

const dictionaries = { kk, ru };

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: string) {
  return dictionaries[isLocale(locale) ? locale : "ru"];
}
