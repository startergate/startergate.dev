"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProfileMode } from "@/lib/data/types";

/**
 * 메인 전용 프로필 모드. URL 쿼리(?mode=game)만 진실 공급원으로 쓴다
 * (spec §4.1 — localStorage에는 저장하지 않는다). useSearchParams를
 * 쓰므로 호출부에서 <Suspense>로 감싼다.
 */
export function useProfileMode(): [ProfileMode, (mode: ProfileMode) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const mode: ProfileMode = searchParams.get("mode") === "game" ? "game" : "backend";

  const setMode = useCallback(
    (next: ProfileMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "backend") {
        params.delete("mode");
      } else {
        params.set("mode", next);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  return [mode, setMode];
}
