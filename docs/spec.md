# startergate.dev 리뉴얼 기획

이 문서는 디자인 시안 작업과 기획 확인 과정에서 확정한 내용을 정리한 것이다.
**[제안]** 표시는 확정이 아니라 구현 편의를 위한 기본안이다. 바꾸고 싶으면 이 문서를 고친 뒤 구현한다.
**[미정]** 표시는 아직 결정이 필요한 항목이다.

---

## 1. 개요

- 기존 사이트의 구성(히어로 → 소개 → 프로젝트 하이라이트 → 기술 → 이력 → 링크)은 유지하고, 디자인 언어를 통일한다.
- 우주항공 테마: 닉네임 satellite에서 따온 **실시간 위성 하늘**(메인 히어로), 항공 느낌의 **프로젝트 기간 표시**(팝업). 항공 전문 용어는 쓰지 않고 시각 요소로만 표현한다.
- 터미널은 전체 콘셉트가 아니라 좌측 하단의 **콘솔 이스터에그**로만 존재한다.
- 다크/라이트 모드, 한국어/영어를 모두 지원한다.

## 2. 라우팅과 URL

### 2.1 언어

- 모든 페이지는 `/{lang}/` 접두사를 가진다. `lang ∈ {ko, en}`.
- 사이트 안의 **모든 텍스트**(UI 문구, 소개, 경력, 프로젝트 설명, 콘솔 출력)가 번역 대상이다.
- 루트 `/` 진입 시: 사용자가 이전에 언어를 직접 고른 기록이 있으면 그 언어, 없으면 `navigator.language`가 `ko`로 시작하면 `/ko/`, 그 외는 `/en/`으로 이동한다. 정적 배포라 미들웨어 없이 클라이언트에서 처리한다.
- **[제안]** 언어를 직접 고르면 `localStorage`에 저장한다. 언어 전환 시 같은 페이지·같은 쿼리를 유지한 채 접두사만 바꾼다.
- `<html lang>`과 `hreflang` 대체 링크를 언어에 맞게 설정한다.
- 영어 번역문이 아직 없는 데이터는 **[제안]** 한국어로 대체 표시한다.

### 2.2 페이지

| 경로 | 페이지 | 시안 |
|---|---|---|
| `/{lang}/` | 메인 | `Main.dc.html`(다크), `MainLight.dc.html`(라이트, 네비 펼침) |
| `/{lang}/projects/` | 프로젝트 목록 | `Projects.dc.html` |
| `/{lang}/projects/{id}/` | 목록 + 해당 프로젝트 팝업 열린 상태 | `ProjectsDeep.dc.html` |
| `/{lang}/timeline/` | 타임라인 (학력·수상·자격·그룹 활동·경력) | `Timeline.dc.html` |

- 목록·타임라인 페이지는 히어로 대신 좌측 상단에 **페이지 제목**(`Projects`, `Timeline`)만 둔다. 페이지 설명 문구는 넣지 않는다.

### 2.3 프로젝트 상세 경로와 쿼리 파라미터

- 프로젝트 상세 팝업은 **실제 정적 라우트** `/{lang}/projects/{id}/`다 (당초 쿼리 파라미터 `?p=` 방식에서 변경, 2026-10-13). `app/[lang]/projects/[id]/page.tsx`가 `generateStaticParams`로 모든 프로젝트 id를 빌드 타임에 정적 생성하고, 목록 페이지와 같은 컴포넌트로 팝업만 열린 상태를 그린다.
  - 목록에서 카드를 열면 `router.push('/{lang}/projects/{id}/')`. 뒤로가기로 팝업이 닫힌다.
  - 팝업 안에서 이전/다음 프로젝트로 넘길 때는 `router.replace(...)`로 바꾼다(뒤로가기 한 번에 닫히도록).
  - 닫기 버튼·Esc·오버레이 클릭으로 닫으면 `router.back()`, 직접 진입한 경우(히스토리에 목록이 없음)에는 `router.replace('/{lang}/projects/')`.
  - 존재하지 않는 id로 들어오면 정적 export 특성상 호스트가 404를 서빙한다. §2.4의 `global-not-found` 리다이렉트가 이 경우를 포함해 처리한다(목록만 보여줌).
  - 이 방식 덕분에 프로젝트 목록 쪽에는 `useSearchParams`/`Suspense`가 필요 없다(메인의 `mode` 쿼리에만 남는다).
