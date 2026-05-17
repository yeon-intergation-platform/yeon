"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CARD_BULK_IMPORT_MAX_ITEMS } from "@yeon/api-contract/card-decks";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";
import { useAddCards } from "../hooks";
import { parseBulkCardImportInput } from "../utils/bulk-card-import-parser";
import {
  BULK_CARD_HELP_VISIBILITY_EVENT,
  setBulkCardHelpVisible,
  shouldShowBulkCardHelp,
} from "../utils/bulk-card-help-preference";
import { MarkdownContent } from "./markdown-content";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";

const BULK_CARD_TEMPLATE = `[[Q]]
문제
[[A]]
정답
[[CARD]]
[[Q]]
문제
[[A]]
정답`;

interface BulkAddCardsFormProps {
  deckId: string;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function BulkAddCardsForm({
  deckId,
  onSuccess,
  onDirtyChange,
}: BulkAddCardsFormProps) {
  const [rawText, setRawText] = useState("");
  const [isHelpVisible, setHelpVisible] = useState(true);
  const { mutate, isPending, error } = useAddCards(deckId);
  const parseResult = useMemo(
    () => parseBulkCardImportInput(rawText),
    [rawText]
  );
  const canSubmit =
    parseResult.cards.length > 0 &&
    parseResult.errors.length === 0 &&
    !isPending;
  const previewCards = parseResult.cards.slice(0, 5);
  const hiddenPreviewCount = Math.max(
    parseResult.cards.length - previewCards.length,
    0
  );

  useEffect(() => {
    onDirtyChange?.(rawText.trim().length > 0);
  }, [onDirtyChange, rawText]);

  useEffect(() => {
    setHelpVisible(shouldShowBulkCardHelp());
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ isVisible: boolean }>;
      setHelpVisible(customEvent.detail?.isVisible ?? shouldShowBulkCardHelp());
    };
    window.addEventListener(BULK_CARD_HELP_VISIBILITY_EVENT, handler);
    return () =>
      window.removeEventListener(BULK_CARD_HELP_VISIBILITY_EVENT, handler);
  }, []);

  function handleDismissHelp() {
    setHelpVisible(false);
    setBulkCardHelpVisible(false);
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    mutate(
      { items: parseResult.cards },
      {
        onSuccess: () => {
          setRawText("");
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {isHelpVisible ? (
        <div className="relative rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 pr-12 text-[13px] leading-6 text-[#555] md:p-5">
          <button
            aria-label="AI 형식 도움말 숨기기"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[15px] font-semibold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
            onClick={handleDismissHelp}
            type="button"
          >
            ×
          </button>
          <p className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis15}>
            AI에게 아래 형식으로 카드 묶음을 만들어달라고 요청하세요.
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-[12px] leading-5 text-[#333] md:p-4">
            {BULK_CARD_TEMPLATE}
          </pre>
          <p className="mt-3">
            마커는 한 줄 전체가 <code>[[Q]]</code>, <code>[[A]]</code>,{" "}
            <code>[[CARD]]</code>일 때만 인식합니다.
          </p>
        </div>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}>
          일괄 카드 입력
        </span>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={14}
          placeholder={BULK_CARD_TEMPLATE}
          className="resize-y rounded-2xl border border-[#e5e5e5] px-4 py-3 font-mono text-[14px] leading-6 text-[#111] outline-none focus:border-[#111]"
        />
      </label>

      <div className="flex flex-col gap-2 text-[13px] md:text-[14px]">
        <p className="text-[#666]">
          인식된 카드:{" "}
          <strong className="text-[#111]">{parseResult.cards.length}</strong>장
          / 최대 {CARD_BULK_IMPORT_MAX_ITEMS}장
        </p>
        {parseResult.errors.length > 0 ? (
          <ul className="flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {parseResult.errors.map((message) => (
              <li key={message}>• {message}</li>
            ))}
          </ul>
        ) : null}
        {parseResult.warnings.length > 0 ? (
          <ul className="flex flex-col gap-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">
            {parseResult.warnings.map((message) => (
              <li key={message}>• {message}</li>
            ))}
          </ul>
        ) : null}
        {error ? <p className="text-red-600">{error.message}</p> : null}
      </div>

      {previewCards.length > 0 ? (
        <div className="rounded-2xl border border-[#e5e5e5] p-4 md:p-5">
          <h4 className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis15}>
            미리보기
          </h4>
          <ul className="mt-3 flex flex-col gap-3">
            {previewCards.map((card, index) => (
              <li
                key={`${card.frontText}-${index}`}
                className="rounded-xl bg-[#fafafa] p-3 text-[14px]"
              >
                <p className="font-semibold text-[#111]">{index + 1}. 질문</p>
                <div className="mt-1 text-[#555]">
                  <MarkdownContent>{card.frontText}</MarkdownContent>
                </div>
                <p className="mt-3 font-semibold text-[#111]">답변</p>
                <div className="mt-1 text-[#555]">
                  <MarkdownContent>{card.backText}</MarkdownContent>
                </div>
              </li>
            ))}
          </ul>
          {hiddenPreviewCount > 0 ? (
            <p className={`mt-3 ${SHARED_FEATURE_CLASS.text13Soft}`}>
              외 {hiddenPreviewCount}장은 추가 시 함께 저장됩니다.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-2xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {isPending ? "추가 중..." : `${parseResult.cards.length || 0}장 추가`}
        </button>
      </div>
    </form>
  );
}
