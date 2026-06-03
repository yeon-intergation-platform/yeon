# 백로그 — Universal UI 스크린 공용화: 능력 포트(Capability Port) SSOT

> 작성: 2026-06-03 · 작성자: claude(Opus 4.8) · 상태: 계획(착수 전)
> 부모 계획: `docs/product/backlog/2026-05-31-universal-ui-migration-pathA.md`
> 근거: `@yeon/ui` 마이그레이션 완료 후 실측 인벤토리(web/mobile nav·data·auth·storage)
> SSOT 규칙(AGENTS.md): 실제 개발 착수 전 백로그 필수. 본 문서가 그 원장이다.

## 배경 — 무엇이 문제인가

현재 `@yeon/ui` 마이그레이션으로 **프리미티브(버튼/뷰/텍스트 등)는 공용 API**가 됐다. 그러나 **화면(스크린) 단위 코드는 web/mobile에 여전히 따로 존재**한다.

실측 예: "카드 덱 목록" 화면

- 웹 `apps/web/src/features/card-service/card-service-decks-screen.tsx` (255줄)
- 모바일 `apps/mobile/src/features/card-service/card-deck-list-screen.tsx` (289줄)
- → 합쳐 544줄, **하는 일은 동일**(덱 목록 조회 → 게스트/로그인 분기 → 덱 생성 → 덱 이동)

두 파일이 따로 존재하는 진짜 이유는 **플랫폼별 능력(capability)을 화면이 직접 import**하기 때문이다.

| 능력              | 웹                                        | 모바일                                     | 현재 상태                                        |
| ----------------- | ----------------------------------------- | ------------------------------------------ | ------------------------------------------------ |
| 네비게이션        | `useYeonRouter`(string path), `YeonLink`  | `useYeonRouter`(`{pathname,params}` Href)  | `@yeon/ui`로 래핑됐으나 **시그니처가 다름**      |
| 데이터/쿼리       | `fetchYeon` + feature hooks               | `@yeon/api-client`                         | Query 훅만 통일, **fetch 진입점·queryKey 두 벌** |
| 인증/세션         | `auth-context`(Context `isAuthenticated`) | 로컬 `useState(isSignedIn)` + 토큰 storage | **공용 포트 없음**                               |
| 저장소(게스트/KV) | IndexedDB + localStorage                  | JSON + SecureStore                         | 프리미티브만 통일, **게스트 store 두 벌**        |

핵심: **이 4종을 화면마다 다시 배선**하므로 같은 화면이 두 번 작성된다. 사용자 요구 = "매번 중복 구현하지 말고 **SSOT를 만들고 공용으로** 가져가자. **포트/어댑터 경계를 깨끗하게 정의**하자."

## 목표 아키텍처 — 능력 포트 + 어댑터 + 주입 + 공용 스크린

```
[ 공용 스크린 ]  packages/ui/src/screens/*       ← 화면 1벌. 포트 인터페이스에만 의존
        │  (useYeonNavigation / useYeonSession / use<Domain>Repository / useYeonKeyValueStore)
        ▼
[ 능력 포트(SSOT) ] packages/ui/src/runtime/ports ← 인터페이스(순수 타입) + Provider + 소비 훅
        ▲                         ▲
        │ 구현(주입)              │ 구현(주입)
[ 웹 어댑터 ] apps/web/.../runtime-adapters   [ 모바일 어댑터 ] apps/mobile/.../runtime-adapters
   - next router / fetchYeon / IDB 게스트       - expo router / api-client / JSON 게스트
   - auth-context / 쿠키 세션                    - SecureStore 토큰 세션
        ▲                                              ▲
[ 웹 라우트 wrapper ] app/**/page.tsx          [ 모바일 라우트 wrapper ] app/**/*.tsx
   - 어댑터를 Provider에 끼우고 공용 스크린 렌더 (각 ~30~50줄)
```

원칙:

1. **스크린은 포트만 안다.** `@/lib/...`, 모바일 storage, next/expo router를 직접 import하지 않는다(의존성 역전).
2. **포트는 한 번만 정의(SSOT).** 순수 TS 인터페이스 + Promise 반환. 프레임워크 타입(TanStack/next/expo)을 포트 시그니처에 노출하지 않는다.
3. **어댑터는 앱에 둔다.** 플랫폼+앱 고유 자산(auth-context, IDB, api-client, SecureStore)을 그대로 감싸 주입한다. `@yeon/ui`는 플랫폼 의존이 없어 SSR/번들 안전 유지.
4. **게스트/서버 분기는 어댑터 안으로 흡수.** `guest-auth-branching` 스킬 준수 — 화면은 분기를 모른다.
5. **무회귀.** 화면 이관은 Playwright 시각회귀 + SSR HTML(`<h1>/<a href>` 존재) 검증 통과 후 구 화면 제거.

