// Universal UI 능력 포트(Capability Port) SSOT.
//
// 화면(스크린)은 이 포트 "인터페이스"에만 의존하고, 플랫폼별 구현(어댑터)은
// 각 앱(apps/web, apps/mobile)이 주입한다. 포트 시그니처에는 프레임워크 타입
// (next/expo/TanStack)을 노출하지 않는다 — 순수 타입 + Promise 만 둔다.
//
// ⚠ 연결 상태(2026-06-03): YeonNavigationPort/YeonSessionPort/YeonKeyValueStorePort/
// YeonAppRuntimeProvider/useYeonNavigation/useYeonSession/useYeonKeyValueStore는
// 포트 인터페이스 SSOT로 정의되어 있으나 아직 어댑터가 apps/에 주입되지 않았다.
// 화면들은 현재 expo-router/TanStack Query를 직접 사용한다.
// 어댑터 연결이 완료되면 이 주석을 제거한다.
//
// 설계 원장: docs/product/backlog/2026-06-03-universal-ui-screen-ports-ssot.md
import { createContext, createElement, useContext } from "react";
import type { ReactNode } from "react";
import type { YeonRouteName } from "./routes";

/* ───────────────── Navigation ───────────────── */

// 라우트 디스크립터: 화면은 "어디로" 갈지만 알고, 플랫폼 경로 변환은 어댑터가 한다.
// 웹은 `/card-service/decks/${deckId}`, 모바일은 `{ pathname, params }`로 각각 변환한다.
// 라우트 이름은 routes.ts의 YeonRouteName(YEON_ROUTE_TEMPLATES keyof)에서 파생한다 — drift 불가.
// 도메인이 늘면 YEON_ROUTE_TEMPLATES에 추가하고 여기서 union member를 확장한다.
export type YeonRouteTarget =
  | { name: Extract<YeonRouteName, "cardStudyDesk"> }
  | { name: Extract<YeonRouteName, "cardDeckList"> }
  | {
      name: Extract<YeonRouteName, "cardDeckDetail">;
      params: { deckId: string };
    }
  | { name: Extract<YeonRouteName, "cardDeckPlay">; params: { deckId: string } }
  | {
      name: Extract<YeonRouteName, "cardRoomDetail">;
      params: { roomId: string };
    };

// route-state-contract Layer1: reload-safe 상태는 URL이 SoT.
// 읽기/쓰기 한 쌍을 useState 시그니처와 같은 형태로 노출한다.
export type YeonQueryParamState = readonly [
  string | null,
  (value: string | null) => void,
];

export interface YeonNavigationPort {
  navigate(target: YeonRouteTarget): void; // push: 진짜 화면 이동
  replace(target: YeonRouteTarget): void; // 같은 화면 내 상태 전환
  back(): void;
  // 훅 형태 멤버: 호출부(스크린)에서 최상위 렌더 시 무조건 호출해야 한다(React 훅 규칙).
  useQueryParam(key: string): YeonQueryParamState;
}

/* ───────────────── Session ───────────────── */

// 인증 의미 통일: 웹의 isAuthenticated == 모바일의 isSignedIn → 단일 이름 isAuthenticated.
//
// 슬림 포트: 공유 가능한 세션 표면은 인증 여부와 만료 신호뿐이다. 토큰 수명주기(획득/저장/폐기)는
// platform-divergent다(웹 HTTP-only 쿠키 + auth 라우트 ↔ 모바일 SecureStore + 자격증명 로그인).
// 따라서 getToken/signIn/signOut은 이 공유 포트에 두지 않고 각 플랫폼 세션 구현이 담당한다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: session-port / session-persistence)
export interface YeonSessionPort {
  // 훅 형태 멤버: 스크린 최상위에서 호출.
  useIsAuthenticated(): boolean;
  markUnauthenticated(): void; // 401 등 만료 시 캐시 무효화 신호
}

/* ───────────────── KeyValueStore (작은 prefs) ───────────────── */

// 비동기로 통일(모바일 SecureStore 친화). 웹 localStorage는 Promise로 감싼다.
// 큰 게스트 데이터는 Repository 포트 책임이며, 이 포트는 스터디 모드 같은 KV prefs 전용이다.
export interface YeonKeyValueStorePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/* ───────────────── Repository (도메인별, 제네릭 형태) ───────────────── */

// 게스트/서버 분기는 어댑터 구현 안으로 흡수한다(guest-auth-branching 규칙).
// 화면은 이 인터페이스 동사만 호출하고 저장형식/분기를 모른다.
// 구체 도메인(CardDeck 등)은 2차에서 @yeon/api-contract DTO로 이 형태를 바인딩한다.
export interface YeonResourceRepository<
  TEntity,
  TId,
  TCreateInput,
  TUpdateInput,
> {
  list(): Promise<TEntity[]>;
  get(id: TId): Promise<TEntity | null>;
  create(input: TCreateInput): Promise<TEntity>;
  update(id: TId, patch: TUpdateInput): Promise<TEntity>;
  remove(id: TId): Promise<void>;
}

/* ───────────────── 핵심 런타임 컨텍스트 + 주입 ───────────────── */

// 도메인 무관 핵심 포트 3종. 도메인 repository는 createYeonRepositoryContext로 별도 주입한다
// (그래야 @yeon/ui 가 @yeon/api-contract DTO에 의존하지 않는다).
export interface YeonAppRuntime {
  navigation: YeonNavigationPort;
  session: YeonSessionPort;
  keyValueStore: YeonKeyValueStorePort;
}

const YeonAppRuntimeContext = createContext<YeonAppRuntime | null>(null);

export function YeonAppRuntimeProvider(
  props: YeonAppRuntime & { children: ReactNode }
) {
  const { children, ...runtime } = props;
  return createElement(
    YeonAppRuntimeContext.Provider,
    { value: runtime },
    children
  );
}

function useYeonAppRuntime(): YeonAppRuntime {
  const runtime = useContext(YeonAppRuntimeContext);
  if (!runtime) {
    throw new Error(
      "YeonAppRuntimeProvider 밖에서 런타임 포트를 사용했습니다. 라우트 wrapper에서 Provider로 어댑터를 주입하세요."
    );
  }
  return runtime;
}

export function useYeonNavigation(): YeonNavigationPort {
  return useYeonAppRuntime().navigation;
}

export function useYeonSession(): YeonSessionPort {
  return useYeonAppRuntime().session;
}

export function useYeonKeyValueStore(): YeonKeyValueStorePort {
  return useYeonAppRuntime().keyValueStore;
}

/* ───────────────── 도메인 repository 주입 헬퍼 ───────────────── */

// @yeon/ui 가 구체 DTO에 의존하지 않도록, 도메인별 repository 컨텍스트를 제네릭으로 생성한다.
// 2차에서: const { Provider, useRepository } = createYeonRepositoryContext<YeonCardDeckRepository>("CardDeck")
export function createYeonRepositoryContext<TRepository>(displayName: string) {
  const Context = createContext<TRepository | null>(null);
  Context.displayName = `${displayName}RepositoryContext`;

  function Provider(props: { value: TRepository; children: ReactNode }) {
    return createElement(
      Context.Provider,
      { value: props.value },
      props.children
    );
  }

  function useRepository(): TRepository {
    const repository = useContext(Context);
    if (!repository) {
      throw new Error(
        `${displayName} repository Provider 밖에서 repository를 사용했습니다.`
      );
    }
    return repository;
  }

  return { Provider, useRepository } as const;
}
