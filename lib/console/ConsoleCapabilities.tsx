"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * 콘솔(지상국)은 레이아웃에 전역으로 떠 있지만, "ls/open/close/filter/
 * reset/mode" 같은 명령은 페이지마다 다른 state(필터, 열린 프로젝트,
 * 모드)를 건드려야 한다. 각 페이지 컴포넌트가 마운트될 때 자신이
 * 지원하는 기능을 여기 등록하고, 콘솔은 "현재 등록된 것"만 실행한다.
 * 등록되지 않은 기능은 "이 페이지에서는 사용할 수 없음"으로 안내한다
 * (spec §8).
 */
export type ConsoleCapabilities = {
  mode?: {
    current: () => "backend" | "game";
    set: (mode: "backend" | "game") => void;
  };
  projects?: {
    list: () => { id: string; name: string }[];
    open: (query: string) => string | null; // 찾은 프로젝트 이름, 못 찾으면 null
    close: () => void;
  };
  /** "filter" 뒤의 나머지 토큰을 그대로 받는다. 처리했으면
   * {label}을 돌려주고, 모르는 그룹/값이면 undefined를 돌려준다. */
  filter?: {
    apply: (args: string[]) => { group: string; label: string; added: boolean } | undefined;
    help: string;
  };
  reset?: () => void;
};

type SetCapabilities = (c: ConsoleCapabilities) => void;

// 두 컨텍스트로 나눈다: setter는 절대 바뀌지 않는 안정된 참조이고,
// 값(capabilities)만 등록될 때마다 바뀐다. 하나로 합치면(예:
// {capabilities, setCapabilities} 객체 하나) 등록하는 쪽의 effect가
// 그 합쳐진 값을 의존성으로 가지게 되어, setCapabilities를 부르면
// 그 effect가 다시 돌고 또 setCapabilities를 불러 무한 루프에
// 빠진다(실제로 재현된 "Maximum update depth exceeded" 버그).
const CapabilitiesContext = createContext<ConsoleCapabilities>({});
const SetCapabilitiesContext = createContext<SetCapabilities | null>(null);

export function ConsoleCapabilitiesProvider({ children }: { children: ReactNode }) {
  const [capabilities, setCapabilities] = useState<ConsoleCapabilities>({});
  return (
    <SetCapabilitiesContext.Provider value={setCapabilities}>
      <CapabilitiesContext.Provider value={capabilities}>
        {children}
      </CapabilitiesContext.Provider>
    </SetCapabilitiesContext.Provider>
  );
}

/**
 * 페이지 컴포넌트가 마운트되어 있는 동안 기능을 등록한다. 호출부에서
 * capabilities를 useMemo로 안정된 참조로 넘겨야, 내부 state가 바뀔
 * 때만 다시 등록되고 콘솔이 최신 state를 보고 동작한다.
 */
export function useRegisterConsoleCapabilities(capabilities: ConsoleCapabilities) {
  const setCapabilities = useContext(SetCapabilitiesContext);
  useEffect(() => {
    if (!setCapabilities) return;
    setCapabilities(capabilities);
    return () => setCapabilities({});
  }, [setCapabilities, capabilities]);
}

export function useConsoleCapabilities(): ConsoleCapabilities {
  return useContext(CapabilitiesContext);
}
