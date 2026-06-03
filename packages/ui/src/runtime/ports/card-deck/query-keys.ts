// 카드 덱 queryKey SSOT (parity: identical-value).
//
// web/mobile가 반드시 동일한 queryKey를 쓰도록 단일 출처에서 파생한다.
// 앱별 query-keys 파일은 이 SSOT를 재수출(adapter)만 한다 — 복제 금지.
//
// 이전 drift: web ["card-decks", mode] ↔ mobile ["card-service","decks", mode].
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: card-deck-query-keys)

export type YeonCardAuthScope = "server" | "guest";

function scope(isAuthenticated: boolean): YeonCardAuthScope {
  return isAuthenticated ? "server" : "guest";
}

export const cardDeckQueryKeys = {
  // 카드 덱 네임스페이스 루트(전체 무효화/제거용).
  root: ["card-service", "decks"] as const,
  // 덱 목록(인증/게스트 분리).
  list: (isAuthenticated: boolean) =>
    ["card-service", "decks", scope(isAuthenticated)] as const,
  // 단일 덱 상세.
  detail: (isAuthenticated: boolean, deckId: string) =>
    ["card-service", "decks", scope(isAuthenticated), deckId] as const,
} as const;
