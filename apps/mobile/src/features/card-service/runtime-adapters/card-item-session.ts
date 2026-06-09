// MobileCardSession: card-deck-repository의 {isSignedIn, sessionToken}과 동일 타입으로 통일(idx=157).
// 기존 호출부 호환을 위해 {mode: CardServiceMode, sessionToken} union을 과도기적으로 허용한다.
// 신규 호출부는 반드시 isSignedIn 형태를 사용하고, 기존 호출부는 순차 마이그레이션 예정.
export type MobileCardSession =
  | { isSignedIn: boolean; sessionToken: string | null }
  | { mode: "server" | "guest"; sessionToken: string | null };

export function resolveMobileCardSessionToken(
  session: MobileCardSession
): string | null {
  const isSignedIn =
    "isSignedIn" in session ? session.isSignedIn : session.mode === "server";
  return isSignedIn && session.sessionToken ? session.sessionToken : null;
}
