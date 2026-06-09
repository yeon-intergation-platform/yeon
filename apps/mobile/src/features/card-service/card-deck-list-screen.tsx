import {
  YeonActionButton as ActionButton,
  YeonFloatingActionButton as FloatingActionButton,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
} from "@yeon/ui/native";

import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  CardDeckListHeader,
  CreateDeckSheet,
  DeckListContent,
  GuestSyncBanner,
  ResumeDeckCard,
} from "./card-deck-list-sections";
import { useCardDeckListState } from "./use-card-deck-list-state";

// useCardDeckListState 내부에서 YEON_ROUTE_TEMPLATES, formatCardDeckMeta,
// deriveCardDeckListViewState로 web/mobile 공용 route/meta/list-state SSOT를 파생한다.

export function CardDeckListScreen() {
  const state = useCardDeckListState();
  const { onOpenCreateSheet } = state;

  return (
    <MobileScreen
      contentVariant="card"
      safeAreaEdges={["top"]}
      floatingSlot={
        <FloatingActionButton
          accessibilityLabel={CARD_SERVICE_TEXT.list.deckSectionTitle}
          label="+"
          onPress={onOpenCreateSheet}
        />
      }
    >
      <FormStack gap="roomy">
        <CardDeckListHeader />
        <ResumeDeckCard {...state} />
        <ActionButton
          label="+ 새 덱 만들기"
          onPress={onOpenCreateSheet}
          variant="dark"
        />
        <GuestSyncBanner {...state} />
        <DeckListContent {...state} />
      </FormStack>

      <CreateDeckSheet {...state} />
    </MobileScreen>
  );
}
