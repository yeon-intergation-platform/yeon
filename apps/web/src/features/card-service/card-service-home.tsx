"use client";
import { YeonView } from "@yeon/ui";
import { CardServiceSettingsDialog, CreateDeckDialog } from "./components";
import { CARD_SERVICE_HOME_CLASS } from "./card-service-home.const";
import {
  CardServiceHomeBoardSection,
  CardServiceHomeHeader,
  CardServiceHomeIntroSection,
} from "./card-service-home-parts";
import { useCardServiceHomeState } from "./use-card-service-home-state";

export function CardServiceHome() {
  const home = useCardServiceHomeState();

  return (
    <YeonView className={CARD_SERVICE_HOME_CLASS.root}>
      <CardServiceHomeHeader home={home} />

      <YeonView as="main" className={CARD_SERVICE_HOME_CLASS.main}>
        <CardServiceHomeIntroSection />
        <CardServiceHomeBoardSection home={home} />
      </YeonView>

      {home.isCreateOpen ? (
        <CreateDeckDialog onClose={home.closeCreate} />
      ) : null}

      {home.isSettingsOpen ? (
        <CardServiceSettingsDialog onClose={home.closeSettings} />
      ) : null}
    </YeonView>
  );
}
