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
import { getTypingUiText } from "./typing-service-i18n";
import { useTypingSettings, type TypingLocale } from "./use-typing-settings";

const BULK_PASSAGE_TEMPLATE_BY_LOCALE: Record<TypingLocale, string> = {
  ko: `[[PASSAGE]]
[[TITLE]]
짧은 호흡 연습
[[TEXT]]
오늘은 빠르게 치기보다 정확하게 끝까지 치는 연습을 합니다.
[[PASSAGE]]
[[TITLE]]
Flow warmup
[[TEXT]]
Keep your eyes one word ahead and let your fingers follow the rhythm.`,
  en: `[[PASSAGE]]
[[TITLE]]
Clear warmup
[[TEXT]]
Focus on steady rhythm before speed and finish each sentence cleanly.
[[PASSAGE]]
[[TITLE]]
Flow warmup
[[TEXT]]
Keep your eyes one word ahead and let your fingers follow the rhythm.`,
};

export type TypingDeckBulkPassageImportFormProps = {
  deckId: string;
  adminMode?: boolean;
};

export function TypingDeckBulkPassageImportForm({
  deckId,
  adminMode = false,
}: TypingDeckBulkPassageImportFormProps) {
  const { settings } = useTypingSettings();
  const deckText = getTypingUiText(settings.locale).deck;
  const bulkPassageTemplate = BULK_PASSAGE_TEMPLATE_BY_LOCALE[settings.locale];
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
    ? deckText.adding
    : deckText.addCount(parseResult.passages.length || 0);
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
          {deckText.bulkPromptTitle}
        </YeonText>
        <YeonText
          as="pre"
          variant="unstyled"
          tone="inherit"
          className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-[12px] leading-5 text-[#111]"
        >
          {bulkPassageTemplate}
        </YeonText>
        <YeonText as="p" variant="unstyled" tone="inherit" className="mt-3">
          {deckText.bulkMarkerHelp}
        </YeonText>
      </YeonView>

      <YeonLabel className="mt-4 flex flex-col gap-2">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="text-[13px] font-medium text-[#666]"
        >
          {deckText.bulkPasteLabel}
        </YeonText>
        <YeonField
          as="textarea"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          rows={12}
          placeholder={bulkPassageTemplate}
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
          {deckText.recognizedPassages}{" "}
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className="text-[#111]"
          >
            {parseResult.passages.length}
          </YeonText>
          {deckText.countUnit} / {deckText.maxCount}{" "}
          {TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS}
          {deckText.countUnit}
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
            {deckText.preview}
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
                  {index + 1}. {passage.title || deckText.noTitle}
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
              {deckText.hiddenPreview(hiddenPreviewCount)}
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