## 능력 포트 인터페이스 (SSOT 제안)

> 모두 순수 타입. 프레임워크 타입 비노출. web/mobile 어댑터가 구현한다.

### 1) NavigationPort + 라우트 맵 SSOT

```ts
// 라우트 디스크립터: 화면은 "어디로"만 알고, 플랫폼 경로 변환은 어댑터가 한다.
export type YeonRouteTarget =
  | { name: "cardDeckList" }
  | { name: "cardDeckDetail"; params: { deckId: string } }
  | { name: "cardDeckPlay"; params: { deckId: string } }
  | { name: "cardRoomLobby"; params: { roomId: string } };
/* typing-service / community 라우트도 동일 패턴으로 확장 */

export interface YeonNavigationPort {
  navigate(target: YeonRouteTarget): void; // push
  replace(target: YeonRouteTarget): void; // 같은 화면 상태 전환
  back(): void;
  // route-state-contract Layer1 통합: reload-safe 상태는 URL이 SoT
  useQueryParam(
    key: string
  ): readonly [string | null, (value: string | null) => void];
}
```

- 라우트 이름→플랫폼 경로 매핑은 **라우트 맵 SSOT**(`yeon-route-map`)로 분리: web은 `/card-service/decks/${deckId}`, mobile은 `{ pathname: "/card-service/decks/[deckId]", params }`.

### 2) SessionPort (인증 의미 통일)

```ts
export interface YeonSessionPort {
  useIsAuthenticated(): boolean; // web isAuthenticated == mobile isSignedIn → 이름 통일
  getToken(): Promise<string | null>; // web: 쿠키 기반이면 null 가능, mobile: SecureStore
  signIn(token: string): Promise<void>;
  signOut(): Promise<void>;
  markUnauthenticated(): void; // 401 시 캐시 무효화 신호
}
```

- 웹 어댑터: `auth-context` + `/api/v1/auth/session` + onFocus 폴링을 그대로 감싼다.
- 모바일 어댑터: `readPrimaryAuthSessionToken`/`write`/`clear` + 부팅 읽기를 감싼다.

### 3) Repository Port (도메인별, 게스트/서버 분기 흡수)

```ts
export interface YeonCardDeckRepository {
  listDecks(): Promise<CardDeckDto[]>;
  getDeck(deckId: string): Promise<CardDeckDto | null>;
  createDeck(input: CreateCardDeckInput): Promise<CardDeckDto>;
  updateDeck(deckId: string, patch: UpdateCardDeckInput): Promise<CardDeckDto>;
  deleteDeck(deckId: string): Promise<void>;
  // ...카드 아이템 동사
}
// queryKey도 repository와 함께 SSOT화: 도메인별 queryKey 팩토리 한 벌
export const cardDeckQueryKeys = {
  list: (isAuthenticated: boolean) =>
    ["card-decks", isAuthenticated ? "server" : "guest"] as const,
  detail: (isAuthenticated: boolean, deckId: string) =>
    ["card-decks", isAuthenticated ? "server" : "guest", deckId] as const,
};
```

- 웹 어댑터: `isAuthenticated ? serverFetch : IDB guest`.
- 모바일 어댑터: `isSignedIn ? api-client : JSON guest`.
- 화면은 `const repo = useCardDeckRepository();` 후 `repo.listDecks()`만 호출. 분기/저장형식 모름.

### 4) KeyValueStorePort (작은 prefs)

```ts
export interface YeonKeyValueStorePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
```

- **비동기로 통일**(모바일 SecureStore 친화). web localStorage를 Promise로 감싼다.
- 큰 게스트 데이터는 Repository 책임. 이 포트는 스터디 모드 같은 KV prefs 전용.

### Provider / 소비 훅

```ts
// packages/ui/src/runtime/ports
export function YeonAppRuntimeProvider(props: {
  navigation: YeonNavigationPort;
  session: YeonSessionPort;
  repositories: { cardDeck: YeonCardDeckRepository /* ... */ };
  keyValueStore: YeonKeyValueStorePort;
  children: ReactNode;
}): JSX.Element;

export function useYeonNavigation(): YeonNavigationPort;
export function useYeonSession(): YeonSessionPort;
export function useCardDeckRepository(): YeonCardDeckRepository;
export function useYeonKeyValueStore(): YeonKeyValueStorePort;
```

---

## 차수별 계획

### 1차 — 포트 경계 정의 + 스캐폴드 (코드 무회귀)

