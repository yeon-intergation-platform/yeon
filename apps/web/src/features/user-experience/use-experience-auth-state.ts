"use client";
import { useEffect, useState } from "react";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";

type AuthSessionPayload = {
  authenticated?: unknown;
};

async function fetchIsAuthenticated(): Promise<boolean> {
  const response = await fetchYeon("/api/v1/auth/session", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as AuthSessionPayload;
  return payload.authenticated === true;
}

// 헤더/프로필은 card-service 인증 컨텍스트 밖이라 세션 엔드포인트로 인증 여부를 확인한다.
// 확인 전(null)에는 데이터 패칭을 막아 비로그인 깜빡임을 방지한다.
export function useExperienceAuthState(): boolean | null {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchIsAuthenticated()
      .then((next) => {
        if (!cancelled) {
          setIsAuthenticated(next);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return isAuthenticated;
}
