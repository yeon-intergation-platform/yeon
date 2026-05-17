"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchCurrentCardServiceAuthState } from "./auth-state";

type CardServiceAuthContextValue = {
  isAuthenticated: boolean;
  markUnauthenticated: () => void;
};

const CardServiceAuthContext =
  createContext<CardServiceAuthContextValue | null>(null);

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

  useEffect(() => {
    let active = true;

    async function refreshAuthState() {
      try {
        const nextIsAuthenticated = await fetchCurrentCardServiceAuthState();
        if (active && nextIsAuthenticated !== null) {
          setCurrentIsAuthenticated(nextIsAuthenticated);
        }
      } catch {
        // 세션 확인 실패는 현재 서버 렌더 상태를 유지한다.
      }
    }

    void refreshAuthState();

    window.addEventListener("focus", refreshAuthState);
    document.addEventListener("visibilitychange", refreshAuthState);

    return () => {
      active = false;
      window.removeEventListener("focus", refreshAuthState);
      document.removeEventListener("visibilitychange", refreshAuthState);
    };
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated: currentIsAuthenticated, markUnauthenticated }),
    [currentIsAuthenticated, markUnauthenticated],
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
    throw new Error(
      "useCardServiceAuth는 CardServiceAuthProvider 내부에서만 사용할 수 있습니다.",
    );
  }
  return value;
}

export function useIsAuthenticated(): boolean {
  return useCardServiceAuth().isAuthenticated;
}
