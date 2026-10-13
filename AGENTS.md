<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# startergate.dev — 리뉴얼 작업 지침

최호승(startergate)의 개인 프로필 사이트 리뉴얼. 기존 Gatsby 사이트(`startergate/startergate.github.io`)를 Next.js로 다시 만든다.
기획 상세는 `docs/spec.md`, 시각 시안은 `docs/design/`에 있다. 작업 전에 해당 페이지의 스펙과 시안을 먼저 읽는다.

## 기본 규칙

- 사용자와의 대화, 커밋 메시지 본문 설명, PR 설명은 한국어로 쓴다. 코드 식별자와 주석은 영어.
- 시안(`docs/design/*.dc.html`)은 **시각 참고용**이다. 그 안의 템플릿 문법(`<x-dc>`, `{{...}}`, `<sc-for>`, `<sc-if>`, `<dc-import>`, `DCLogic`)이나 샘플 데이터를 그대로 옮기지 않는다. 레이아웃·간격·색·상호작용만 참고해 React 컴포넌트로 새로 구현한다.
- 시안과 `docs/spec.md`가 다르면 spec이 우선이다. 둘 다 다루지 않는 결정은 임의로 정하지 말고 물어본다.
- 내용(소개 문구, 경력, 프로젝트, 링크, 로고)은 기존 사이트 저장소의 데이터를 출처로 삼는다. 시안 속 문구는 자리표시용일 수 있다.
- 한 번에 한 페이지/기능씩 작업하고, 끝나면 `npm run lint`와 `npm run build`가 통과하는지 확인한다.

## 스택과 배포

- Next.js (App Router, 이 저장소의 버전) + React + TypeScript + Tailwind CSS v4.
- GitHub Pages 정적 배포 → `next.config.ts`에 `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`. 서버 기능(미들웨어, Route Handler 동적 응답, ISR, `next/image` 최적화)은 쓰지 않는다.
- `useSearchParams`를 쓰는 클라이언트 컴포넌트는 `<Suspense>`로 감싼다(정적 export 빌드 요건).
- 방문자 분석은 기존과 같은 GA4 측정 ID `G-99G6KZQV5K`.
- 새 의존성은 꼭 필요한 것만 추가한다. 위성 계산에는 `satellite.js`를 쓴다.

## 라우팅 요약 (상세는 spec §2)

- 언어는 경로 접두사: `/ko/...`, `/en/...`. 루트 `/`는 브라우저 언어(또는 저장된 선택)로 클라이언트 리다이렉트.
- 페이지: `/{lang}/` 메인, `/{lang}/projects/` 프로젝트 목록, `/{lang}/timeline/` 타임라인.
- 프로젝트 상세는 별도 라우트가 없는 **팝업**. 목록 페이지에서만 `?p={id}`로 URL에 반영하고, 뒤로가기로 닫힌다. 메인에서 연 팝업은 URL을 바꾸지 않는다.
- 프로필 모드(backend/game)는 메인 전용, `?mode=game`으로 지정 가능, 기본값 backend.
- `/Conferences`, `/cv.pdf` 등은 이 앱의 라우트가 아니다(spec §2.4).

## 디자인 토큰

CSS 변수로 정의하고 `data-theme="dark|light"`로 전환한다. Tailwind에서는 `@theme`로 연결해 쓴다.

| 토큰 | Dark | Light |
|---|---|---|
| bg | `#080B12` | `#F4F6FA` |
| surface | `#0F1420` | `#FFFFFF` |
| surface2 | `#182033` | `#E9EDF4` |
| line | `#232B3D` | `#DBE0EA` |
| text | `#E8ECF4` | `#0F1522` |
| muted | `#A6AFC1` | `#495266` |
| dim | `#8590A5` | `#636C82` |
| accent (amber) | `#FFB547` | `#9C5300` |
| open-to-work 점 | `#4ADE80` | `#16A34A` |

진행 상황 색(카드·팝업 공통):

| 상태 키 | 표시 | Dark | Light |
|---|---|---|---|
| `planning` | 계획 중 / Planning | `#8E97A8` | `#6B7280` |
| `active` | 진행 중 / In progress | `#F5C542` | `#B45309` |
| `canceled` | 취소 / Canceled | `#F87171` | `#DC2626` |
| `done` | 완료 / Done | `#4ADE80` | `#15803D` |

- 섹션 번호 라벨(`01 — About` 등)은 강조색이 아니라 회색(dim) 계열.
- 배경은 단색이 아니라 하늘 그라데이션: 다크=밤하늘, 라이트=새벽. 페이지 맨 아래에는 언덕 두 개로 된 지면.
- 상단 네비 pill과 하단 고정 버튼은 배경 투명(라이트 모드 하단 버튼만 8% 틴트). 모드 스위치의 선택 항목은 반투명 배경.
- 위성 라벨 등 배경 요소의 글자는 연한 색(배경 일부로 보이게).

## 폰트

- 라틴: **Inter**, 한글 및 기타: **Pretendard**(동적 서브셋 `pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css` 권장), 고정폭: **JetBrains Mono**.
- `font-family: Inter, Pretendard, system-ui, sans-serif` 순서로 두어 라틴은 Inter, 한글은 Pretendard로 떨어지게 한다. Inter·JetBrains Mono는 `next/font/google` 사용.
- 기본 스캐폴드의 Geist 폰트는 제거한다.

## 접근성·품질

- 아이콘만 있는 버튼에는 `aria-label`. 팝업은 포커스 트랩, Esc 닫기, 열 때 스크롤 잠금.
- `prefers-reduced-motion`이면 유성·위성 드리프트·곡선 채움 애니메이션을 끈다.
- 모든 사용자 노출 텍스트는 i18n 사전(`ko`/`en`)을 거친다. 하드코딩한 한국어 문자열을 컴포넌트에 넣지 않는다.

## 작업 순서 제안

1. 기반: `output: 'export'`, 폰트, 토큰/테마, `[lang]` 라우팅·사전, 레이아웃(네비 pill, 하단 버튼, 지면, 하늘 배경), GA4.
2. 데이터 이전: 기존 저장소 `src/data`, `src/enums`, `src/images`, `static/`을 spec §5 스키마로 옮긴다.
3. 메인 → 프로젝트 카드/팝업 → 프로젝트 목록(필터) → 타임라인.
4. 위성(GitHub Action + 클라이언트 계산) → 콘솔 이스터에그.
5. 배포 워크플로.

## 참고 위치

- 기획: `docs/spec.md`
- 시안: `docs/design/README.md` (어떤 파일이 어떤 화면인지)
- 기존 사이트: https://github.com/startergate/startergate.github.io (`src/pages/index.tsx`, `src/data/**`, `src/enums/**`, `src/images/**`, `static/*.pdf`, `gatsby-config.js`)
