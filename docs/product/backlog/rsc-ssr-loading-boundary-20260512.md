# RSC/SSR 초기 HTML·로딩 경계 개선 백로그

## 배경

Next.js는 제거하지 않고 유지한다. 다만 현재 일부 화면은 App Router를 쓰면서도 초기 HTML에 의미 있는 데이터를 거의 담지 못하고, client fetch 이후 화면이 완성되는 SPA식 구조가 남아 있다.

RSC/SSR 계열의 핵심은 "서버가 처음부터 의미 있는 HTML을 빠르게 보내는 것"이다. 따라서 서버 컴포넌트에서 첫 화면에 필요 없는 데이터까지 모두 기다리지 않고, 공개/SEO 콘텐츠는 서버 HTML에 포함하며, 개인화·실시간·무거운 부가 영역은 `loading.tsx`, `Suspense`, client island로 분리한다.

## 현재 코드 리뷰 요약

- `apps/web/src/app/counseling-service/page.tsx`는 page 전체가 `"use client"`라 상담 워크스페이스 초기 HTML 이점이 거의 없다.
- `apps/web/src/app/counseling-service/student-management/layout.tsx`는 layout 전체가 `"use client"`라 하위 학생관리 화면의 RSC 경계를 잃는다.
- `apps/web/src/app/community/posts/[postId]/page.tsx`는 공개 글 상세인데 서버는 `postId`만 넘기고 본문은 client에서 목록 로딩 후 찾는다.
- `apps/web/src/app/typing-service/decks/page.tsx`는 indexable route지만 덱 목록은 client query 후 렌더링된다.
- `apps/web/src/app/card-service/decks/page.tsx`와 상세 화면은 server page shell만 있고 실제 덱 데이터는 client query/localStorage 분기로 완성된다.
- route-local `loading.tsx`는 현재 `counseling-service/student-management` 한 곳뿐이다.
- `apps/web/src/app/layout.tsx`의 `CommunityPresenceTracker`가 모든 route에서 heartbeat를 시작해 전역 client/network 비용을 만든다.
- `apps/web/src/app/page.tsx`는 공개 랜딩인데 auth/session/dev-login 조회가 초기 HTML 생성 경로에 같이 묶여 있다.

## 원칙

- 처음 보여야 하는 공개·SEO 정보는 서버에서 HTML로 렌더링한다.
- 로그인 후 개인화, 실시간 방 상태, 채팅, AI 응답, 오디오, 모달, editor는 client island로 제한한다.
- 서버 컴포넌트에서 첫 화면에 필요 없는 `await`를 하지 않는다.
- 캐시 가능한 공개 데이터와 매 요청마다 달라지는 개인화 데이터를 분리한다.
- `fallback={null}`은 기본 금지한다. 사용자가 볼 수 있는 skeleton 또는 안정적인 빈 shell을 둔다.
- React Query는 최초 HTML의 source of truth가 아니라 초기 HTML 이후 갱신·상호작용 보조로 사용한다.

## 1차 — 공개 커뮤니티 글 상세 RSC화

### 작업내용

- `community/posts/[postId]/page.tsx`에서 서버가 글 상세를 먼저 조회한다.
- 글 제목, 작성자, 작성일, 본문은 초기 HTML에 포함한다.
- `generateMetadata`로 글 제목/요약/canonical을 생성한다.
- 댓글 목록은 필요하면 별도 서버 영역 또는 client island로 분리한다.
- 수정/삭제/게스트 비밀번호 확인 모달은 client component로 유지한다.
- 글을 찾지 못하면 `notFound()` 또는 명확한 오류 화면을 반환한다.

### 논의 필요

- 커뮤니티 글 상세 조회 API를 Spring에 먼저 추가할지, 현 Next BFF를 얇게 유지할지.

### 선택지

- A. Spring 상세 조회 API를 먼저 만들고 Next page에서 서버 fetch한다.
- B. 기존 feed API를 재사용하되 서버에서 한 번만 조회한다.
- C. 일단 client 유지 후 metadata만 개선한다.

### 추천

- A. 공개 글 상세는 SEO 가치가 있으므로 Spring 상세 조회 API + 서버 HTML을 source of truth로 둔다.

### 사용자 방향

- 공개/SEO에 유리한 글 상세는 초기 HTML에 본문을 담는다.

## 2차 — 서비스별 `loading.tsx`와 skeleton 확충

