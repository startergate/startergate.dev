/**
 * global-not-found 전용. 정적 export라 빌드되지 않은 경로는 전부 여기로
 * 온다 — 즉 이 스크립트가 실행됐다는 것 자체가 해당 id/경로가 존재하지
 * 않는다는 뜻이다 (spec §2.4).
 *
 * - 신형 `/{lang}/projects/{id}/`: 목록만 보이는 `/{lang}/projects/`로 보낸다.
 * - 구 Gatsby 사이트 형식 `/project/{Name}/`: 같은 방식으로 목록으로 보낸다.
 *   TODO(2단계 데이터 이전): {Name} -> {id} 매핑이 준비되면 매칭되는 경우
 *   해당 `/{lang}/projects/{id}/`로 직접 보내 깊은 링크를 살린다.
 */
export const LEGACY_REDIRECT_SCRIPT = `(function(){
try {
  var path = window.location.pathname;
  var defaultLocale = 'ko';
  var m = path.match(/^\\/(ko|en)\\/projects\\/[^/]+\\/?$/);
  if (m) {
    window.location.replace('/' + m[1] + '/projects/');
    return;
  }
  var legacy = path.match(/^\\/project\\/[^/]+\\/?$/);
  if (legacy) {
    window.location.replace('/' + defaultLocale + '/projects/');
    return;
  }
} catch (e) {}
})();`;
