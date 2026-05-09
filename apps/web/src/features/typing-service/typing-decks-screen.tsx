"use client";

import { useMemo, useState, type FormEvent } from "react";

import {
  TYPING_DECK_LANGUAGE_OPTIONS,
  TYPING_DECK_VISIBILITY_OPTIONS,
  type CreateTypingDeckBody,
  type CreateTypingDeckPassageBody,
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckPassageDto,
  type TypingDeckScope,
  type TypingDeckVisibility,
  type TypingPassageDifficulty,
  type TypingPassageTextType,
  useBulkCreateTypingDeckPassages,
  useCreateTypingDeck,
  useCreateTypingDeckPassage,
  useDeleteTypingDeck,
  useDeleteTypingDeckPassage,
  useTypingDeckDetail,
  useTypingDecks,
  useUpdateTypingDeck,
  useUpdateTypingDeckPassage,
} from "./use-typing-decks";
import {
  parseBulkTypingPassageImportInput,
  TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS,
} from "./utils/bulk-typing-passage-import-parser";
import { analyticsEvents, trackEvent } from "@/lib/analytics";

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

/**
 * Exported seams for the deck-management routes.
 *
 * Keep these components admin-capable via `adminMode` so `/admin/typing-decks`
 * continues to use the same mutations, readonly checks, and visual tone while
 * follow-up library/detail routes can reuse the deck list and detail panels.
 */

export type TypingDeckScopeTab = {
  value: TypingDeckScope;
  label: string;
  help: string;
};

export const TYPING_DECK_SCOPE_TABS: TypingDeckScopeTab[] = [
  {
    value: "default",
    label: "기본 덱",
    help: "YEON이 제공하는 읽기 전용 문단",
  },
  { value: "mine", label: "내 덱", help: "직접 만든 비공개/공개 덱" },
  { value: "public", label: "공개 덱", help: "다른 사용자가 공개한 덱" },
];

function getOptionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function typingDeckLanguageLabel(languageTag: TypingDeckLanguageTag) {
  return getOptionLabel(TYPING_DECK_LANGUAGE_OPTIONS, languageTag);
}

export function typingDeckVisibilityLabel(visibility: TypingDeckVisibility) {
  return getOptionLabel(TYPING_DECK_VISIBILITY_OPTIONS, visibility);
}

export function typingDeckBadge(deck: TypingDeckDto) {
  if (deck.source === "default") {
    return "기본";
  }
  return typingDeckVisibilityLabel(deck.visibility);
}

export type TypingDeckFormProps = {
  mode: "create" | "edit";
  deck?: TypingDeckDto;
  onSaved?: (deck: TypingDeckDto) => void;
  adminMode?: boolean;
};

