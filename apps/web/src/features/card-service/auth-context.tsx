"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

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