- `mode` (메인 전용, 쿼리 파라미터 유지): `backend`(기본) | `game`. 메인에서 모드를 바꾸면 `replaceState`로 반영한다. 다른 페이지에서는 무시한다.
- 필터 상태는 URL에 남기지 않는다.
- 메인에서 여는 팝업은 URL을 바꾸지 않는다.
- 팝업의 **링크 복사** 버튼은 `https://startergate.dev/{lang}/projects/{id}/`를 복사한다.

### 2.4 이 앱 밖의 경로

- `/Conferences`: 별도 저장소 `startergate/Conferences`의 Jekyll 페이지다. 지금처럼 외부 링크로 이동한다.
- CV PDF: 기존처럼 저장소의 정적 파일을 그대로 서빙한다. `public/`에 둔다.
  - `cv.pdf` = 한국어 1페이지 요약
  - `resume-ko.pdf` = 한국어 전체
  - `resume-en.pdf` = 영어 전체
  - 기존 사이트처럼 이 세 개를 고르는 다운로드 드롭다운을 둔다. **[제안]** 영어 페이지에서는 `resume-en.pdf`를 먼저 보여준다.
- **404 처리 (`global-not-found`)**: 정적 export에서 빌드되지 않은 경로는 전부 여기로 온다. 경로를 보고:
  - `/{lang}/projects/{id}/` (신형, id가 존재하지 않는 경우) 또는 `/project/{Name}/` (구 사이트 형식) 패턴이면 `/{lang}/projects/`(목록만, 팝업 없음)로 클라이언트 리다이렉트한다.
  - **[제안]** 구 `{Name}` → 신 `{id}` 매핑이 데이터 이전(§5) 이후 준비되면, 매핑에 있는 이름은 목록이 아니라 해당 `/{lang}/projects/{id}/`로 직접 보내 깊은 링크를 살린다. 매핑이 없거나 매칭되지 않으면 목록으로 보낸다.
  - 그 외 경로는 일반 404 안내만 보여준다.

### 2.5 배포 **[미정]**

- 현재 `startergate.dev` 도메인은 `startergate/startergate.github.io` 사용자 사이트에 연결되어 있다. `/Conferences` 같은 다른 저장소의 프로젝트 페이지도 이 도메인 아래에서 서빙된다.
- 이 저장소를 프로젝트 페이지로 바로 배포하고 커스텀 도메인을 옮기면 `/Conferences` 경로가 깨질 수 있다.
- **[제안]** 빌드는 이 저장소에서 하고, 결과물(`out/`)은 `startergate.github.io` 저장소의 배포 브랜치로 푸시한다(deploy key 또는 PAT 사용). 이렇게 하면 도메인 구성을 바꾸지 않아도 된다.

## 3. 공통 레이아웃

### 3.1 상단 네비게이션 (우측 상단 고정 pill)