### 작업내용

- 다음 segment에 route-local loading을 추가한다.
  - `apps/web/src/app/typing-service/loading.tsx`
  - `apps/web/src/app/card-service/loading.tsx`
  - `apps/web/src/app/community/loading.tsx`
  - `apps/web/src/app/counseling-service/loading.tsx`
  - `apps/web/src/app/profile/loading.tsx`
- spinner 대신 실제 레이아웃을 닮은 skeleton을 제공한다.
- 실시간 방은 방 shell skeleton만 제공하고 room state 자체는 client에서 갱신한다.

### 논의 필요

- skeleton을 공용 컴포넌트로 둘지, 서비스별로 화면 감성에 맞게 둘지.

### 선택지

- A. 서비스별 `loading.tsx`에 직접 작성한다.
- B. `components/product-shell` 아래 공용 skeleton primitive를 만든다.
- C. 둘을 섞어 primitive만 공용화한다.

### 추천

- C. skeleton box/grid primitive는 공용화하고, 서비스별 배치는 각 route에서 작성한다.

### 사용자 방향

- RSC/SSR 초기 로딩 체감 개선이 목적이므로 `loading.tsx`를 적극 도입한다.

## 3차 — 상담 워크스페이스 server shell + client island 분리

### 작업내용

- `counseling-service/page.tsx`의 최상단 `"use client"`를 제거한다.
- 서버 shell에서 최소 초기 데이터 후보를 분리한다.
  - 현재 스페이스 목록
  - 선택된 스페이스
  - 상담 기록 목록 첫 페이지 또는 빈 상태
- 녹음, 업로드, 오디오, AI 채팅, 모달, 실시간 polling은 client island로 유지한다.
- `Suspense fallback={null}`을 실제 workspace skeleton으로 교체한다.
- TanStack Query는 서버 initial data를 받아 이후 refetch/polling을 담당하게 한다.

### 논의 필요

- 상담 기록 목록을 서버에서 직접 조회할 때 Spring API를 우선 사용할지, 기존 Next route bridge를 임시 사용할지.

### 선택지

- A. Spring API 기준으로 서버 initial fetch를 구성한다.
- B. Next BFF를 임시 fetch하고 후속 Spring 전환 때 바꾼다.
- C. 먼저 shell만 server로 만들고 데이터 prefetch는 다음 PR로 미룬다.

### 추천

- C → A 순서. 먼저 page/layout 경계를 작게 되돌리고, 다음 PR에서 Spring initial data를 붙인다.

### 사용자 방향

- 상담은 업무형 앱이라 모든 것을 SSR에 묶지 않는다. 단, 첫 shell과 빈/목록 상태는 빠르게 보여준다.

## 4차 — 학생관리 layout client 전체화 제거

### 작업내용

- `counseling-service/student-management/layout.tsx`를 server layout과 client sidebar shell로 분리한다.
- drawer, context menu, OAuth toast, local draft polling은 client island로 이동한다.
- children 영역은 RSC 하위 페이지가 유지되도록 server layout에서 전달한다.
- sidebar local drafts count는 별도 Suspense 또는 client query 영역으로 분리한다.

### 논의 필요

- 기존 `StudentManagementProvider`가 layout 전체를 감싸야 하는지, sidebar/children 경계를 나눌 수 있는지.

### 선택지

- A. provider를 client shell 내부에 유지하고 children도 client subtree로 둔다.
- B. provider 역할을 쪼개 server children을 보존한다.
- C. 먼저 OAuth toast/drawer만 분리하고 provider는 유지한다.

### 추천

- C로 리스크를 줄인 뒤 B로 간다. 한 번에 provider 구조까지 바꾸면 상태 전이 회귀 위험이 크다.

### 사용자 방향

- 학생관리 하위 route가 RSC 이점을 잃지 않도록 layout-level `"use client"`를 줄인다.

## 5차 — 타자 덱 라이브러리 initial data 서버화

### 작업내용

- `/typing-service/decks`에서 기본 덱 또는 공개 덱 일부를 서버에서 먼저 조회한다.
- `TypingDeckLibraryScreen`은 `initialDecks`를 받아 첫 paint에 카드 목록을 렌더링한다.
- scope 변경, 검색, 내 덱/공개 덱 전환은 기존 client query로 유지한다.
- `robots.index = true`인 route의 실제 주요 콘텐츠가 HTML에 포함되도록 한다.

