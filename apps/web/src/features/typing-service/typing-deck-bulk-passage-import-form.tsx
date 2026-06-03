"use client";
import { useMemo, useState } from "react";
import {
  YeonButton,
  YeonField,
  getYeonSurfaceClassName,
  YeonLabel,
  YeonForm,
  YeonList,
  YeonListItem,
  YeonText,
  YeonView,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { useBulkCreateTypingDeckPassages } from "./use-typing-decks";
import {
  parseBulkTypingPassageImportInput,
  TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS,
} from "./utils/bulk-typing-passage-import-parser";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

const BULK_PASSAGE_TEMPLATE = `[[PASSAGE]]
[[TITLE]]
짧은 호흡 연습
[[TEXT]]
오늘은 빠르게 치기보다 정확하게 끝까지 치는 연습을 합니다.
[[PASSAGE]]
[[TITLE]]
Flow warmup
[[TEXT]]
Keep your eyes one word ahead and let your fingers follow the rhythm.`;

export type TypingDeckBulkPassageImportFormProps = {
  deckId: string;
  adminMode?: boolean;
};

export function TypingDeckBulkPassageImportForm({
  deckId,
  adminMode = false,
}: TypingDeckBulkPassageImportFormProps) {
  const [rawText, setRawText] = useState("");
  const bulkCreate = useBulkCreateTypingDeckPassages(deckId, adminMode);
  const parseResult = useMemo(
    () => parseBulkTypingPassageImportInput(rawText),
    [rawText]
  );
  const hasParsedPassages = Boolean(parseResult.passages.length);
  const hasParseErrors = Boolean(parseResult.errors.length);
  const hasParseWarnings = Boolean(parseResult.warnings.length);
  const canSubmit =
    hasParsedPassages && !hasParseErrors && !bulkCreate.isPending;
  const submitLabel = bulkCreate.isPending
    ? "추가 중..."
    : `${parseResult.passages.length || 0}개 추가`;
  const previewPassages = parseResult.passages.slice(0, 5);
  const hasPreviewPassages = Boolean(previewPassages.length);
  const hiddenPreviewCount = Math.max(
    parseResult.passages.length - previewPassages.length,
    0
  );

  function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    bulkCreate.mutate(
      {
        passages: parseResult.passages.map((passage) => ({
          title: passage.title ?? null,
          prompt: passage.prompt,
          textType: "short",
          difficulty: "normal",
        })),
      },
      { onSuccess: () => setRawText("") }
    );
  }

  return (
    <YeonForm
      onSubmit={handleSubmit}
      className={getYeonSurfaceClassName({ className: "p-5" })}
    >
      <YeonView className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#666]">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="font-semibold text-[#111]"
        >
          AI에게 이렇게 만들어달라고 요청하세요.
        </YeonText>
        <YeonText
          as="pre"
          variant="unstyled"
          tone="inherit"
          className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-[12px] leading-5 text-[#111]"
        >
          {BULK_PASSAGE_TEMPLATE}
        </YeonText>
        <YeonText as="p" variant="unstyled" tone="inherit" className="mt-3">
          마커는 한 줄 전체가{" "}
          <YeonText as="code" variant="unstyled" tone="inherit">
            [[PASSAGE]]
          </YeonText>
          ,{" "}
          <YeonText as="code" variant="unstyled" tone="inherit">
            [[TITLE]]
          </YeonText>
          ,{" "}
          <YeonText as="code" variant="unstyled" tone="inherit">
            [[TEXT]]
          </YeonText>
          일 때 인식합니다. 마커가 없으면 빈 줄 기준으로 문단을 나눕니다.
        </YeonText>
      </YeonView>

      <YeonLabel className="mt-4 flex flex-col gap-2">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-medium text-[#666]"
        >
          AI 형식 붙여넣기
        </YeonText>
        <YeonField
          as="textarea"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          rows={12}
          placeholder={BULK_PASSAGE_TEMPLATE}
          className="resize-y font-mono text-[13px] leading-5"
        />
      </YeonLabel>

      <YeonView className="mt-3 flex flex-col gap-2 text-[13px]">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[#666]"
        >
          인식된 문단:{" "}
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className="text-[#111]"
          >
            {parseResult.passages.length}
          </YeonText>
          개 / 최대 {TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS}개
        </YeonText>
        {hasParseErrors ? (
          <YeonList className="flex flex-col gap-1 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3 text-[#666]">
            {parseResult.errors.map((message) => (
              <YeonListItem key={message}>• {message}</YeonListItem>
            ))}
          </YeonList>
        ) : null}
        {hasParseWarnings ? (
          <YeonList className="flex flex-col gap-1 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3 text-[#666]">
            {parseResult.warnings.map((message) => (
              <YeonListItem key={message}>• {message}</YeonListItem>
            ))}
          </YeonList>
        ) : null}
        {bulkCreate.error ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="text-[#666]"
          >
            {bulkCreate.error.message}
          </YeonText>
        ) : null}
      </YeonView>

      {hasPreviewPassages ? (
        <YeonView className="mt-4 rounded-xl border border-[#e5e5e5] p-4">
          <YeonText
            as="h4"
            variant="unstyled"
            tone="inherit"
            className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}
          >
            미리보기
          </YeonText>
          <YeonList className="mt-3 flex flex-col gap-3">
            {previewPassages.map((passage, index) => (
              <YeonListItem
                key={`${passage.prompt}-${index}`}
                className="rounded-lg bg-[#fafafa] p-3 text-[13px] leading-6"
              >
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="font-semibold text-[#111]"
                >
                  {index + 1}. {passage.title || "제목 없음"}
                </YeonText>
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 whitespace-pre-wrap text-[#666]"
                >
                  {passage.prompt}
                </YeonText>
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
              외 {hiddenPreviewCount}개 문단은 추가 시 함께 저장됩니다.
            </YeonText>
          ) : null}
        </YeonView>
      ) : null}

      <YeonView className="mt-4 flex justify-end">
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
      </YeonView>
    </YeonForm>
  );
}
