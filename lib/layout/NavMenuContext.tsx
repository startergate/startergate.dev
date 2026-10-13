"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * 상단 네비 펼침 상태를 NavPill과 콘솔(`menu` 명령)이 함께 쓸 수
 * 있도록 끌어올린 공용 상태 (spec §8의 `menu` 명령).
 */
const Ctx = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Ctx.Provider value={{ open, setOpen }}>{children}</Ctx.Provider>;
}

export function useNavMenu() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNavMenu must be used within a NavMenuProvider");
  return ctx;
}
