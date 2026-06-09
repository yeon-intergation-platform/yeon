import { useYeonQueryClient as useQueryClient } from "@yeon/ui/native";
import { showYeonAlert } from "@yeon/ui/native";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { cardServiceApi } from "../../services/card-service/client";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { clearPrimaryAuthSessionToken } from "../../services/primary-auth/storage";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  CARD_SERVICE_MODE,
  resolveCardServiceSession,
} from "./card-service-session";
import {
  clearCardGuestOptIn,
  readCardGuestOptIn,
  writeCardGuestOptIn,
} from "./onboarding-storage";

// booting: 세션 확인 중 / gate: 첫 진입 게이트 / ready: 홈(탭) 사용 가능.
type CardSessionPhase = "booting" | "gate" | "ready";

type CardSessionValue = {
  phase: CardSessionPhase;
  isSignedIn: boolean;
  sessionToken: string | null;
  // 게이트 로그인 성공(토큰은 호출 측에서 이미 SecureStore에 저장됨).
  authenticate: (sessionToken: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  openGate: () => void;
  logout: () => Promise<void>;
};

const CardSessionContext = createContext<CardSessionValue | null>(null);

export function useCardSession() {
  const value = useContext(CardSessionContext);

  if (!value) {
    throw new Error(
      "useCardSession은 CardSessionProvider 내부에서만 사용합니다."
    );
  }

  return value;
}

export function CardSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<CardSessionPhase>("booting");
  const [isSignedIn, setSignedIn] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    // idx-149: unmount 가드 — 느린 네트워크 중 언마운트 시 setState 방지.
    let mounted = true;

    void boot(() => mounted);

    return () => {
      mounted = false;
    };
  }, []);

  async function boot(isMounted: () => boolean) {
    setPhase("booting");
    const next = await resolveCardServiceSession();

    if (!isMounted()) {
      return;
    }

    setSessionToken(next.sessionToken);
    const signedIn = next.mode === CARD_SERVICE_MODE.server;
    setSignedIn(signedIn);

    if (signedIn) {
      setPhase("ready");
      return;
    }

    // 토큰 없음 + 비회원 선택 기록 있으면 바로 홈, 없으면 게이트.
    const optedIn = await readCardGuestOptIn();

    if (!isMounted()) {
      return;
    }

    setPhase(optedIn ? "ready" : "gate");
  }

  async function authenticate(nextSessionToken: string) {
    setSessionToken(nextSessionToken);
    setSignedIn(true);
    setPhase("ready");
    await queryClient.invalidateQueries({
      queryKey: cardServiceQueryKeys.all,
    });
    // 로그인 성공 피드백.
    showYeonAlert(
      CARD_SERVICE_TEXT.settings.loginSuccessTitle,
      CARD_SERVICE_TEXT.settings.loginSuccessMessage
    );
  }

  async function continueAsGuest() {
    // idx-148: 세션 토큰이 남아 있는 상태에서 게스트 전환을 막아 모순 상태를 방지한다.
    // openGate() 후 재진입 시 이미 인증된 상태라면 게스트 전환 대신 로그아웃 먼저 요구해야 하나,
    // 정상 UX 흐름에서는 토큰이 없을 때만 이 함수가 호출되므로 방어 가드만 추가한다.
    if (isSignedIn) {
      return;
    }

    await writeCardGuestOptIn();
    setPhase("ready");
  }

  function openGate() {
    setPhase("gate");
  }

  async function logout() {
    if (sessionToken) {
      try {
        await cardServiceApi.logout(sessionToken);
      } catch (error) {
        // idx-147: 서버 세션 무효화 실패는 로컬 로그아웃을 막지 않는다.
        // 하지만 조용히 삼키지 않고 콘솔에 기록해 좀비 세션 추적이 가능하게 한다.
        // 운영 환경에서는 telemetry 연동을 권장한다.
        console.warn(
          "[CardSession] 서버 세션 무효화 실패 — 로컬 토큰은 삭제되나 서버 세션이 남아있을 수 있습니다.",
          error
        );
      }
    }

    await clearPrimaryAuthSessionToken();
    // 로그아웃하면 게스트 선택 기록도 비우고 게이트로 되돌린다.
    await clearCardGuestOptIn();
    setSessionToken(null);
    setSignedIn(false);
    setPhase("gate");
    queryClient.removeQueries({ queryKey: cardServiceQueryKeys.all });
  }

  return (
    <CardSessionContext.Provider
      value={{
        phase,
        isSignedIn,
        sessionToken,
        authenticate,
        continueAsGuest,
        openGate,
        logout,
      }}
    >
      {children}
    </CardSessionContext.Provider>
  );
}