### 논의 필요

- initial scope를 `default`로 고정할지, query param으로 받을지.

### 선택지

- A. 기본 덱만 initial HTML에 포함한다.
- B. 기본 덱 + 공개 덱 일부를 포함한다.
- C. 로그인 상태에 따라 내 덱도 포함한다.

### 추천

- A. 공개·정적 성격이 가장 강하고 캐시하기 쉽다.

### 사용자 방향

- indexable 페이지는 목록 핵심 콘텐츠를 client fetch 뒤로 미루지 않는다.

## 6차 — 카드 덱 목록/상세의 서버 초기 상태 정리

### 작업내용

- 로그인 사용자는 서버에서 카드 덱 목록 또는 상세 initial data를 조회한다.
- 게스트 localStorage 덱은 client fallback으로 유지한다.
- `useDeckList`, `useDeckDetail`은 initial data를 받을 수 있게 확장한다.
- 카드 editor, local guest merge, modal은 client island로 유지한다.

### 논의 필요

- 게스트와 로그인 상태를 같은 화면에서 다루는 현재 UX를 유지하면서 server initial data를 어디까지 넣을지.

### 선택지

- A. 로그인 사용자만 서버 initial data를 넣는다.
- B. 게스트는 기존처럼 완전 client로 둔다.
- C. 로컬 덱도 별도 hydration script로 HTML에 넣는다.

### 추천

- A+B. localStorage는 서버가 알 수 없으므로 무리하지 않는다.

### 사용자 방향

- 카드 서비스는 게스트 지원 때문에 모든 것을 SSR화하지 말고, 로그인 서버 데이터만 초기 HTML에 적극 반영한다.

## 7차 — 홈 랜딩 TTFB 경로 축소

### 작업내용

- `/`의 공개 랜딩 HTML과 auth/session/dev-login 부가 조회를 분리한다.
- dev login options는 개발 환경에서만 lazy client fetch하거나 별도 작은 island로 분리한다.
- 로그인 redirect 처리가 필요한 경우만 session lookup을 수행하도록 조건을 좁힌다.
- `LandingHome`에 필요한 공개 서비스 목록은 동기/정적 데이터로 유지한다.

### 논의 필요

- 홈에서 로그인 상태를 초기 HTML에 반드시 반영해야 하는지, header island에서 늦게 반영해도 되는지.

### 선택지

- A. 로그인 redirect query가 있을 때만 session lookup한다.
- B. 항상 session lookup하되 `listDevLoginOptions`만 분리한다.
- C. header auth 상태까지 client island로 늦춘다.

### 추천

- A+B. 로그인 modal/redirect 정확성은 유지하되 dev-only 부가 조회는 초기 HTML에서 빼낸다.

### 사용자 방향

- 공개 랜딩은 첫 HTML을 빠르게 주는 것을 우선한다.

## 8차 — 전역 client/network 비용 정리

### 작업내용

- `CommunityPresenceTracker`를 root layout에서 제거하고 community route group 또는 community shell로 이동한다.
- 전역으로 필요한 경우 idle 이후 heartbeat를 시작한다.
- 비커뮤니티 페이지에서 presence heartbeat가 발생하지 않도록 검증한다.

### 논의 필요

- presence가 진짜 사이트 전체 온라인 상태인지, 커뮤니티 채팅용 상태인지.

### 선택지

- A. community route에서만 켠다.
- B. 로그인 사용자에게만 전역으로 켠다.
- C. root 유지하되 idle/debounce를 추가한다.

### 추천

- A. 현재 이름과 API 경로상 커뮤니티 기능으로 보는 것이 자연스럽다.

### 사용자 방향

- RSC 초기 HTML과 무관한 전역 client 비용은 줄인다.

## 완료 조건

- 공개 글 상세와 indexable 덱 페이지의 핵심 콘텐츠가 초기 HTML에 포함된다.
- 상담/학생관리의 page/layout 최상단 client boundary가 줄어든다.
- 주요 서비스 segment에 `loading.tsx` skeleton이 존재한다.
- `fallback={null}` Suspense가 사용자 가시 skeleton 또는 명시적 이유가 있는 구조로 대체된다.
- 실시간 방/채팅/AI/audio/editor는 client island로 남아 SSR에 과하게 묶이지 않는다.
- `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`가 통과한다.