export function TypingDeckForm({
  mode,
  deck,
  onSaved,
  adminMode = false,
}: TypingDeckFormProps) {
  const createDeck = useCreateTypingDeck(adminMode);
  const updateDeck = useUpdateTypingDeck(deck?.id ?? "", adminMode);
  const [title, setTitle] = useState(deck?.title ?? "");
  const [description, setDescription] = useState(deck?.description ?? "");
  const [languageTag, setLanguageTag] = useState<TypingDeckLanguageTag>(
    deck?.languageTag ?? "ko"
  );
  const [visibility, setVisibility] = useState<TypingDeckVisibility>(
    deck?.visibility ?? "private"
  );
  const isDefaultDeck = deck?.source === "default";
  const mutation = mode === "create" ? createDeck : updateDeck;
  const canSubmit =
    title.trim().length > 0 && !mutation.isPending && !isDefaultDeck;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const body: CreateTypingDeckBody = {
      title: title.trim(),
      description: description.trim() || null,
      languageTag,
      visibility,
    };
    mutation.mutate(body, {
      onSuccess: (savedDeck) => {
        if (mode === "create") {
          trackEvent(analyticsEvents.typingDeckCreated, {
            deck_id: savedDeck.id,
            language_tag: savedDeck.languageTag,
            visibility: savedDeck.visibility,
            admin_mode: adminMode,
          });
          setTitle("");
          setDescription("");
          setLanguageTag("ko");
          setVisibility("private");
        }
        onSaved?.(savedDeck);
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e5e5e5] bg-white p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#111]">
            {mode === "create" ? "새 타자 덱" : "덱 정보"}
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#666]">
            제목, 언어 태그, 공개 범위를 정한 뒤 문단을 추가하세요.
          </p>
        </div>
        {isDefaultDeck ? (
          <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-[12px] font-semibold text-[#666]">
            읽기 전용
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#555]">덱 제목</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isDefaultDeck}
            maxLength={120}
            className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none focus:border-[#111] disabled:bg-[#f8f8f8]"
            placeholder="예: 아침 워밍업 문장"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#555]">설명</span>
          <textarea
            value={description ?? ""}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isDefaultDeck}
            rows={3}
            maxLength={2000}
            className="resize-y rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] leading-6 outline-none focus:border-[#111] disabled:bg-[#f8f8f8]"
            placeholder="어떤 연습에 쓰는 덱인지 적어주세요."
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-[#555]">
              언어 태그
            </span>
            <select
              value={languageTag}
              onChange={(event) =>
                setLanguageTag(event.target.value as TypingDeckLanguageTag)
              }
              disabled={isDefaultDeck}
              className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none focus:border-[#111] disabled:bg-[#f8f8f8]"
            >
              {TYPING_DECK_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-[#555]">
              공개 범위
            </span>
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as TypingDeckVisibility)
              }
              disabled={isDefaultDeck}
              className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none focus:border-[#111] disabled:bg-[#f8f8f8]"
            >
              {TYPING_DECK_VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {mutation.error ? (
        <p className="mt-3 text-[13px] text-red-600">
          {mutation.error.message}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {mutation.isPending
            ? "저장 중..."
            : mode === "create"
              ? "덱 만들기"
              : "덱 저장"}
        </button>
      </div>
    </form>
  );
}

export type TypingDeckListProps = {
  decks: TypingDeckDto[];
  selectedDeckId: string | null;
  onSelectDeck: (deckId: string) => void;
};

export function TypingDeckList({
  decks,
  selectedDeckId,
  onSelectDeck,
}: TypingDeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dcdcdc] p-8 text-center">
        <p className="text-[14px] font-semibold text-[#111]">
          표시할 덱이 없습니다.
        </p>
        <p className="mt-2 text-[13px] text-[#777]">
          내 덱 탭에서 새 덱을 만들거나 공개 덱을 둘러보세요.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {decks.map((deck) => (
        <li key={deck.id}>
          <button
            type="button"
            onClick={() => onSelectDeck(deck.id)}
            className={`w-full rounded-2xl border p-4 text-left transition-colors ${
              selectedDeckId === deck.id
                ? "border-[#111] bg-[#fafafa]"
                : "border-[#e5e5e5] bg-white hover:border-[#111]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-[#111]">
                  {deck.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#666]">
                  {deck.description || "설명이 없습니다."}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#f3f3f3] px-2.5 py-1 text-[12px] font-semibold text-[#666]">
                {typingDeckBadge(deck)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#777]">
              <span className="rounded-full border border-[#e8e8e8] px-2 py-0.5">
                {typingDeckLanguageLabel(deck.languageTag)}
              </span>
              <span className="rounded-full border border-[#e8e8e8] px-2 py-0.5">
                문단 {deck.passageCount ?? 0}개
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export type TypingDeckPassageEditorProps = {
  deckId: string;
  editingPassage: TypingDeckPassageDto | null;
  onCancelEdit: () => void;
  adminMode?: boolean;
};

export function TypingDeckPassageEditor({
  deckId,
  editingPassage,
  onCancelEdit,
  adminMode = false,
}: TypingDeckPassageEditorProps) {
  const addPassage = useCreateTypingDeckPassage(deckId, adminMode);
  const updatePassage = useUpdateTypingDeckPassage(deckId, adminMode);
  const [title, setTitle] = useState(editingPassage?.title ?? "");
  const [prompt, setPrompt] = useState(editingPassage?.prompt ?? "");
  const [textType, setTextType] = useState<TypingPassageTextType>(
    editingPassage?.textType ?? "short"
  );
  const [difficulty, setDifficulty] = useState<TypingPassageDifficulty>(
    editingPassage?.difficulty ?? "normal"
  );
  const mutation = editingPassage ? updatePassage : addPassage;
  const canSubmit = prompt.trim().length > 0 && !mutation.isPending;

  function resetForm() {
    setTitle("");
    setPrompt("");
    setTextType("short");
    setDifficulty("normal");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const body: CreateTypingDeckPassageBody = {
      title: title.trim() || null,
      prompt: prompt.trim(),
      textType,
      difficulty,
    };
    if (editingPassage) {
      updatePassage.mutate(
        { passageId: editingPassage.id, body },
        { onSuccess: onCancelEdit }
      );
      return;
    }
    addPassage.mutate(body, { onSuccess: resetForm });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e5e5e5] bg-white p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[16px] font-semibold text-[#111]">
          {editingPassage ? "문단 수정" : "문단 직접 추가"}
        </h3>
        {editingPassage ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-[13px] font-semibold text-[#666] hover:text-[#111]"
          >
            취소
          </button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="문단 제목 (선택)"
          className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none focus:border-[#111]"
        />
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          placeholder="타이핑할 문장을 입력하세요."
          className="resize-y rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] leading-6 outline-none focus:border-[#111]"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={textType}
            onChange={(event) =>
              setTextType(event.target.value as TypingPassageTextType)
            }
            className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none focus:border-[#111]"
          >
            <option value="short">짧은 글</option>
            <option value="long">긴 글</option>
            <option value="code">코드</option>
          </select>
          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as TypingPassageDifficulty)
            }
            className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none focus:border-[#111]"
          >
            <option value="easy">쉬움</option>
            <option value="normal">보통</option>
            <option value="hard">어려움</option>
          </select>
        </div>
      </div>
      {mutation.error ? (
        <p className="mt-3 text-[13px] text-red-600">
          {mutation.error.message}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {mutation.isPending
            ? "저장 중..."
            : editingPassage
              ? "수정 저장"
              : "문단 추가"}
        </button>
      </div>
    </form>
  );
}

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
      className="rounded-2xl border border-[#e5e5e5] bg-white p-5"
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
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          rows={12}
          placeholder={BULK_PASSAGE_TEMPLATE}
          className="resize-y rounded-xl border border-[#e5e5e5] px-3 py-2 font-mono text-[13px] leading-5 text-[#111] outline-none focus:border-[#111]"
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
          <h4 className="text-[14px] font-semibold text-[#111]">미리보기</h4>
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
            <p className="mt-3 text-[13px] text-[#888]">
              외 {hiddenPreviewCount}개 문단은 추가 시 함께 저장됩니다.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {bulkCreate.isPending
            ? "추가 중..."
            : `${parseResult.passages.length || 0}개 추가`}
        </button>
      </div>
    </form>
  );
}

export type TypingDeckPassageListProps = {
  deckId: string;
  passages: TypingDeckPassageDto[];
  onEdit: (passage: TypingDeckPassageDto) => void;
  readonly: boolean;
  adminMode?: boolean;
};

export function TypingDeckPassageList({
  deckId,
  passages,
  onEdit,
  readonly,
  adminMode = false,
}: TypingDeckPassageListProps) {
  const deletePassage = useDeleteTypingDeckPassage(deckId, adminMode);

  if (passages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dcdcdc] p-8 text-center">
        <p className="text-[14px] font-semibold text-[#111]">
          아직 문단이 없습니다.
        </p>
        {!readonly ? (
          <p className="mt-2 text-[13px] text-[#777]">
            직접 추가하거나 AI 붙여넣기로 여러 문단을 넣어보세요.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {passages.map((passage, index) => (
        <li
          key={passage.id}
          className="rounded-2xl border border-[#e5e5e5] bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#888]">
                문단 {index + 1}
              </p>
              <h4 className="mt-1 text-[15px] font-semibold text-[#111]">
                {passage.title || "제목 없음"}
              </h4>
            </div>
            {!readonly ? (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(passage)}
                  className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[12px] font-semibold text-[#555] hover:border-[#111] hover:text-[#111]"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => deletePassage.mutate(passage.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            ) : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#555]">
            {passage.prompt}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#777]">
            <span className="rounded-full border border-[#e8e8e8] px-2 py-0.5">
              {passage.textType}
            </span>
            <span className="rounded-full border border-[#e8e8e8] px-2 py-0.5">
              {passage.difficulty}
            </span>
          </div>
          {deletePassage.error ? (
            <p className="mt-2 text-[12px] text-red-600">
              {deletePassage.error.message}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export type TypingDeckDetailPanelProps = {
  deckId: string;
  adminMode?: boolean;
};

export function TypingDeckDetailPanel({
  deckId,
  adminMode = false,
}: TypingDeckDetailPanelProps) {
  const detailQuery = useTypingDeckDetail(deckId, adminMode);
  const deleteDeck = useDeleteTypingDeck(adminMode);
  const [editingPassage, setEditingPassage] =
    useState<TypingDeckPassageDto | null>(null);

  if (detailQuery.isPending) {
    return <p className="text-[14px] text-[#888]">덱을 불러오는 중...</p>;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <p className="text-[14px] text-red-600">덱을 불러오지 못했습니다.</p>
    );
  }

  const { deck, passages } = detailQuery.data;
  const readonly = !deck.canEdit;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] font-semibold text-[#111]">
                {deck.title}
              </h2>
              <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[#666]">
                {typingDeckBadge(deck)}
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-[#666]">
              {deck.description || "설명이 없습니다."}
            </p>
            <p className="mt-2 text-[12px] text-[#888]">
              {typingDeckLanguageLabel(deck.languageTag)} · 문단{" "}
              {passages.length}개
            </p>
          </div>
          {!readonly ? (
            <button
              type="button"
              onClick={() => deleteDeck.mutate(deck.id)}
              className="rounded-xl border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              {deleteDeck.isPending ? "삭제 중..." : "덱 삭제"}
            </button>
          ) : null}
        </div>
        {deleteDeck.error ? (
          <p className="mt-3 text-[13px] text-red-600">
            {deleteDeck.error.message}
          </p>
        ) : null}
      </section>

      <TypingDeckForm mode="edit" deck={deck} adminMode={adminMode} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#111]">문단 목록</h3>
            <span className="rounded-full bg-[#f3f3f3] px-2.5 py-1 text-[12px] font-semibold text-[#666]">
              {passages.length}
            </span>
          </div>
          <TypingDeckPassageList
            deckId={deck.id}
            passages={passages}
            onEdit={setEditingPassage}
            readonly={readonly}
            adminMode={adminMode}
          />
        </div>
        {!readonly ? (
          <aside className="space-y-5 lg:sticky lg:top-5">
            <TypingDeckPassageEditor
              deckId={deck.id}
              editingPassage={editingPassage}
              onCancelEdit={() => setEditingPassage(null)}
              adminMode={adminMode}
            />
            <TypingDeckBulkPassageImportForm
              deckId={deck.id}
              adminMode={adminMode}
            />
          </aside>
        ) : null}
      </section>
    </div>
  );
}

export function TypingDecksScreen({
  adminMode = false,
  showAdminEntry = false,
}: {
  adminMode?: boolean;
  showAdminEntry?: boolean;
}) {
  const scopeTabs = adminMode
    ? [
        ...TYPING_DECK_SCOPE_TABS,
        {
          value: "all" as TypingDeckScope,
          label: "전체",
          help: "관리자 전용: 비공개 포함 모든 DB 덱",
        },
      ]
    : TYPING_DECK_SCOPE_TABS;
  const [scope, setScope] = useState<TypingDeckScope>(
    adminMode ? "all" : "default"
  );
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const decksQuery = useTypingDecks(scope, adminMode);
  const decks = decksQuery.data?.decks ?? [];

  function handleCreated(deck: TypingDeckDto) {
    setScope("mine");
    setSelectedDeckId(deck.id);
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-[#e5e5e5] px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
          <a
            href="/typing-service"
            className="text-[14px] font-semibold text-[#111] no-underline"
          >
            YEON 타자연습
          </a>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {showAdminEntry && !adminMode ? (
              <a
                href="/admin/typing-decks"
                className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
              >
                관리자
              </a>
            ) : null}
            <a
              href="/typing-service/rooms"
              className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa]"
            >
              타자방으로
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 md:px-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#888]">
              Typing decks
            </p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#111]">
              타자 덱 관리
            </h1>
            <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#666]">
              기본 덱을 둘러보고, 내 덱을 만들고, AI가 생성한 문단을 붙여넣어
              타자 연습 문장을 빠르게 저장하세요.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-5 lg:sticky lg:top-5">
            <div className="rounded-2xl border border-[#e5e5e5] bg-white p-4">
              <div
                className={`grid gap-2 ${adminMode ? "grid-cols-4" : "grid-cols-3"}`}
              >
                {scopeTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setScope(tab.value);
                      setSelectedDeckId(null);
                    }}
                    className={`rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                      scope === tab.value
                        ? "bg-[#111] text-white"
                        : "bg-[#f6f6f6] text-[#666] hover:bg-[#ededed] hover:text-[#111]"
                    }`}
                    title={tab.help}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[#777]">
                {scopeTabs.find((tab) => tab.value === scope)?.help}
              </p>
            </div>

            {decksQuery.isPending ? (
              <p className="text-[14px] text-[#888]">목록을 불러오는 중...</p>
            ) : null}
            {decksQuery.isError ? (
              <p className="text-[14px] text-red-600">
                덱 목록을 불러오지 못했습니다.
              </p>
            ) : null}
            {decksQuery.isSuccess ? (
              <TypingDeckList
                decks={decks}
                selectedDeckId={selectedDeckId}
                onSelectDeck={setSelectedDeckId}
              />
            ) : null}

            <TypingDeckForm
              mode="create"
              onSaved={handleCreated}
              adminMode={adminMode}
            />
          </aside>

          <section className="min-w-0">
            {selectedDeckId ? (
              <TypingDeckDetailPanel
                deckId={selectedDeckId}
                adminMode={adminMode}
              />
            ) : (
              <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-dashed border-[#dcdcdc] bg-[#fafafa] p-10 text-center">
                <div>
                  <p className="text-[18px] font-semibold text-[#111]">
                    덱을 선택하세요.
                  </p>
                  <p className="mt-2 max-w-[420px] text-[14px] leading-6 text-[#666]">
                    왼쪽 목록에서 기본/내/공개 덱을 선택하면 문단 목록, 직접
                    추가, AI 붙여넣기 패널을 사용할 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
