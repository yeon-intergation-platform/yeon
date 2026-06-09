"use client";
import { useEffect, useMemo, useState } from "react";
import { CARD_BULK_IMPORT_MAX_ITEMS } from "@yeon/api-contract/card-decks";
import { useYeonWindowEvent } from "@yeon/ui/hooks/YeonBrowserHooks";
import {
  getYeonCustomEventDetail,
  showYeonConfirm,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  YeonButton,
  YeonField,
  YeonSurface,
  YeonText,
  YeonLabel,
  YeonForm,
  YeonList,
  YeonListItem,
  YeonView,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { useAddCards, useReplaceCards } from "../hooks";
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
  const addCardsMutation = useAddCards(deckId);
  const replaceCardsMutation = useReplaceCards(deckId);
  const isPending =
    addCardsMutation.isPending || replaceCardsMutation.isPending;
  const error = addCardsMutation.error ?? replaceCardsMutation.error;
  const parseResult = useMemo(
    () => parseBulkCardImportInput(rawText),
    [rawText]
  );
  const canSubmit =
    parseResult.cards.length > 0 &&
    parseResult.errors.length === 0 &&
    !isPending;
  const replaceButtonLabel = replaceCardsMutation.isPending
    ? "덮어쓰는 중..."
    : "덮어쓰기";
  const addButtonLabel = addCardsMutation.isPending
    ? "추가 중..."
    : `${parseResult.cards.length || 0}장 추가`;
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
  }, []);

  useYeonWindowEvent(BULK_CARD_HELP_VISIBILITY_EVENT, (event) => {
    const detail = getYeonCustomEventDetail<{ isVisible: boolean }>(event);
    setHelpVisible(detail?.isVisible ?? shouldShowBulkCardHelp());
  });

  function handleDismissHelp() {
    setHelpVisible(false);
    setBulkCardHelpVisible(false);
  }

  const handleSubmit = (event: YeonFormEvent<YeonFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    addCardsMutation.mutate(
      { items: parseResult.cards },
      {
        onSuccess: () => {
          setRawText("");
          onSuccess?.();
        },
      }
    );
  };

  const handleReplace = () => {
    if (!canSubmit) {
      return;
    }

    if (
      !showYeonConfirm(
        `기존 카드를 모두 삭제하고 ${parseResult.cards.length}장으로 덮어쓸까요? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    replaceCardsMutation.mutate(
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
    <YeonForm onSubmit={handleSubmit} className="flex flex-col gap-5">
      {isHelpVisible ? (
        <YeonSurface variant="panel" className="relative p-4 pr-12 md:p-5">
          <YeonButton
            aria-label="AI 형식 도움말 숨기기"
            className="absolute right-3 top-3 h-7 w-7 rounded-full text-[15px]"
            onClick={handleDismissHelp}
            type="button"
            variant="icon"
            size="icon"
          >
            ×
          </YeonButton>
          <YeonText
            as="p"
            variant="label"
            className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis15}
          >
            AI에게 아래 형식으로 카드 묶음을 만들어달라고 요청하세요.
          </YeonText>
          <YeonText
            as="pre"
            variant="unstyled"
            tone="inherit"
            className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-[12px] leading-5 text-[#111] md:p-4"
          >
            {BULK_CARD_TEMPLATE}
          </YeonText>
          <YeonText as="p" variant="caption" tone="secondary" className="mt-3">
            마커는 한 줄 전체가{" "}
            <YeonText as="code" variant="unstyled" tone="inherit">
              [[Q]]
            </YeonText>
            ,{" "}
            <YeonText as="code" variant="unstyled" tone="inherit">
              [[A]]
            </YeonText>
            ,{" "}
            <YeonText as="code" variant="unstyled" tone="inherit">
              [[CARD]]
            </YeonText>
            일 때만 인식합니다.
          </YeonText>
        </YeonSurface>
      ) : null}

      <YeonLabel className="flex flex-col gap-2">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          일괄 카드 입력
        </YeonText>
        <YeonField
          as="textarea"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={14}
          placeholder={BULK_CARD_TEMPLATE}
          className="resize-y rounded-2xl px-4 py-3 font-mono text-[14px] leading-6"
        />
      </YeonLabel>

      <YeonView className="flex flex-col gap-2 text-[13px] md:text-[14px]">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[#666]"
        >
          인식된 카드:{" "}
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className="text-[#111]"
          >
            {parseResult.cards.length}
          </YeonText>
          장 / 최대 {CARD_BULK_IMPORT_MAX_ITEMS}장
        </YeonText>
        {parseResult.errors.length > 0 ? (
          <YeonList className="flex flex-col gap-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-[#111]">
            {parseResult.errors.map((message) => (
              <YeonListItem key={message}>• {message}</YeonListItem>
            ))}
          </YeonList>
        ) : null}
        {parseResult.warnings.length > 0 ? (
          <YeonList className="flex flex-col gap-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-[#666]">
            {parseResult.warnings.map((message) => (
              <YeonListItem key={message}>• {message}</YeonListItem>
            ))}
          </YeonList>
        ) : null}
        {error ? (
          <YeonText
            as="p"
            variant="caption"
            tone="primary"
            className="font-semibold"
          >
            {error.message}
          </YeonText>
        ) : null}
      </YeonView>

      {previewCards.length > 0 ? (
        <YeonSurface variant="outlined" className="p-4 md:p-5">
          <YeonText
            as="h4"
            variant="unstyled"
            tone="inherit"
            className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis15}
          >
            미리보기
          </YeonText>
          <YeonList className="mt-3 flex flex-col gap-3">
            {previewCards.map((card, index) => (
              <YeonListItem
                key={`${card.frontText}-${index}`}
                className="rounded-xl bg-[#fafafa] p-3 text-[14px]"
              >
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="font-semibold text-[#111]"
                >
                  {index + 1}. 질문
                </YeonText>
                <YeonView className="mt-1 text-[#666]">
                  <MarkdownContent>{card.frontText}</MarkdownContent>
                </YeonView>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-3 font-semibold text-[#111]"
                >
                  답변
                </YeonText>
                <YeonView className="mt-1 text-[#666]">
                  <MarkdownContent>{card.backText}</MarkdownContent>
                </YeonView>
              </YeonListItem>
            ))}
          </YeonList>
          {hiddenPreviewCount > 0 ? (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-3 ${SHARED_FEATURE_CLASS.text13Soft}`}
            >
              외 {hiddenPreviewCount}장은 추가 시 함께 저장됩니다.
            </YeonText>
          ) : null}
        </YeonSurface>
      ) : null}

      <YeonView className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <YeonButton
          type="button"
          disabled={!canSubmit}
          onClick={handleReplace}
          size="lg"
          className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          {replaceButtonLabel}
        </YeonButton>
        <YeonButton
          type="submit"
          disabled={!canSubmit}
          variant="primary"
          size="lg"
        >
          {addButtonLabel}
        </YeonButton>
      </YeonView>
    </YeonForm>
  );
}
