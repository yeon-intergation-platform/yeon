// 타자 서비스 queryKey SSOT.
//
// 현재 typing-service는 web 전용(모바일 부재)이라 drift 파트너가 없지만, queryKey 패턴을
// card-deck/life-os와 동일하게 단일 출처로 둔다. 모바일 타자 도입 시 양 앱이 여기서 파생한다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: typing-service-query-keys)
import type { TypingDeckListScope as TypingDeckScope } from "@yeon/api-contract/typing-decks";

export const typingServiceQueryKeys = {
  characterFrames: () => ["typing-character-frames"] as const,
  activeCharacterFrameOverrides: () =>
    ["typing-service", "character-frames", "active-overrides"] as const,
  publicWaitingRooms: () =>
    ["typing-service", "room-lobby", "public-waiting"] as const,
  deckLists: () => ["typing-decks"] as const,
  deckList: (scope: TypingDeckScope, adminMode = false) =>
    [
      ...typingServiceQueryKeys.deckLists(),
      scope,
      adminMode ? "admin" : "user",
    ] as const,
  deckDetailRoot: (deckId: string | null) => ["typing-deck", deckId] as const,
  deckDetail: (deckId: string | null, adminMode = false) =>
    [
      ...typingServiceQueryKeys.deckDetailRoot(deckId),
      adminMode ? "admin" : "user",
    ] as const,
};
