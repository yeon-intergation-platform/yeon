"use client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useYeonDocumentEvent,
  useYeonWindowEvent,
} from "@yeon/ui/hooks/YeonBrowserHooks";
import { fetchCurrentCardServiceAuthState } from "./auth-state";

type CardServiceAuthContextValue = {
  isAuthenticated: boolean;
  markUnauthenticated: () => void;
};

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
  const [currentIsAuthenticated, setCurrentIsAuthenticated] =
    useState(isAuthenticated);
  const markUnauthenticated = useCallback(() => {
    setCurrentIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setCurrentIsAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshAuthState = useCallback(async () => {
    try {
      const nextIsAuthenticated = await fetchCurrentCardServiceAuthState();
      if (mountedRef.current && nextIsAuthenticated !== null) {
        setCurrentIsAuthenticated(nextIsAuthenticated);
      }
    } catch (error) {
      // 세션 확인 실패는 현재 서버 렌더 상태를 유지하되, 원인 추적을 위해 숨기지 않는다.
      console.warn("[CardServiceAuth] 세션 확인 실패", error);
    }
  }, []);

  useEffect(() => {
    void refreshAuthState();
  }, [refreshAuthState]);

  useYeonWindowEvent("focus", refreshAuthState);
  useYeonDocumentEvent("visibilitychange", refreshAuthState);

  const value = useMemo(
    () => ({ isAuthenticated: currentIsAuthenticated, markUnauthenticated }),
    [currentIsAuthenticated, markUnauthenticated]
  );

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
