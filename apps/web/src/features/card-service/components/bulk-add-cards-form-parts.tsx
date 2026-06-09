"use client";
import { CARD_BULK_IMPORT_MAX_ITEMS } from "@yeon/api-contract/card-decks";
import {
  YeonButton,
  YeonField,
  YeonLabel,
  YeonList,
  YeonListItem,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { MarkdownContent } from "./markdown-content";
import type { BulkAddCardsFormState } from "./use-bulk-add-cards-form-state";

export const BULK_CARD_TEMPLATE = `[[Q]]
문제
[[A]]
정답
[[CARD]]
[[Q]]
문제
[[A]]
정답`;

type BulkCardPreviewCards = BulkAddCardsFormState["previewCards"];

interface BulkCardFormatHelpProps {
  onDismiss: () => void;
}

export function BulkCardFormatHelp({ onDismiss }: BulkCardFormatHelpProps) {
  return (
    <YeonSurface variant="panel" className="relative p-4 pr-12 md:p-5">
      <YeonButton
        aria-label="AI 형식 도움말 숨기기"
        className="absolute right-3 top-3 h-7 w-7 rounded-full text-[15px]"
        onClick={onDismiss}
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
  );
}

interface BulkCardInputFieldProps {
  rawText: string;
  onRawTextChange: (value: string) => void;
}

export function BulkCardInputField({
  rawText,
  onRawTextChange,
}: BulkCardInputFieldProps) {
  return (
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
        onChange={(event) => onRawTextChange(event.target.value)}
        rows={14}
        placeholder={BULK_CARD_TEMPLATE}
        className="resize-y rounded-2xl px-4 py-3 font-mono text-[14px] leading-6"
      />
    </YeonLabel>
  );
}

interface BulkCardImportStatusProps {
  cardCount: number;
  errors: readonly string[];
  warnings: readonly string[];
  errorMessage?: string;
}

export function BulkCardImportStatus({
  cardCount,
  errors,
  warnings,
  errorMessage,
}: BulkCardImportStatusProps) {
  return (
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
          {cardCount}
        </YeonText>
        장 / 최대 {CARD_BULK_IMPORT_MAX_ITEMS}장
      </YeonText>
      {errors.length > 0 ? (
        <YeonList className="flex flex-col gap-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-[#111]">
          {errors.map((message) => (
            <YeonListItem key={message}>• {message}</YeonListItem>
          ))}
        </YeonList>
      ) : null}
      {warnings.length > 0 ? (
        <YeonList className="flex flex-col gap-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-[#666]">
          {warnings.map((message) => (
            <YeonListItem key={message}>• {message}</YeonListItem>
          ))}
        </YeonList>
      ) : null}
      {errorMessage ? (
        <YeonText
          as="p"
          variant="caption"
          tone="primary"
          className="font-semibold"
        >
          {errorMessage}
        </YeonText>
      ) : null}
    </YeonView>
  );
}

interface BulkCardPreviewProps {
  cards: BulkCardPreviewCards;
  hiddenCount: number;
}

export function BulkCardPreview({ cards, hiddenCount }: BulkCardPreviewProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
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
        {cards.map((card, index) => (
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
      {hiddenCount > 0 ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-3 ${SHARED_FEATURE_CLASS.text13Soft}`}
        >
          외 {hiddenCount}장은 추가 시 함께 저장됩니다.
        </YeonText>
      ) : null}
    </YeonSurface>
  );
}

export function BulkCardReplaceNotice() {
  return (
    <YeonText as="p" variant="caption" tone="secondary" className="leading-5">
      덮어쓰기는 기존 카드를 모두 삭제하고, 인식된 카드 목록으로 완전히
      교체합니다.
    </YeonText>
  );
}
