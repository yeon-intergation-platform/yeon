// 경험치/레벨 queryKey SSOT (parity: identical-value).
//
// web/mobile가 반드시 동일한 queryKey를 쓰도록 단일 출처에서 파생한다.
// 앱별 query-keys 파일은 이 SSOT를 재수출(adapter)만 한다 — 복제 금지.
// card-deck 포트의 scope/isAuthenticated 패턴을 그대로 따른다.
//
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: user-experience-query-keys)

export type YeonExperienceAuthScope = "server" | "guest";

function scope(isAuthenticated: boolean): YeonExperienceAuthScope {
  return isAuthenticated ? "server" : "guest";
}

export const userExperienceQueryKeys = {
  // 경험치 네임스페이스 루트(전체 무효화/제거용).
  root: ["user-experience"] as const,
  // 현재 사용자의 레벨/경험치 요약(인증/게스트 분리).
  me: (isAuthenticated: boolean) =>
    ["user-experience", "me", scope(isAuthenticated)] as const,
  // 경험치 적립 이력(인증/게스트 분리).
  history: (isAuthenticated: boolean) =>
    ["user-experience", "history", scope(isAuthenticated)] as const,
  // 관리자: 사용자 목록.
  adminUsers: () => ["user-experience", "admin", "users"] as const,
  // 관리자: 특정 사용자의 카드덱 목록.
  adminUserCardDecks: (userId: string) =>
    ["user-experience", "admin", "users", userId, "card-decks"] as const,
} as const;
