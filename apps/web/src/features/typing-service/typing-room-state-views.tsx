"use client";
import { YeonButton, YeonText, YeonView, YeonLink } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

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
  onRetry,
  onUseDefaultDeck,
}: {
  message: string;
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
          덱 문장을 준비하지 못했어요
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
            다시 시도
          </YeonButton>
          <YeonButton
            type="button"
            onClick={onUseDefaultDeck}
            variant="secondary"
            size="lg"
          >
            기본 덱으로 시작
          </YeonButton>
        </YeonView>
        <YeonLink
          href="/typing-service/rooms"
          className={`mt-4 inline-flex ${SHARED_FEATURE_CLASS.text13EmphasisMuted} no-underline transition-colors hover:text-[#111]`}
        >
          로비로 돌아가기
        </YeonLink>
      </YeonView>
    </YeonView>
  );
}

export function TypingRoomConnectionErrorState({
  message,
}: {
  message: string;
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
          타자방에 연결할 수 없어요
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
          로비로 돌아가기
        </YeonLink>
      </YeonView>
    </YeonView>
  );
}
