"use client";

import Link from "next/link";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

export function TypingRoomLoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-[#111]">
      <div
        className={`flex flex-col items-center gap-3 text-center font-mono ${SHARED_FEATURE_CLASS.text13Neutral}`}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#111]" />
        <span>{message}</span>
      </div>
    </div>
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
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]">
      <div className="max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]">
          덱 문장을 준비하지 못했어요
        </h1>
        <p className={`mt-3 ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}>
          {message}
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onRetry}
            className={SHARED_FEATURE_CLASS.primaryActionButtonMd14}
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={onUseDefaultDeck}
            className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-[14px] font-semibold text-[#666] transition-colors hover:border-[#ddd] hover:text-[#111]"
          >
            기본 덱으로 시작
          </button>
        </div>
        <Link
          href="/typing-service/rooms"
          className={`mt-4 inline-flex ${SHARED_FEATURE_CLASS.text13EmphasisMuted} no-underline transition-colors hover:text-[#111]`}
        >
          로비로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export function TypingRoomConnectionErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#111]">
      <div className="max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#111]">
          타자방에 연결할 수 없어요
        </h1>
        <p className={`mt-3 ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}>
          {message}
        </p>
        <Link
          href="/typing-service/rooms"
          className={`mt-6 inline-flex ${SHARED_FEATURE_CLASS.primaryActionButtonMd14} no-underline`}
        >
          로비로 돌아가기
        </Link>
      </div>
    </div>
  );
}
