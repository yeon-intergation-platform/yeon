// 라우트 정체성 SSOT (parity: identical-value) — 경로 "템플릿"은 한곳에서만 선언한다.
//
// 라우트 "정체성"(이름 + 경로 템플릿)은 web/mobile가 반드시 동일해야 한다.
// 경로 "포맷 변환"은 platform-divergent: 웹은 `/card-service/decks/abc` 문자열, 모바일은
// expo `{ pathname, params }`. 둘 다 같은 템플릿에서 파생하므로 drift가 불가능하다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: route-identity)

export const YEON_ROUTE_TEMPLATES = {
  cardHome: "/card-service",
  cardDeckList: "/card-service/decks",
  cardDeckDetail: "/card-service/decks/[deckId]",
  cardDeckPlay: "/card-service/decks/[deckId]/play",
  cardDeckRecall: "/card-service/decks/[deckId]/recall",
  recallHome: "/recall-service",
  recallSession: "/recall-service/session",
  cardRoomList: "/card-service/rooms",
  cardRoomDetail: "/card-service/rooms/[roomId]",
} as const;

export type YeonRouteName = keyof typeof YEON_ROUTE_TEMPLATES;
export type YeonRouteParams = Record<string, string>;

// 웹 경로 해석: 템플릿의 `[key]`를 실제 값으로 치환한다.
export function resolveYeonWebPath(
  name: YeonRouteName,
  params?: YeonRouteParams
): string {
  let path: string = YEON_ROUTE_TEMPLATES[name];
  for (const [key, value] of Object.entries(params ?? {})) {
    path = path.replace(`[${key}]`, encodeURIComponent(value));
  }
  return path;
}

// 모바일(expo-router) 경로 해석: 템플릿 pathname + params 객체.
// 모바일 화면이 YeonNavigationPort 어댑터를 통해 이동하도록 연결되면 이 헬퍼를 활성화한다.
// 현재 모바일 화면은 직접 expo-router를 사용하므로 이 함수는 미사용(dead-code).
// 모바일 어댑터 연결 시 각 화면의 navigate 호출부를 이 헬퍼로 교체한다.
export function resolveYeonNativeRoute(
  name: YeonRouteName,
  params?: YeonRouteParams
) {
  return {
    pathname: YEON_ROUTE_TEMPLATES[name],
    params: params ?? {},
  } as const;
}
