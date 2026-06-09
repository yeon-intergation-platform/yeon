"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { YeonView } from "@yeon/ui";
import {
  CardServiceSettingsDialog,
  CreateDeckDialog,
  MergeGuestDialog,
} from "./components";
import {
  CardServiceDecksHeader,
  CardServiceDecksHero,
  CardServiceDecksSection,
} from "./card-service-decks-screen-parts";
import { useCardServiceDecksScreenState } from "./use-card-service-decks-screen-state";

// useCardServiceDecksScreenState 내부에서 deriveCardDeckListViewState로
// web/mobile 공용 list-state SSOT를 파생한다. 화면은 hook 결과만 조립한다.

export function CardServiceDecksScreen() {
  const screen = useCardServiceDecksScreenState();

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CardServiceDecksHeader screen={screen} />

      <YeonView
        as="main"
        className="mx-auto max-w-[1400px] px-6 pb-28 pt-7 md:px-12"
      >
        <CardServiceDecksHero />
        <CardServiceDecksSection screen={screen} />
      </YeonView>

      {screen.isCreateOpen ? (
        <CreateDeckDialog onClose={screen.closeCreate} />
      ) : null}

      {screen.isSettingsOpen ? (
        <CardServiceSettingsDialog onClose={screen.closeSettings} />
      ) : null}

      {screen.isMergeDialogOpen &&
      screen.guestDeckCount !== null &&
      screen.guestDeckCount > 0 ? (
        <MergeGuestDialog
          guestDeckCount={screen.guestDeckCount}
          onClose={() => {
            void screen.handleMergeDialogClose();
          }}
        />
      ) : null}
    </YeonView>
  );
}