- 기본 상태에서는 오른쪽부터 **로고(64px 원형, 메인 링크)**, 테마 전환, 언어 선택(현재 국기)만 보인다.
- 언어 국기 왼쪽의 **‹ 화살표**를 누르면 메뉴가 왼쪽으로 펼쳐진다. 펼쳐지는 링크:
  - GitHub (https://github.com/startergate)
  - Projects
  - Timeline
  - Conferences
  - Blog
  - CV
- **Blog** 링크는 블로그 도메인이 아직 정해지지 않았다. 링크는 없고, 호버·포커스하면 글자(Blog) 그대로 두고 아래에 말풍선으로 "준비 중 / Coming soon"을 띄운다(2026-10-13 변경: 글자를 바꿔치기하던 것에서 말풍선 방식으로).
- **CV**는 메인의 이력 섹션(`#resume`)으로 이동한다. 다른 페이지에서 누르면 `/{lang}/#resume`으로 간다.
- **언어 선택**: 현재 국기만 보인다. 누르면 드롭다운에 `🇰🇷 KO 한국어`와 `🇺🇸 EN English`가 나온다. 국기는 SVG를 쓰고 이모지 국기는 쓰지 않는다(Windows에서 국기 이모지가 표시되지 않기 때문).
- 모든 버튼은 크기, 간격, 호버 배경을 하나로 통일한다.
- 네비게이션 배경은 투명하다.
- 메뉴를 펼친 상태는 **[제안]** 페이지 이동 사이에서 유지하지 않는다.

### 3.2 하단 고정 요소

- **우측 하단**
  - 프로필 모드 스위치: 💻 백엔드 / 🎮 게임. 이모지는 기존 사이트와 같은 것을 쓰고 색을 채운다. **메인에서만 보인다.**
  - 맨 위로 버튼: 모든 페이지에 있다.
- **좌측 하단**: `>_` 콘솔 런처(§8).
- 위 버튼들의 배경은 투명하다. 라이트 모드에서만 8% 틴트를 준다.

### 3.3 배경과 지면

- 배경은 하늘 그라데이션이다. 다크 모드는 밤하늘, 라이트 모드는 새벽 하늘이다.
- 별과 유성은 히어로 영역에만 둔다.
- 모든 페이지 맨 아래에 언덕 두 개로 된 지면이 있다. 그 위 가운데에 `© {현재 연도} startergate`만 둔다.

### 3.4 테마

- 기존과 같다. 저장된 값이 있으면 그 값을 쓰고, 없으면 `prefers-color-scheme`을 따른다.
- 첫 페인트 전에 인라인 스크립트로 `data-theme`를 설정해서 화면이 깜빡이지 않게 한다.

## 4. 페이지별 요구사항

### 4.1 메인

- **히어로**
  - 높이는 화면 전체(100vh)다.
  - 텍스트는 기존 사이트와 같은 배치다.
    - 표어: 아직 정하지 않았다. 그대로 `[새 표어]`로 표시한다.
    - `STARTERGATE / 최호승`
    - 역할: 모드에 따라 바뀐다.
    - 이메일: `me@startergate.dev`
    - Open to work 표시
  - 배경은 위성 하늘이다(§7). 지평선 위 캡션에 "서울 상공 · KST 시계"와 **내 위치로 보기** 버튼을 둔다.
  - 아래쪽에 스크롤을 유도하는 화살표를 둔다.
- **Open to work**: 작은 글씨로 표시하고 강조색은 쓰지 않는다. 앞에 초록색 펄스 점을 붙인다.
  - `data/site.json`의 `openToWork: boolean`으로 켜고 끈다. 저장소를 직접 수정해서 바꾼다.
  - "다음 팀을 찾고 있습니다" 문구는 넣지 않는다.
- **01 About**: 문단 4개로 나누고 핵심 구절은 굵게 표시한다. 순서는 소개 → 기술 스택 문단 → 경험 문단 → 마무리다. 숫자 지표 카드는 넣지 않는다.
- **02 Project Highlights**: 2열 그리드에 프로젝트 카드(§6.1)를 둔다. 카드를 누르면 팝업이 열리고 URL은 바뀌지 않는다.
  - 어떤 프로젝트를 보여줄지는 데이터의 `highlight` 필드로 모드별로 정한다(§5.1).
  - 목록 페이지로 가는 링크를 둔다.
- **03 Technologies**: 기술 이름 옆에 작은 로고를 붙인 배지 형태다. 기존처럼 사용 중 / 사용해 봄 / 학습 중으로 그룹을 나누고, 모드에 따라 내용이 바뀐다.
  - 로고 파일이 없으면 글자 약어(예: `Rb`)로 대신 표시한다.
- **04 Résumé**: 경력 카드를 둔다.
  - 회사 로고, 직함, 기간, 한 줄 요약을 보여준다. 호버하거나 클릭하면 상세 설명과 사용 기술이 펼쳐진다.
  - 학력, 수상, 그룹 활동은 메인에서 빼고, 대신 **Timeline 링크 카드**(surface 배경)를 둔다.
  - CV 다운로드 드롭다운도 여기에 둔다.
- **05 Links**: 기술 배지와 같은 스타일의 링크 배지다. 주소는 기존 `src/data/links.json`을 따른다.
  - 메일, LinkedIn, Rocketpunch, GitHub, StackShare, npm, Docker Hub
- **프로필 모드**: 기존 사이트처럼 역할 문구, 소개, 하이라이트 프로젝트, 기술 목록, 이력 일부가 모드에 따라 바뀐다.
  - 내용은 일단 기존 사이트의 `src/pages/index.tsx`에 있는 backend/game 분기 내용을 그대로 옮긴다.
  - **[제안]** 모드 선택은 URL 쿼리만 진실 공급원으로 삼고 localStorage에는 저장하지 않는다. 기존 사이트는 localStorage에 저장했다. 바꾸려면 이 항목을 수정한다.

### 4.2 프로젝트 목록

- 정렬: 시작일 내림차순(최신순).
- **필터 바**: 필터 4개가 각각 드롭다운이다. 드롭다운 안의 항목은 체크박스이고 개수가 함께 표시된다.
  - 분류: 현업 / 팀 프로젝트 / 개인 프로젝트
  - 사용 기술: 항목이 많아서 2열로 배치한다.
  - 프로젝트 유형
  - 진행 상황: 상태 색 점을 함께 표시한다.
- 같은 그룹 안에서는 OR, 그룹끼리는 AND로 결합한다.
- 선택한 필터는 칩으로 보이고 ×로 하나씩 해제할 수 있다. 전체 초기화 버튼과 "N개 프로젝트" 카운트를 둔다.
- 드롭다운 바깥을 클릭하면 닫힌다.
- 필터 옵션은 데이터에서 자동으로 모은다. 결과가 0개인 옵션도 숨기지 않는다.
- 그리드는 `repeat(auto-fill, minmax(340px, 1fr))`이고 카드는 메인과 같은 컴포넌트를 쓴다.
- 팝업의 이전/다음 순서는 **현재 필터가 적용된 목록 순서**를 따른다.

### 4.3 타임라인

- 카테고리 칩: 전체 / 경력 / 수상 / 자격 / 그룹 활동 / 학력.
- 연도별로 묶은 세로 타임라인이다.
- 데이터는 기존 `index.tsx`의 학력, 수상, 그룹 활동과 이력서 내용을 `data/timeline.json`으로 옮긴다.

## 5. 데이터

데이터는 `data/` 아래 JSON(또는 TS)로 두고 빌드할 때 읽는다. 기존 `src/data`, `src/enums`에서 옮긴다.

### 5.1 프로젝트 (`data/projects/{id}.json`) **[제안 스키마]**

```ts
type L10n = { ko: string; en?: string };
type Project = {
  id: string;                  // URL용 slug, 소문자-하이픈 (예: "dotori", "fetching-admin")
  name: string;
  description: L10n;
  category: 'work' | 'team' | 'personal';   // 현업 / 팀 / 개인 — 데이터로 지정
  team?: { name: string; link?: string };   // 있으면 팝업 상단 라벨이 "{team.name} 프로젝트"
  status: 'planning' | 'active' | 'canceled' | 'done';
  startedAt: string;           // YYYY-MM-DD
  finishedAt?: string;         // 진행 중·계획 중이면 생략 가능
  types: string[];             // 프로젝트 유형 (기존 type)
  techs: string[];             // 사용 기술 (기존 tags)
  part?: string;               // 카드에 쓰는 담당 영역: "Back-end" | "Front-end" | "Full-stack" | ...
  collaborators: { name: string; roles: L10n[] | string[] }[];
  logo?: { src: string; srcOnLight?: string; isTitle?: boolean; background?: string }; // background: 로고가 흰색/검은색 한 가지뿐이라 테마에 따라 안 보일 때 고정 배경색 (2026-10-15 추가)
  images?: { src: string; description?: L10n }[];   // 여러 장 가능, 없어도 됨
  links?: { type: string; link: string; label: string }[];
  contents?: { title: L10n; text?: L10n; ref?: string; image?: string }[];  // 본문 섹션, 없어도 됨
  highlight?: { backend?: number; game?: number };   // 값 = 하이라이트 순서. 없으면 하이라이트 아님
};
```

기존 데이터에서 옮길 때의 매핑:

| 기존 | 새 스키마 |
|---|---|
| `status: "Done"` | `done` |
| `status: "In Progress"` | `active` |
| `status: "Planning"` | `planning` |
| `status: "Canceled"` | `canceled` |
| `status: "Failed"` | `canceled` ("실패" 상태는 따로 두지 않는다) |
| `owner` | `team` |
| `tags` | `techs` |
| `type` | `types` |
| `imgSrc`, `imgSrcOnLightMode`, `imageIsTitle` | `logo` |
| `isHighlighted`, `orderLevel` | `highlight` |

- 기존 하이라이트는 `type`에 "Game"이 있는지로 모드를 나눴다. 새 스키마에서는 `highlight.backend`와 `highlight.game`으로 직접 지정한다. 2단계 이전 때는 기존 `index.tsx`의 GraphQL 쿼리(`isHighlighted DESC, orderLevel ASC, name ASC`, `limit 4`)를 그대로 계산해 고정값으로 옮겼다 — backend: `fetching-admin`(1), `fetching-commerce`(2), `dotori`(3), `eliverd`(4) / game: `lost`(1), `basterds`(2), `dont-afraid`(3).
- `category`(현업/팀/개인)는 기존 데이터에 없으므로 새로 채운다. 시안 작업 때 정한 분류는 `docs/design/Projects.dc.html`의 `CAT_OF`에 있으니 참고한다(해당 파일은 `fetching-admin` 등을 `admin`처럼 줄인 id로 쓰지만, 실제 `id`는 이 문서의 예시대로 `fetching-admin` 전체를 쓴다).
- 사람 정보(`src/enums/people.ts`: GitHub 링크, 아바타)와 단체 정보(`organizations.ts`)는 `data/people.json`과 `data/organizations.json`으로 옮긴다.
- `fetching-*` 5개 프로젝트는 기존 데이터에 `owner`가 없고 대신 `collaborators`에 "FETCHING"을 가짜 참여자로 넣어뒀었다. 이전하면서 그 가짜 참여자를 지우고 `team: { name: "FETCHING", link: "https://github.com/Fetching-Korea" }`를 추가했다.
- `part`(담당 영역)는 기존 데이터에 대응하는 값이 없어 **2단계에서는 비워뒀다**. 필요하면 프로젝트별로 직접 채운다.
- 기존 데이터의 `"Native Appliation"` 오타(`dont-afraid`, `the-intersection`)는 `"Native Application"`으로 고쳤다(시안도 이미 고쳐서 쓰고 있었다).

### 5.2 기타 데이터 **[2단계 데이터 이전 때 확정한 스키마]**

이미지 경로는 전부 `public/images/` 기준 상대 경로이고 **선행 슬래시가 없다** (예: `"projects/dotori/logo.png"` → 실제 렌더링 시 `/images/projects/dotori/logo.png`). 기존 `src/images/**`를 그대로 `public/images/**`로 옮겼다 (회사 로고, 기술 로고, 링크 아이콘, 프로필, 프로젝트 이미지 포함). 기존 `gatsby-astronaut.png`, `gatsby-icon.png`, `pacman.png`, `down-arrow.png`는 새 디자인에서 쓸 곳이 없어 옮기지 않았다.

- `data/site.json`:
  ```ts
  type Site = {
    title: string;
    email: string;
    openToWork: boolean;
    gaMeasurementId: string;
    description: L10n;
  };
  ```
- `data/links.json`: 기존 파일을 그대로 쓴다 (`mailto://` 오타만 `mailto:`로 고쳤다).
  ```ts
  type LinkItem = { type: string; link: string; external_id: string };
  ```
- `data/techs.json`: 기존 `languages.json`을 옮겼다. 전부 로고가 있어서 `abbr`는 아직 쓰인 데이터가 없지만(로고가 없어지면 그 항목에 추가), 필드로는 남겨둔다.
  ```ts
  type Tech = {
    name: string;
    mode: 'backend' | 'game' | 'all';
    level: 'using' | 'learned' | 'learning';
    logo?: { src: string; background?: string; cover?: boolean };
    abbr?: string;
  };
  ```
- `data/experiences.json`: 기존 `index.tsx`의 경력 문단 중 첫 문단을 `summary`(카드에 항상 보임), 나머지를 `detail`(펼쳤을 때)로 나눴다. `techs`는 기존 데이터에 없던 필드라 경력 설명에 등장하는 기술 위주로 새로 채웠다. **(2026-10-15 변경)** `period`(미리 포맷한 문자열)를 `startedAt`/`finishedAt`(YYYY-MM)로 바꿨다 — "5년 3개월" 같은 기간 표시는 `lib/data/experience-format.ts`가 그때그때 계산한다(데이터에 텍스트로 중복해서 적어두지 않는다). `companyLogo`에도 `background`를 추가해, 로고가 흰색/검은색 한 가지뿐이라 테마에 따라 안 보이는 경우 고정 배경색을 줄 수 있다.
  ```ts
  type Experience = {
    company: L10n;
    companyLogo?: { src: string; srcOnLight?: string; background?: string };
    title: L10n;          // 직함
    startedAt: string;     // "YYYY-MM"
    finishedAt?: string;
    location?: L10n;
    link?: string;
    summary: L10n;
    detail?: L10n;
    techs: string[];      // techs.json의 name 참조
  };
  ```
- `data/timeline.json`: 학력·수상·자격·그룹 활동을 담는다. `org`는 항목 종류에 따라 학과/수상 등급/발급 기관/동아리 설명처럼 의미가 달라지는 보조 라벨이다. 빈실처럼 같은 소속에서 역할이 바뀐 경우, 역할·기간이 다르면 항목을 나눈다(기존 빈실 "동아리원"과 "부장"을 분리, 시안 TL_ITEMS와 동일). **(2026-10-15 변경)** `career` 항목은 더 이상 이 파일에 두지 않는다 — `data/experiences.json`과 제목·소속·설명·링크가 그대로 겹쳤다는 피드백으로, `lib/data/timeline.ts`의 `getTimelineItems()`가 `getExperiences()`에서 그때그때 합성해 나머지 항목과 합친다(최신순 정렬). `year`/`date`(미리 포맷한 문자열)도 `startedAt`/`finishedAt`/`ongoing`으로 바꿨다 — 연도 그룹 키는 `startedAt`의 앞 4자리에서, 화면 표시 문자열은 `lib/data/timeline-format.ts`의 `formatTimelinePeriod()`가 계산한다.
  ```ts
  type TimelineItem = {
    type: 'career' | 'award' | 'cert' | 'group' | 'edu';
    startedAt: string;       // "YYYY" | "YYYY-MM" | "YYYY-MM-DD" — 원 자료 정밀도 그대로
    finishedAt?: string;
    ongoing?: boolean;       // 종료일 없이 지금까지 계속되는 중
    title: L10n;
    org?: L10n;
    description?: L10n;
    link?: string;
  };
  ```
- `data/people.json`, `data/organizations.json`: 기존 `src/enums/people.ts`, `organizations.ts`를 이름을 키로 하는 객체로 옮겼다.
  ```ts
  type PersonOrOrg = { link: string; avatar?: string };
  // { "최호승": { link: "https://github.com/startergate", avatar: "startergate.png" }, ... }
  ```
- 기존 `src/enums/langs.ts`(LanguageColor), `links.ts`(링크 아이콘·배경색)는 위 스키마 어디에도 대응되지 않아 옮기지 않았다. 필요해지면 그때 스키마를 정한다.

## 6. 컴포넌트

### 6.1 프로젝트 카드 (`ProjectCard.dc.html`)

- 버튼 하나로 된 카드다. 내용 배치:
  - 첫 줄: 로고(없으면 이름 약어 모노그램) + 프로젝트명
  - 오른쪽 위: 진행 상황(색 점 + 라벨)
  - 그 아래: 한 줄 설명
  - 마지막 줄: 대표 기술 배지 · 담당 영역(part) · 기간
- 기술과 유형은 **한 줄**로 통일한다. 넘치면 말줄임 처리한다.
- 메인과 목록에서 같은 컴포넌트를 쓴다.

### 6.2 프로젝트 팝업 (`ProjectModal.dc.html`)

- 본문(`contents`)이 없어도 팝업은 항상 열린다. 진행 상황, 참여 인원, 기술 스택만으로도 보여줄 내용이 있다.
- **헤더**
  - 위쪽 라벨: 팀 정보가 있으면 `{팀명} 프로젝트`, 없으면 `팀 프로젝트` 또는 `개인 프로젝트`. 영어는 `{team} project` / `Team project` / `Personal project`.
  - 프로젝트명, 설명, 링크 복사 버튼, 닫기 버튼.
- **기간 표시**: 시작일과 종료일 사이를 곡선 점선 호로 잇는다. 이 곡선 형태는 유지한다.
  - 호는 상태에 따라 채워진다: 완료와 취소는 끝까지, 진행 중은 절반, 계획 중은 비어 있음.
  - 호의 꼭대기에 비행기 아이콘을 둔다. 아래에 "N일 · 상태" 캡션을 둔다.
  - 채움 애니메이션은 clipPath를 쓴다. `pathLength`와 `vector-effect`를 함께 쓰면 계산이 틀어지므로 쓰지 않는다.
  - 종료일이 없으면 오른쪽에 "진행 중"이나 "미정"처럼 표시한다.
- **이미지**: 여러 장일 수 있고 없을 수도 있다. 없으면 이미지 영역을 통째로 렌더하지 않는다.
- **진행 상황 타일**: 상태 색 점과 라벨만 둔다. 종료일과 취소 사유는 넣지 않는다.
- **참여 인원 타일**: 아바타, 이름, GitHub 링크, 역할. 사진이 있으면 본인 포함 누구나 사진으로 표시하고, 없을 때만 이니셜을 강조색 배경에 보여준다. 상세에 역할 타일은 따로 두지 않는다.
  - AI 도구를 참여 인원으로 표시할 수도 있다 — 다른 참여자와 똑같이 `collaborators`에 이름(예: "Claude Code")과 역할을 넣고, `data/organizations.json`에 링크를 등록해 둔다. 이름 옆에 작은 "AI" 배지가 붙어 사람과 구분된다. 지금은 `startergate-dev-v2` 프로젝트에만 시범 적용했다.
  - `team`(소속 팀/단체)이 있으면 목록 맨 앞에 "소속" 배지와 함께 같이 보여준다. `organizations.json`에 등록돼 있으면 로고·링크를 그대로 쓴다. 사람이 아니므로 참여 인원 수(`{count}`)에는 세지 않는다.
- **본문**
  - 개요
  - 기술 스택
  - 본문 섹션(01, 02 …). 섹션마다 이미지를 넣을 수 있다.
  - 링크
- 하단에 이전/다음 프로젝트 이동을 둔다.
- 키보드: Esc는 닫기, ←/→는 이전/다음.
- 마크다운 본문(`ref`)은 기존 `src/data/markdowns/*.md`를 빌드할 때 렌더한다.

## 7. 위성 하늘

- **표현**: 궤도를 그리지 않는다. flightradar24 AR 모드처럼 하늘을 올려다봤을 때의 위치에 점을 찍는다.
  - x = 방위각(0~360°)을 히어로 너비에 매핑한다.
  - y = 앙각(0°는 지평선, 90°는 위쪽 끝)에 매핑한다.
  - 점 옆에 위성 이름만 작고 연한 색으로 쓴다. 방위·앙각·고도(km)·궤도 종류(저궤도/중궤도/정지궤도)는 평소엔 숨기고 점에 마우스를 올렸을 때만 말풍선으로 보여준다. 고도·궤도 종류는 `scripts/fetch-satellites.mjs`가 TLE 평균 운동에서 미리 계산해 `public/data/satellites.json`에 담아 두므로 클라이언트는 다시 계산하지 않는다.
  - 점은 진행 방향으로 짧은 트레일(꼬리) 선을 함께 그린다. 직전 갱신 위치와의 차이로 방향을 계산한다. 꼬리 길이는 궤도 종류에 따라 다르다 — 저궤도 46px, 중궤도 20px, 정지궤도는 아예 안 그린다(지상 관측자 기준 각속도가 궤도마다 크게 달라서, 길이를 통일하면 오히려 실제 움직임과 어긋나 보인다).
  - 점은 실제 계산한 위치를 따라 천천히 움직인다.
- **기준 위치**: 기본은 서울(37.5665, 126.9780)이다.
  - **내 위치로 보기**를 눌렀을 때만 Geolocation 권한을 요청한다. 페이지에 들어올 때 자동으로 묻지 않는다.
  - 허용하면 캡션을 "현재 위치 상공"으로 바꾼다. 좌표는 저장하지 않고 외부로도 보내지 않는다.
  - 거부하거나 실패하면 서울을 유지한다.
- **선정**: 앙각 10° 이상인 위성 중에서 **최대 15개**를 뽑는다(`lib/satellite/useSatellitePositions.ts`). 우선순위 목록(아래) 안에서는 그 순서, 밖에서는 한국 위성(`isKorean`, CelesTrak SATCAT의 `OWNER === "SKOR"`)을 먼저, 그다음 앙각 높은 순. 정지궤도·중궤도는 지구 자전 대비 각속도가 느려서 비중이 크면 하늘이 정적으로 보이므로 각각 **최대 5개**까지만 포함하고, 나머지 자리는 저궤도 위성으로 채운다.
  - 화면상 겹쳐 보이는 정지궤도 후보는 매 틱이 아니라 수집 시점(`scripts/fetch-satellites.mjs`의 `dedupeGeoBySeoulScreenPosition`)에서 한 번만 걸러 둔다 — 매 틱 다시 걸러내면 앙각이 근소하게 뒤바뀔 때마다 결과가 깜빡인다. 한국 위성이 겹치는 묶음에 있으면 그게 대표로 남는다.
  1. ISS
  2. 톈궁(CSS)
  3. 허블(HST)
  4. NOAA / Metop 기상위성
  5. Landsat / Terra / Aqua
  6. 남는 자리는 CelesTrak `visual`(밝은 위성) 목록·스타링크 표본 40기(궤도면을 고르게 훑음)·GPS·글로나스(중궤도)·정지궤도(`geo`, 경도대가 고르게 섞이도록 표본) 중 앙각이 높은 순으로 채운다. 어느 그룹이든 SATCAT의 공식 `OBJECT_TYPE`을 받아 실제 임무를 수행(했)는 PAYLOAD만 후보로 쓴다(로켓 동체 R/B 제외).
  - **한국 위성**은 우선 목록에 이름을 박아 두지 않는다 — `fetchKoreanPayloads`가 CelesTrak SATCAT의 `active` 그룹 전체에서 `OWNER === "SKOR"`·`OBJECT_TYPE === "PAY"`인 것만 걸러 자동으로 가져온다(기업·대학 큐브샛 포함). 새 위성이 뜨거나 수명이 다해도 다음 실행 때 저절로 반영된다. 다누리(달 궤도)처럼 SGP4로 전파할 수 없는 위성은 자동으로 빠진다.
- **위성 이름 옆에 호버하면 화살표(↗) 링크가 뜬다** — NORAD ID로 `https://www.n2yo.com/satellite/?s={noradId}` 상세 정보 페이지를 새 탭으로 연다. 위성 레이어 전체는 `aria-hidden`인 배경 장식이라, 이 링크만 `aria-hidden="false"`로 다시 노출해 스크린리더·키보드로도 닿게 한다.
- **데이터 파이프라인**
  - GitHub Action이 매일 1회 CelesTrak에서 TLE·SATCAT 데이터를 받아 `public/data/satellites.json`으로 커밋하고, 그 커밋이 배포를 트리거한다(`scripts/fetch-satellites.mjs`).
  - 국적과 무관하게 항상 보여주고 싶은 위성(ISS·허블 등)은 `data/satellite-priority.json`에 NORAD ID와 표시 이름으로 관리한다.
  - 클라이언트는 `satellite.js`로 현재 시각의 위치를 전파 계산하고 관측자 기준 방위각과 앙각을 구한다. 갱신 주기는 3초다.
  - 데이터 로드나 계산이 실패하면 위성 없이 별 하늘만 보여준다. 오류 문구는 표시하지 않는다.
  - CelesTrak 요청은 하루 1회로 제한한다. 사용 정책을 지킨다.
- 캡션의 시계는 KST(`Asia/Seoul`)다. 영어 페이지에서도 KST로 표시한다.

## 8. 콘솔 (이스터에그)

- 좌측 하단의 `>_` 버튼에 마우스를 올리면 "ground station" 라벨이 펼쳐진다. 클릭하면 콘솔 팝업으로 확장된다(clip-path 확장/축소 애니메이션).
- `>_`의 색은 평상시와 호버 때 같다.
- 모양은 JetBrains 쿠키 배너 스타일이다. 프롬프트는 `~ ground$`.
- **사이트의 모든 기능을 콘솔에서 조작할 수 있어야 한다.** 페이지에 없는 기능을 실행하면 "이 페이지에서는 사용할 수 없음"이라고 안내한다.

| 명령 | 동작 |
|---|---|
| `help`, `?` | 명령 목록 |
| `theme [dark\|light]` | 테마 전환. 인자가 없으면 토글 |
| `mode [backend\|game]` | 프로필 모드. **메인에서만 동작** |
| `lang [ko\|en]` | 언어 전환(URL 접두사 변경) |
| `goto <timeline\|conferences>` | 해당 페이지로 이동 |
| `goto main.<섹션>` | 메인 페이지의 섹션으로 이동. 다른 페이지에 있어도 메인으로 이동한 뒤 스크롤한다. 섹션 이름만 단독으로는(`goto tech`) 동작하지 않는다 |
| `goto projects.<프로젝트 id>` | 해당 프로젝트 상세 라우트(`/{lang}/projects/{id}/`)로 바로 이동. 다른 페이지에 있어도 동작한다 |
| `menu` | 상단 메뉴 펼치기/접기 |
| `top` | 맨 위로 |
| `timeline`, `conferences` | 해당 페이지로 이동 |
| `mail` | `mailto:me@startergate.dev` |
| `ls` | 현재 페이지의 프로젝트 id 목록 |
| `open <id\|이름>`, `close` | 프로젝트 팝업 열기/닫기 |
| `filter <cat\|tech\|type\|status> <값>` | 목록 필터 토글. 타임라인에서는 `filter <all\|career\|award\|cert\|group\|edu>` |
| `reset` | 필터 초기화 |
| `whoami`, `clear`, `exit` | 자기소개 한 줄 / 로그 지우기 / 닫기 |

- 콘솔 열기·닫기 단축키는 **없다**. 콘솔이 열려 있을 때 Esc로 닫는 것만 지원한다.
- 콘솔 출력 문구도 i18n 대상이다.

## 9. 분석

- GA4 `G-99G6KZQV5K`를 쓴다. 정적 export 환경에서는 `@next/third-parties/google`의 `GoogleAnalytics` 또는 `next/script`로 넣는다.
- **[제안]** 프로젝트 팝업 열기(`project_open`, id), 언어 변경, 모드 변경, CV 다운로드를 이벤트로 보낸다.

## 10. 확정했지만 구현 때 확인할 것

- 히어로 표어는 `[새 표어]` 자리표시 그대로 둔다.
- Blog는 링크 없이 호버 시 "준비 중" 말풍선만 있다.
- 위성 우선순위 NORAD ID는 구현할 때 확인한다.
- 배포 방식(§2.5)은 아직 정하지 않았다.
