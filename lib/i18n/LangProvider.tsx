"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./locales";
import type { Dictionary } from "./dictionaries/ko";

type LangContextValue = {
  lang: Locale;
  dict: Dictionary;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({
  lang,
  dict,
  children,
}: LangContextValue & { children: ReactNode }) {
  return (
    <LangContext.Provider value={{ lang, dict }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within a LangProvider");
  }
  return ctx;
}
