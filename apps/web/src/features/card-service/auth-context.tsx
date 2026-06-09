"use client";

import { createContext, type ReactNode, useContext } from "react";

import {
  useCardServiceAuthState,
  type CardServiceAuthContextValue,
} from "./use-card-service-auth-state";

const CardServiceAuthContext =
  createContext<CardServiceAuthContextValue | null>(null);

class MissingCardServiceAuthProviderError extends Error {
  constructor() {
    super(
      "useCardServiceAuth는 CardServiceAuthProvider 내부에서만 사용할 수 있습니다. 카드 서비스 인증 상태를 읽는 컴포넌트는 CardServiceAuthProvider 하위에 배치하세요."
    );
    this.name = "MissingCardServiceAuthProviderError";
  }
}

type CardServiceAuthProviderProps = {
  isAuthenticated: boolean;
  children: ReactNode;
};

export function CardServiceAuthProvider({
  isAuthenticated,
  children,
}: CardServiceAuthProviderProps) {
  const value = useCardServiceAuthState(isAuthenticated);

  return (
    <CardServiceAuthContext.Provider value={value}>
      {children}
    </CardServiceAuthContext.Provider>
  );
}

export function useCardServiceAuth(): CardServiceAuthContextValue {
  const value = useContext(CardServiceAuthContext);
  if (value === null) {
    throw new MissingCardServiceAuthProviderError();
  }
  return value;
}

export function useIsAuthenticated(): boolean {
  return useCardServiceAuth().isAuthenticated;
}
