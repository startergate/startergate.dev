import type { Locale } from "./locales";
import type { Dictionary } from "./dictionaries/ko";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  ko: () => import("./dictionaries/ko").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
