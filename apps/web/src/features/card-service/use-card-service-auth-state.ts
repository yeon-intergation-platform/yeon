"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useYeonDocumentEvent,
  useYeonWindowEvent,
} from "@yeon/ui/hooks/YeonBrowserHooks";

import { fetchCurrentCardServiceAuthState } from "./auth-state";

export type CardServiceAuthContextValue = {
  isAuthenticated: boolean;
  markUnauthenticated: () => void;
};

export function useCardServiceAuthState(
  initialIsAuthenticated: boolean
): CardServiceAuthContextValue {
  const [currentIsAuthenticated, setCurrentIsAuthenticated] = useState(
    initialIsAuthenticated
  );
  const mountedRef = useRef(false);

  const markUnauthenticated = useCallback(() => {
    setCurrentIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setCurrentIsAuthenticated(initialIsAuthenticated);
  }, [initialIsAuthenticated]);

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

  return useMemo(
    () => ({ isAuthenticated: currentIsAuthenticated, markUnauthenticated }),
    [currentIsAuthenticated, markUnauthenticated]
  );
}
