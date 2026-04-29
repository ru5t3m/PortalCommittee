import kk from "@/messages/kk.json";
import ru from "@/messages/ru.json";
import en from "@/messages/en.json";

export const locales = ["kk", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

const dictionaries = { kk, ru, en };

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: string) {
  return dictionaries[isLocale(locale) ? locale : "ru"];
}
