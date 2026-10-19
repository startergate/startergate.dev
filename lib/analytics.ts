import siteData from "@/data/site.json";

// GA4 측정 ID (spec §9) — 기존 Gatsby 사이트와 동일. data/site.json에서 관리한다.
export const GA_MEASUREMENT_ID = siteData.gaMeasurementId;

type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 커스텀 이벤트 전송 헬퍼 (spec §9). 보내는 이벤트:
 * - `project_open` { id }
 * - `lang_change` { from, to }
 * - `mode_change` { from, to }
 * - `cv_download` { file }
 * 바로 페이지를 떠나는 동작(언어 전환, 다운로드)에서도 유실되지 않도록
 * 항상 beacon 전송을 쓴다.
 */
export function sendEvent(name: string, params?: GtagEventParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, { ...params, transport_type: "beacon" });
}
