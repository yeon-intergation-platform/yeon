"use client";

import { useMemo, useState, type FormEvent } from "react";

import {
  YeonButton,
  YeonField,
  getYeonSurfaceClassName,
} from "@/components/yeon-ui";
import { useBulkCreateTypingDeckPassages } from "./use-typing-decks";
import {
  parseBulkTypingPassageImportInput,
  TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS,
} from "./utils/bulk-typing-passage-import-parser";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <form
      onSubmit={handleSubmit}
      className={getYeonSurfaceClassName({ className: "p-5" })}
    >
      <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-[13px] leading-6 text-[#555]">
        <p className="font-semibold text-[#111]">
          AI에게 이렇게 만들어달라고 요청하세요.
        </p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-[12px] leading-5 text-[#333]">
          {BULK_PASSAGE_TEMPLATE}
        </pre>
        <p className="mt-3">
          마커는 한 줄 전체가 <code>[[PASSAGE]]</code>, <code>[[TITLE]]</code>,{" "}
          <code>[[TEXT]]</code>일 때 인식합니다. 마커가 없으면 빈 줄 기준으로
          문단을 나눕니다.
        </p>
      </div>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#555]">
          AI 형식 붙여넣기
        </span>
        <YeonField
          as="textarea"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          rows={12}
          placeholder={BULK_PASSAGE_TEMPLATE}
          className="resize-y font-mono text-[13px] leading-5"
        />
      </label>

      <div className="mt-3 flex flex-col gap-2 text-[13px]">
        <p className="text-[#666]">
          인식된 문단:{" "}
          <strong className="text-[#111]">{parseResult.passages.length}</strong>
          개 / 최대 {TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS}개
        </p>
        {hasParseErrors ? (
          <ul className="flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {parseResult.errors.map((message) => (
              <li key={message}>• {message}</li>
            ))}
          </ul>
        ) : null}
        {hasParseWarnings ? (
          <ul className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-700">
            {parseResult.warnings.map((message) => (
              <li key={message}>• {message}</li>
            ))}
          </ul>
        ) : null}
        {bulkCreate.error ? (
          <p className="text-red-600">{bulkCreate.error.message}</p>
        ) : null}
      </div>

      {hasPreviewPassages ? (
        <div className="mt-4 rounded-xl border border-[#e5e5e5] p-4">
          <h4 className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}>
            미리보기
          </h4>
          <ul className="mt-3 flex flex-col gap-3">
            {previewPassages.map((passage, index) => (
              <li
                key={`${passage.prompt}-${index}`}
                className="rounded-lg bg-[#fafafa] p-3 text-[13px] leading-6"
              >
                <p className="font-semibold text-[#111]">
                  {index + 1}. {passage.title || "제목 없음"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[#555]">
                  {passage.prompt}
                </p>
              </li>
            ))}
          </ul>
          {hiddenPreviewCount > 0 ? (
            <p className={`mt-3 ${SHARED_FEATURE_CLASS.text13Soft}`}>
              외 {hiddenPreviewCount}개 문단은 추가 시 함께 저장됩니다.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
      </div>
    </form>
  );
}
