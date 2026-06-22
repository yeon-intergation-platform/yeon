# GameMonetize Game Feed 연동 — 게임 허브 수익화

## 배경

게임 허브 서비스(`game.yeon.world`, #803)는 현재 **CrazyGames `/embed`** 5종으로 구성돼 있다. CrazyGames embed는 광고 수익이 전부 CrazyGames에 귀속되어 **yeon 수익이 0**이다. 이를 **GameMonetize Publisher**로 전환하면 임베드 게임의 광고 수익을 yeon이 배분(통상 ~90%)받는다. 또한 GameMonetize **Game Feed**(JSON, 37,000+ 게임)를 연동하면 게임을 대량으로 자동 채울 수 있다.

## 현재까지 완료된 전제

- 게임 허브 서비스 구축(#803): `features/game-service`, `app/game-service`, 서비스 등록/헤더/SEO.
- ads.txt 등록(#804): `app/ads.txt/route.ts` — GameMonetize 스니펫 서빙.
- 카탈로그 구조(`GameEntry` + `embedUrl`)는 플랫폼 무관(혼합 지원).

## 사용자/운영 선행 조건 (코드 외)

- GameMonetize 가입 + `game.yeon.world` 도메인 등록 + **Verify Ads.txt** → 사이트 승인(1~2 영업일).
- Game Feed 생성: **Contain Links = No, Format = JSON, How Many = All, Category = All** → **Feed URL 확보**(이게 있어야 연동 시작).

## 핵심 설계 원칙

- Feed JSON 필드(`id/title/description/instructions/url/category/tags/thumb/width/height`)를 `GameEntry`로 매핑.
- 임베드 URL = Feed의 `url`(`https://html5.gamemonetize.com/{id}/`).
- 수천 게임 대응을 위해 **런타임 BFF + 캐싱**을 기본으로(빌드 부담 회피).
- 영어 설정 한글 노출 방지·route-state-contract·zod-contract-conventions 준수.

---

## 1차 — Feed 계약 & 매핑 정의

**작업내용**: GameMonetize Feed JSON을 받을 zod 스키마(`gameMonetizeFeedItemSchema`)와 `GameEntry`로의 매핑 함수 정의. slug 생성 규칙(title slugify + id 충돌 방지), category 매핑(GameMonetize 카테고리 → yeon `GameCategory`).
**논의 필요**: slug를 title 기반(SEO 친화) vs id 기반(안정) 중 무엇으로 할지. category 매핑 누락 시 fallback.
**선택지**: (a) title-slug + 중복 시 `-{id}` suffix (b) id 그대로.
**추천**: (a) — SEO·가독성. 중복/특수문자는 normalize.
**사용자 방향**:

## 2차 — Feed 수집 인프라 (BFF + 캐싱)

**작업내용**: yeon BFF route(`app/api/v1/games/feed/route.ts` 또는 server util)가 GameMonetize Feed URL을 server-side fetch + 캐싱(revalidate). Feed URL/시크릿은 env로. 페이지네이션(`page`) 순회 처리.
**논의 필요**: 캐싱 TTL(예: 6~24h), Feed URL을 env vs 상수. 대량(All) vs 페이지 단위 로드.
**선택지**: (a) Next `fetch` revalidate(ISR) (b) 자체 메모리/KV 캐시.
**추천**: (a) `fetch(..., { next: { revalidate } })` — 단순·서버 캐시.
**사용자 방향**:

## 3차 — 카탈로그 동적화

**작업내용**: 정적 `GAME_CATALOG`를 Feed 기반 동적 소스로 전환. `getListedGames`/`getGameBySlug`/`getGameSlugs`를 Feed 캐시에서 조회하도록 리팩토링(기존 함수 시그니처 유지로 UI 영향 최소화).
**논의 필요**: 완전 동적 vs 하이브리드(수동 큐레이션 핀 + Feed). 큐레이션(추천/숨김) 기능 필요 여부.
**선택지**: (a) 전량 Feed (b) Feed + 수동 override(featured/blocklist).
**추천**: (b) — 부적절 게임 차단·추천 노출 위해 최소 override 레이어.
**사용자 방향**:

## 4차 — 허브 UI (목록 / 카테고리 / 페이지네이션)

**작업내용**: 허브에 카테고리 필터(인기/IO/액션/퍼즐/레이싱/2P 등) + 페이지네이션/무한스크롤 + 검색(선택). 카드 썸네일(Feed `thumb`) 표시.
**논의 필요**: 카테고리 네비 형태(탭 vs 사이드), 정렬(인기/최신), 페이지당 개수. route-state-contract(필터/페이지를 URL 쿼리 SoT로).
**선택지**: (a) URL 쿼리 기반 필터+페이지(reload-safe) (b) 메모리 상태.
**추천**: (a) — route-state-contract 준수, SEO·공유 가능.
**사용자 방향**:

## 5차 — 상세 페이지 동적화

**작업내용**: `[gameSlug]` 상세를 Feed 게임으로. 썸네일/설명/조작법(Feed instructions) 표시, 임베드 iframe = Feed url. `generateStaticParams`는 인기 N개만(나머지 on-demand ISR) 또는 fully dynamic.
**논의 필요**: 수천 게임 정적 생성 부담 → 정적 N개 + 동적 나머지 경계.
**선택지**: (a) 인기 Top-N 정적 + 나머지 dynamic (b) 전량 dynamic.
**추천**: (a) — 빌드 시간·SEO 균형.
**사용자 방향**:

## 6차 — CrazyGames 제거 / GameMonetize 전환

**작업내용**: 카탈로그에서 CrazyGames embed 제거(수익 0). 모든 게임을 GameMonetize Feed로. provider 표기 갱신. (사용자가 "독점 인기작"으로 남길 CrazyGames가 있으면 소수만 수동 유지.)
**논의 필요**: CrazyGames 완전 제거 vs 1~2개 간판 유지.
**선택지**: (a) 전량 GameMonetize (b) 간판 소수 CrazyGames + 나머지 GameMonetize.
**추천**: (a) — 수익 일관. 간판은 GameMonetize 인기작으로 대체 가능.
**사용자 방향**:

## 7차 — SEO (sitemap / canonical 동적)

**작업내용**: `seo.ts`의 게임 sitemap을 정적 slug 목록 → Feed 기반 동적 생성(상위 N개 + 카테고리 페이지). 게임별 canonical/VideoGame JSON-LD 유지.
**논의 필요**: sitemap에 전 게임 vs 상위 N개(과다 URL 방지).
**선택지**: (a) 카테고리 허브 + 인기 게임 (b) 전량.
**추천**: (a) — 색인 품질·크롤 예산.
**사용자 방향**:

## 8차 — 검증 & 배포

**작업내용**: 단위 테스트(Feed 매핑/slug/category), Playwright(허브 페이지네이션·필터, 상세 GameMonetize iframe 실제 로드), typecheck/lint, 라우팅 변경이므로 web build 게이트(CD). design-screenshot-evidence 준수. 운영 배포 후 GameMonetize 대시보드에서 도메인 승인·수익 집계 1회 확인.
**논의 필요**: 없음(표준 검증).
**선택지**: -
**추천**: 단계별 PR(1~3차 인프라, 4~5차 UI, 6~7차 전환/SEO)로 분리 머지.
**사용자 방향**:

---

## 실행 확정 (2026-06-22) — 영상 근본원인 + Feed 형식 확정 + 임베드 셸 재설계 추가

### 배경: 운영 영상에서 드러난 두 결함

게임 상세 플레이 영상 2건 분석 결과, 현재 CrazyGames embed 구성에서 두 가지 근본 결함이 확인됐다.

1. **흰 화면(snake.io 등 실시간 IO/멀티 게임)** — iframe 셸(하단 바·로고)은 뜨지만 게임 캔버스가 흰색. CrazyGames `/embed/`는 **파트너 등록 + 임베드 도메인 화이트리스트**를 전제로 하는데 `game.yeon.world`는 미등록이라 게임별로 차단된다. `referrerPolicy="no-referrer"`(현 `game-detail.tsx`)가 출처 도메인 검증을 막아 악화시킨다.
2. **화면 흔들림(bullet force 등 FPS)** — 게임은 렌더되지만 시점이 미친 듯이 떨린다. FPS/IO는 **Pointer Lock + mouse delta**로 카메라를 도는데, 작은 인라인 박스(`max-w-[980px]` aspect-video) + 페이지 세로 스크롤 가능 상태 + sandbox iframe에서 pointer lock이 잠겼다 풀렸다 반복하며 jitter가 발생한다.

→ ①은 **소스를 우리가 퍼블리셔로 등록한 GameMonetize feed로 전환**하면 해결(이 백로그 본문). ②는 **소스를 바꿔도 그대로 남는 임베드 셸 자체의 문제**라 별도 작업 스트림으로 추가한다(아래 9차).

### 확정된 GameMonetize Feed 사실 (실측, 2026-06-22)

- 정상 엔드포인트: `https://gamemonetize.com/feed.php?format=0&page={n}&type=html5&amount={k}` (`format=0`=JSON).
- **함정**: `category=All` 또는 `company=All` 파라미터를 넣으면 `[]`(빈 배열) 반환. **두 파라미터는 생략**하고, 카테고리 필터는 수집 후 클라이언트/서버에서 적용한다.
- 레코드 필드(전부 string): `id`, `title`, `description`, `instructions`, `url`, `category`, `tags`(쉼표 구분), `thumb`, `width`, `height`.
- 임베드 URL = `url` = `https://html5.gamemonetize.co/{hash}/` (도메인이 `.co`, `.com` 아님).
- `description`/`instructions`에 HTML 엔티티(`&mdash;`, `&rsquo;` 등) 포함 → 디코딩 필요.
- **Cloudflare rate-limit 존재**: 짧은 간격 반복 호출 시 `error code: 1015`(HTTP 429류) 반환. → **서버 캐싱(revalidate)은 선택이 아니라 필수**, 클라이언트 직접 호출 금지.

### 확정 결정 (사용자 방향: "전체 전환")

- 1차 slug: **(a) title-slug + 중복 시 `-{id}` suffix**.
- 2차 캐싱: **(a) `fetch(url, { next: { revalidate } })`** ISR 서버 캐시. Feed URL은 env `GAMEMONETIZE_FEED_URL`(미설정 시 위 표준 URL 기본값). 페이지 순회로 상위 N 수집.
- 3차 카탈로그: **(b) Feed + 수동 override(featured/blocklist)** — 부적절 게임 차단·간판 노출용 최소 큐레이션 레이어.
- 4차 허브: **(a) URL 쿼리 기반 카테고리/페이지(reload-safe)** — route-state-contract 준수.
- 5차 상세: **(a) 인기 Top-N `generateStaticParams` + 나머지 on-demand(`dynamicParams`)**.
- 6차: **(a) CrazyGames 전량 제거 → GameMonetize 전환**. `provider` 표기 갱신.
- 7차 SEO: **(a) 카테고리 허브 + 인기 Top-N sitemap**. `seo.ts`의 게임 slug 동기 상수 결합을 캐시 기반 비동기 경로로 이전.

### 9차 — 임베드 셸 근본 재설계 (흔들림/흰화면 셸 결함, 신규 · 소스 무관 공통)

**작업내용**: `game-detail.tsx` 임베드 셸을 재설계해 모든 게임에 공통 적용한다.

- **"게임 시작" 클릭 게이트**: iframe을 처음엔 썸네일 포스터로 덮고, 사용자가 클릭하면 그때 로드 + (가능 시) 전체화면 진입. user-gesture 보장으로 pointer lock 안정화.
- **전체화면 대상을 iframe으로**: 현재 wrapper div에 `requestFullscreen`을 걸어 iframe 내부 fullscreen/pointer-lock 상태와 어긋난다. iframe(또는 게임 전용 컨테이너)을 풀스크린 타깃으로 바꿔 풀-뷰포트에서 pointer lock이 안정적으로 잡히게 한다.
- **`referrerPolicy="no-referrer"` 제거**: 퍼블리셔 도메인 출처 전달 → 도메인 검증/수익 귀속 정상화.
- **sandbox 토큰 정합화**: GameMonetize html5 게임이 요구하는 최소 권한으로 재구성.
- **흰 화면 fallback UX**: 로딩 표시 + "게임이 안 보이면 새 탭에서 열기" 링크(임베드 차단/실패 시 사용자 탈출구).

**논의 필요**: 모바일 터치에서 전체화면 강제 여부.
**선택지**: (a) 데스크톱은 클릭 시 자동 전체화면 + pointer-lock, 모바일은 인라인 (b) 양쪽 인라인 + 전체화면 버튼만.
**추천**: (a) — FPS류 흔들림의 직접 원인 제거.
**사용자 방향**: (a) 추천대로.

## 후속/메모

- 향후: 게임 인기/플레이 집계, 즐겨찾기, GameDistribution 병행(둘 다 non-exclusive)으로 카탈로그·수익 다변화.
- 수익은 트래픽(플레이 세션)에 비례하므로 SEO·콘텐츠가 선행 과제.
- 1015 rate-limit 때문에 로컬/CI에서 feed 실호출 테스트는 캐시 + 고정 fixture로 대체하고, 실호출은 배포 후 1회 스모크로 확인한다.
