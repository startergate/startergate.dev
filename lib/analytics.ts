// GA4 측정 ID (spec §9) — 기존 Gatsby 사이트와 동일.
export const GA_MEASUREMENT_ID = "G-99G6KZQV5K";

type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 커스텀 이벤트 전송 헬퍼. 프로젝트 팝업 열기, 언어/모드 변경,
 * CV 다운로드 등은 각 기능을 구현할 때 이 함수로 호출한다 (spec §9 [제안]).
 */
export function sendEvent(name: string, params?: GtagEventParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
