"use client";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  YeonButton,
  YeonLink,
  YeonProductHeaderActionButton,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { DeckList, EmptyDecksScreen } from "./components";
import type { CardServiceDecksScreenState } from "./use-card-service-decks-screen-state";

type CardServiceDecksScreenPartsProps = {
  screen: CardServiceDecksScreenState;
};

export function CardServiceDecksHeader({
  screen,
}: CardServiceDecksScreenPartsProps) {
  return (
    <CommonProductHeader
      activeService="card"
      rightExtras={
        <>
          {screen.showManualMergeButton ? (
            <YeonButton
              type="button"
              onClick={screen.openManualMergeDialog}
              variant="secondary"
              size="sm"
              className="rounded-xl px-3 py-2 text-[12px]"
            >
              게스트 덱 {screen.guestDeckCount}개 계정에 추가
            </YeonButton>
          ) : null}
        </>
      }
      settingsControl={
        <YeonProductHeaderActionButton
          onClick={screen.openSettings}
          aria-label="카드 설정"
        />
      }
    />
  );
}

export function CardServiceDecksHero() {
  return (
    <YeonView as="section" className="max-w-[820px]">
      <YeonLink
        href={resolveYeonWebPath("cardHome")}
        className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 py-1 text-[13px] font-semibold text-[#666] no-underline transition-colors hover:text-[#111]"
      >
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          aria-hidden="true"
        >
          ←
        </YeonText>
        카드 홈으로
      </YeonLink>
      <YeonText
        as="h1"
        variant="unstyled"
        tone="inherit"
        className="mt-3 break-keep text-[28px] font-black tracking-[-0.04em] text-[#111] md:text-[34px]"
      >
        덱을 만들고 바로 복습하세요
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`mt-4 max-w-[720px] break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-[1.8] md:text-[15px]`}
      >
        필요한 덱을 선택하거나 새로 만들어 바로 시작해보세요.
      </YeonText>
    </YeonView>
  );
}

export function CardServiceDecksSection({
  screen,
}: CardServiceDecksScreenPartsProps) {
  return (
    <YeonView as="section" className="mt-9 border-t border-[#e5e5e5] pt-8">
      <YeonView className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <CardServiceDecksSectionIntro screen={screen} />
        {screen.state.kind === "empty" ? null : (
          <YeonButton
            type="button"
            onClick={() => screen.openCreate("deck_section")}
            variant="primary"
            size="md"
            className="h-11 shrink-0 rounded-xl px-5 text-[13px]"
          >
            새 덱 만들기
          </YeonButton>
        )}
      </YeonView>
      <CardServiceDecksListState screen={screen} />
    </YeonView>
  );
}

function CardServiceDecksSectionIntro({
  screen,
}: CardServiceDecksScreenPartsProps) {
  return (
    <YeonView>
      <YeonText
        as="h2"
        variant="unstyled"
        tone="inherit"
        className="break-keep text-[18px] font-bold text-[#111]"
      >
        {screen.isAuthenticated ? "내 덱" : "로그인 없이 만드는 덱"}
      </YeonText>
      <YeonText
        as="p"
        variant="unstyled"
        tone="inherit"
        className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-2 break-keep leading-[1.7]`}
      >
        덱을 열어 카드를 추가하고 바로 복습을 시작할 수 있습니다.
        {!screen.isAuthenticated
          ? " 지금 만든 덱은 이 기기에만 저장되며, 로그인하면 계정으로 옮겨 계속 학습할 수 있어요."
          : " 만든 덱과 카드를 열어 바로 복습 흐름으로 이어갈 수 있어요."}
      </YeonText>
    </YeonView>
  );
}

function CardServiceDecksListState({
  screen,
}: CardServiceDecksScreenPartsProps) {
  const { state } = screen;

  return (
    <YeonView className="mt-6">
      {state.kind === "loading" ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text14Soft}
        >
          불러오는 중...
        </YeonText>
      ) : null}
      {state.kind === "error" ? (
        <YeonText
          as="p"
          variant="caption"
          tone="primary"
          className="text-[14px] font-semibold"
        >
          {state.message}
        </YeonText>
      ) : null}
      {screen.guestDeckCountError ? (
        <YeonText
          as="p"
          variant="caption"
          tone="primary"
          className="mb-3 text-[13px] font-semibold"
        >
          {screen.guestDeckCountError}
        </YeonText>
      ) : null}
      {state.kind === "empty" ? (
        <EmptyDecksScreen onCreate={() => screen.openCreate("empty_state")} />
      ) : null}
      {state.kind === "ready" ? <DeckList decks={state.decks} /> : null}
    </YeonView>
  );
}
