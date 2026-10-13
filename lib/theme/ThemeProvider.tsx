"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  /** 마운트 후(실제 테마와 동기화된 뒤) true. 테마에 따라 다른
   * 마크업(아이콘, 이미지 src 등)을 그리는 곳은 이 값이 true가 되기
   * 전엔 서버와 똑같은 중립 상태를 그려야 하이드레이션이 안 깨진다. */
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // localStorage 접근 불가(프라이버시 모드 등) — 저장만 건너뛴다.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 서버는 실제 테마를 알 수 없다(인라인 스크립트가 <html data-theme>을
  // 설정하는 건 브라우저에서만 일어난다). 첫 렌더는 서버·클라이언트가
  // 똑같이 "dark"로 시작해야 하이드레이션이 깨지지 않는다 — lazy
  // initializer로 document를 바로 읽으면 서버 추정값과 달라져 아이콘
  // 등이 구조적으로 어긋나는 하이드레이션 오류가 난다(실제로 재현됨).
  // 마운트 후 한 번만 실제 값으로 동기화한다.
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 외부 시스템(인라인 스크립트가 적어 둔 DOM 속성)에서 실제 값을
    // 읽어와 동기화하는 것이라 setState-in-effect 규칙의 예외에
    // 해당한다 — 마운트 전에는 알 수 없는 값이라 lazy init으로
    // 당겨올 수 없다.
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState("light");
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
