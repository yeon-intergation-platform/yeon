"use client";
import { YeonButton, YeonText, YeonView, YeonLink } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import type { TypingUiText } from "./typing-service-i18n";

type TypingRoomStateLabels = Pick<
  TypingUiText["room"],
  | "selectedDeckLoading"
  | "createLoading"
  | "joinLoading"
  | "alreadyStarted"
  | "seedErrorTitle"
  | "retry"
  | "useDefaultDeck"
  | "backToLobby"
  | "connectionErrorTitle"
>;

export function TypingRoomLoadingState({ message }: { message: string }) {
  return (
    <YeonView className="flex min-h-screen items-center justify-center bg-white text-[#111]">
      <YeonView
        className={`flex flex-col items-center gap-3 text-center font-mono ${SHARED_FEATURE_CLASS.text13Neutral}`}
      >
        <YeonView className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
        <YeonText as="span" variant="unstyled" tone="inherit">
          {message}
        </YeonText>
      </YeonView>
    </YeonView>
  );
}

export function TypingRoomSeedErrorState({
  message,
  labels,
  onRetry,
  onUseDefaultDeck,
}: {
  message: string;
  labels: TypingRoomStateLabels;
  onRetry: () => void;
  onUseDefaultDeck: () => void;
}) {
  return (
    <YeonView className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]">
      <YeonView className="max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]"
        >
          {labels.seedErrorTitle}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-3 ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}
        >
          {message}
        </YeonText>
        <YeonView className="mt-6 grid gap-2 sm:grid-cols-2">
          <YeonButton
            type="button"
            onClick={onRetry}
            variant="primary"
            size="lg"
          >
            {labels.retry}
          </YeonButton>
          <YeonButton
            type="button"
            onClick={onUseDefaultDeck}
            variant="secondary"
            size="lg"
          >
            {labels.useDefaultDeck}
          </YeonButton>
        </YeonView>
        <YeonLink
          href="/typing-service/rooms"
          className={`mt-4 inline-flex ${SHARED_FEATURE_CLASS.text13EmphasisMuted} no-underline transition-colors hover:text-[#111]`}
        >
          {labels.backToLobby}
        </YeonLink>
      </YeonView>
    </YeonView>
  );
}

export function TypingRoomConnectionErrorState({
  message,
  labels,
}: {
  message: string;
  labels: TypingRoomStateLabels;
}) {
  return (
    <YeonView className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]">
      <YeonView className="max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
        <YeonText
          as="h1"
          variant="unstyled"
          tone="inherit"
          className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]"
        >
          {labels.connectionErrorTitle}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-3 ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}
        >
          {message}
        </YeonText>
        <YeonLink
          href="/typing-service/rooms"
          className={`mt-6 inline-flex ${SHARED_FEATURE_CLASS.primaryActionButtonMd14} no-underline`}
        >
          {labels.backToLobby}
        </YeonLink>
      </YeonView>
    </YeonView>
  );
}
