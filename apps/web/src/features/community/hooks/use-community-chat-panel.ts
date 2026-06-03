"use client";
import { useEffect, useState } from "react";
import {
  getYeonLocalStorage,
  matchYeonMedia,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  createYeonJsonStorage,
  createYeonStore,
  persistYeonStore,
} from "@yeon/ui/runtime/YeonStateStore";

// 데스크톱 기준은 Tailwind lg(1024px). 모바일/태블릿은 좁은 화면으로 보고 기본 닫힘.
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const STORAGE_KEY = "yeon:community-chat-panel";

type CommunityChatPanelStore = {
  // null = 사용자가 아직 직접 열고/닫지 않음 → breakpoint 기본값을 따른다.
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

function useIsDesktop(): boolean | null {
  // 서버/초기 렌더에서는 null(미해결)로 두어 모바일에서 채팅이 잠깐 열렸다 닫히는 깜빡임을 막는다.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = matchYeonMedia(DESKTOP_MEDIA_QUERY);
    if (!mediaQuery) {
      return;
    }
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export type CommunityChatPanelState = {
  /** 해소된 열림 여부. 미해결(하이드레이션/브레이크포인트 미정) 동안은 false(닫힘). */
  isOpen: boolean;
  /** 사용자가 직접 열고/닫을 때 호출. 선택은 localStorage에 보존되어 라우트 이동 후에도 유지된다. */
  setOpen: (open: boolean) => void;
  /** persist 하이드레이션 + breakpoint 감지가 모두 끝났는지. */
  resolved: boolean;
};

/**
 * 실시간 채팅 패널 열림 상태의 단일 소스.
 * - 사용자가 직접 조작한 적이 있으면 그 값을 우선(라우트 이동/재마운트와 무관하게 유지).
 * - 조작 이력이 없으면 데스크톱에서만 기본 열림, 모바일/태블릿은 닫힘.
 */
export function useCommunityChatPanel(): CommunityChatPanelState {
  const userPreference = useCommunityChatPanelStore((s) => s.userPreference);
  const setOpen = useCommunityChatPanelStore((s) => s.setOpen);
  const isDesktop = useIsDesktop();

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

  const resolved = hydrated && isDesktop !== null;
  const isOpen = resolved
    ? userPreference !== null
      ? userPreference
      : isDesktop === true
    : false;

  return { isOpen, setOpen, resolved };
}
