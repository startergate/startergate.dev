# 디자인 시안

Claude Design 캔버스에서 만든 시안 원본이다. 원본 캔버스(소유자 전용): https://claude.ai/artifact/LwZaJ7UBxYvdGYzCQuYGvs

`.dc.html`은 캔버스 전용 템플릿 형식이라 브라우저에서 바로 열면 제대로 렌더되지 않는다.
구현할 때는 **CSS(각 파일 `<style>`), 마크업 구조, 상호작용 로직**을 참고하고, 템플릿 문법이나 샘플 데이터는 옮기지 않는다(AGENTS.md 참고).

| 파일 | 화면 | 메모 |
|---|---|---|
| `Main.dc.html` | 메인 (다크) | 히어로·위성 하늘, 섹션 01~05, 네비 pill, 하단 버튼, 콘솔, 팝업 연결 |
| `MainLight.dc.html` | 메인 (라이트, 네비 펼친 상태) | Main과 같은 코드, `initialTheme=light`, `navOpen=true` |
| `Timeline.dc.html` | 타임라인 | 카테고리 칩 + 연도별 세로 타임라인 (`TL_ITEMS`) |
| `Projects.dc.html` | 프로젝트 목록 | 드롭다운 필터 4종, 칩, 카운트, 카드 그리드 (`ALL_PROJECTS`, `CAT_OF`, `FILTER_GROUPS`) |
| `ProjectsDeep.dc.html` | 목록 + 팝업 열린 상태 | `?p=dotori` 직접 진입 시 모습 |
| `ProjectCard.dc.html` | 프로젝트 카드 컴포넌트 | 메인·목록 공용 |
| `ProjectModal.dc.html` | 프로젝트 상세 팝업 컴포넌트 | 곡선 기간 표시, 진행 상황/참여 인원 타일, 본문, 이전/다음 |
| `canvas.json` | 캔버스 보드 배치 정보 | 구현에는 필요 없음 |

주의할 점:

- `ProjectModal`의 링크 복사 주소는 시안 그대로 `startergate.dev/{lang}/projects/{id}/` 형식을 쓴다(spec §2.3, 2026-10-13 변경: 쿼리 파라미터 방식에서 실제 라우트로 바꿨다). 시안엔 `{lang}` 접두사만 빠져 있다.
- 시안 속 위성 위치는 고정 샘플이다. 실제는 TLE + satellite.js 계산 (spec §7).
- 폰트는 `/_blob/...` 캔버스 자산을 참조하는데, 구현에서는 spec/AGENTS의 폰트 설정을 따른다.
- 시안의 한국어 문구 중 소개·경력 요약은 이력서 기반 초안이다. 최종 내용은 기존 사이트 데이터 기준.