- **작업내용**: `packages/ui/src/runtime/ports`에 4종 포트 인터페이스 + `YeonAppRuntimeProvider` + 소비 훅 + 라우트 맵 SSOT 타입을 **순수 타입/컨텍스트로** 추가한다. `@yeon/ui` export 배선. 아직 어떤 화면도 소비하지 않음(행위 변화 0). 타입체크/린트만 통과.
- **논의 필요**:
  - 포트 SSOT 위치: `packages/ui/runtime/ports` vs 신규 `packages/app-runtime`.
  - Repository 포트가 `@yeon/api-contract` DTO를 참조 → `@yeon/ui`가 contract에 의존(현재도 일부 의존). 허용 범위 확정.
  - 라우트 맵을 `@yeon/ui`에 둘지, `packages/domain`/별도 패키지에 둘지.
- **선택지**:
  - 위치 A: `packages/ui/runtime/ports`(어댑터는 앱에). 최소 배선, 신규 패키지 없음.
  - 위치 B: 신규 `packages/app-runtime`(포트+provider 전용). 관심사 분리 깨끗, 배선 비용↑.
- **추천**: **위치 A**. 어댑터는 앱에 두므로 `@yeon/ui`는 플랫폼 의존 0 유지. 포트는 순수 타입이라 ui에 둬도 UI 렌더링과 섞이지 않음. 신규 패키지는 repository 포트가 많아져 ui가 비대해질 때 B로 승격.
- **사용자 방향**: (미정 — 비어 있으면 추천대로 진행)

### 2차 — 카드 덱 목록 화면 PoC 1개 공용화

- **작업내용**: `packages/ui/src/screens/CardDeckList`에 공용 스크린 1개를 포트 소비 형태로 작성. 웹/모바일 어댑터(`runtime-adapters`)를 각 앱에 구현. 두 앱의 덱 목록 라우트를 **공용 스크린 + 어댑터 주입 wrapper**로 교체. 구 화면 2개(255+289줄)는 시각회귀 통과 후 제거.
- **논의 필요**:
  - 웹(ProductHeader+다이얼로그)과 모바일(TopBar+풀스크린+네이티브 알럿)의 **레이아웃 차이**를 공용 스크린의 "플랫폼 슬롯"으로 흡수할지, 화면을 잘게 쪼개 공유 영역만 합칠지.
  - 게스트 병합 다이얼로그(`merge-guest-dialog`)의 공용화 범위(웹 전용 유지 vs 포트화).
- **선택지**:
  - A. 풀 공용 스크린 + 헤더/알럿을 슬롯 주입.
  - B. "리스트 본문"만 공용 컴포넌트로 추출하고 헤더/모달은 앱별 유지(부분 공유).
- **추천**: **B로 시작**(리스크 최소, ROI 빠른 확인) → 안정화 후 A로 확대. 무회귀 게이트(시각회귀 + SSR `<h1>/<a href>` 존재) 통과가 구 화면 제거 조건.
- **사용자 방향**: (미정 — 비어 있으면 추천대로 진행)

### 3차 — 카드 서비스 잔여 화면 확대

- **작업내용**: 덱 상세/플레이/룸 화면을 동일 포트/어댑터 위에서 공용화. queryKey/게스트 store를 도메인 repository로 일원화하며 web/mobile 중복 제거.
- **논의 필요**: 실시간(룸/colyseus) 화면의 포트화 경계(이미 `YeonRealtimeClient` 존재) 재사용 범위.
- **선택지**: 화면별 점진 vs 도메인 일괄.
- **추천**: 화면별 점진(각 화면 시각회귀 게이트).
- **사용자 방향**: (미정 — 비어 있으면 추천대로 진행)

### 4차 — 타자/커뮤니티 확대 + 거버넌스

- **작업내용**: typing-service·community 라우트를 같은 포트 SSOT로 확대. 라우트 맵/queryKey/세션/저장소 중복 0 목표. ESLint 경계 규칙(화면에서 직접 next/expo/storage import 금지) 추가 검토.
- **논의 필요**: 경계 위반을 CI 하드 게이트로 막을지.
- **선택지**: 경고만 vs 하드 차단.
- **추천**: 우선 경고 → 안정화 후 하드 차단.
- **사용자 방향**: (미정 — 비어 있으면 추천대로 진행)

## 무회귀 게이트(공통)

- 화면 단위 Playwright 시각회귀 before/after.
- SSR HTML 검증: 공용 스크린의 웹 렌더에 `<h1>`/`<a href>`/시맨틱 랜드마크 존재(포트화가 DOM 시맨틱을 깨지 않음 보장).
- `pnpm --filter @yeon/{ui,web,mobile} typecheck|lint` 통과.
- 게스트/인증 전환·새로고침·뒤로가기 시나리오(route-state-contract, guest-auth-branching 검증 항목).

## 비범위

- 상담 워크스페이스(counseling-workspace CRM) — 동결. 본 작업 대상 아님.
- react-native-web 단일 트리 렌더 전환 — 채택하지 않음(SSR/SEO 리스크). 본 설계는 웹=시맨틱 DOM 유지하면서 스크린 코드만 공유.
