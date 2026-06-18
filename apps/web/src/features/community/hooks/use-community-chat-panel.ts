"use client";
import { useEffect, useState } from "react";
import { getYeonLocalStorage } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  createYeonJsonStorage,
  createYeonStore,
  persistYeonStore,
} from "@yeon/ui/runtime/YeonStateStore";

const STORAGE_KEY = "yeon:community-chat-panel";

type CommunityChatPanelStore = {
  // null = 사용자가 아직 직접 열고/닫지 않음 → 기본 닫힘.
  // true/false = 사용자가 명시적으로 선택한 상태(라우트 이동/재마운트와 무관하게 우선).
  userPreference: boolean | null;
  setOpen: (open: boolean) => void;
};

const useCommunityChatPanelStore = createYeonStore<CommunityChatPanelStore>()(
  persistYeonStore(
    (set) => ({
      userPreference: null,
      setOpen: (open) => set({ userPreference: open }),
    }),
    {
      name: STORAGE_KEY,
      storage: createYeonJsonStorage(() => getYeonLocalStorage()),
      partialize: (state) => ({ userPreference: state.userPreference }),
    }
  )
);

export type CommunityChatPanelState = {
  /** 해소된 열림 여부. 미해결(하이드레이션 미정) 동안은 false(닫힘). */
  isOpen: boolean;
  /** 사용자가 직접 열고/닫을 때 호출. 선택은 localStorage에 보존되어 라우트 이동 후에도 유지된다. */
  setOpen: (open: boolean) => void;
  /** persist 하이드레이션이 끝났는지. */
  resolved: boolean;
};

/**
 * 실시간 채팅 패널 열림 상태의 단일 소스.
 * - 사용자가 직접 조작한 적이 있으면 그 값을 우선한다.
 * - 조작 이력이 없으면 compact 패널은 CTA를 가리지 않도록 기본 닫힘이다.
 */
export function useCommunityChatPanel(): CommunityChatPanelState {
  const userPreference = useCommunityChatPanelStore((s) => s.userPreference);
  const setOpen = useCommunityChatPanelStore((s) => s.setOpen);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated) {
      return;
    }
    if (useCommunityChatPanelStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useCommunityChatPanelStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
  }, [hydrated]);

  const resolved = hydrated;
  const isOpen = resolved ? userPreference === true : false;

  return { isOpen, setOpen, resolved };
}
