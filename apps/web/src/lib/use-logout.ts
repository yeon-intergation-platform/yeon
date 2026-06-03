"use client";
import { createApiClient } from "@yeon/api-client";
import {
  assignYeonLocation,
  showYeonAlert,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { useCallback, useState } from "react";

const apiClient = createApiClient();

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await apiClient.logout();
      assignYeonLocation("/");
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
      showYeonAlert("로그아웃을 처리하지 못했습니다. 다시 시도해 주세요.");
    }
  }, [isLoggingOut]);

  return {
    isLoggingOut,
    logout,
  };
}
