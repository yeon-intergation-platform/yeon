import { createContext, useContext, type ReactNode } from "react";
import {
  useCardSessionState,
  type CardSessionValue,
} from "./use-card-session-state";

const CardSessionContext = createContext<CardSessionValue | null>(null);

class MissingCardSessionProviderError extends Error {
  constructor() {
    super(
      "useCardSession은 CardSessionProvider 내부에서만 사용해야 합니다. 카드 서비스 세션 상태를 읽으려면 앱 루트에 CardSessionProvider를 먼저 배치하세요."
    );
    this.name = "MissingCardSessionProviderError";
  }
}

export function useCardSession() {
  const value = useContext(CardSessionContext);

  if (!value) {
    throw new MissingCardSessionProviderError();
  }

  return value;
}

export function CardSessionProvider({ children }: { children: ReactNode }) {
  const session = useCardSessionState();

  return (
    <CardSessionContext.Provider value={session}>
      {children}
    </CardSessionContext.Provider>
  );
}
