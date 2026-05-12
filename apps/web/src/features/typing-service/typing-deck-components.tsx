"use client";

import { useMemo, useState, type FormEvent } from "react";

import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  YeonBadge,
  YeonButton,
  YeonField,
  YeonSurface,
  getYeonSurfaceClassName,
  joinClassNames,
} from "@/components/yeon-ui";
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
  useUpdateTypingDeck,
  useUpdateTypingDeckPassage,
} from "./use-typing-decks";
import {
  parseBulkTypingPassageImportInput,
  TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS,
} from "./utils/bulk-typing-passage-import-parser";

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
  const submitLabel = mutation.isPending
    ? "저장 중..."
    : mode === "create"
      ? "덱 만들기"
      : "덱 저장";

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
      className={getYeonSurfaceClassName({ className: "p-5" })}
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
        {isDefaultDeck ? <YeonBadge>읽기 전용</YeonBadge> : null}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#555]">덱 제목</span>
          <YeonField
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isDefaultDeck}
            maxLength={120}
            placeholder="예: 아침 워밍업 문장"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#555]">설명</span>
          <YeonField
            as="textarea"
            value={description ?? ""}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isDefaultDeck}
            rows={3}
            maxLength={2000}
            className="resize-y leading-6"
            placeholder="어떤 연습에 쓰는 덱인지 적어주세요."
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-[#555]">
              언어 태그
            </span>
            <YeonField
              as="select"
              value={languageTag}
              onChange={(event) =>
                setLanguageTag(event.target.value as TypingDeckLanguageTag)
              }
              disabled={isDefaultDeck}
            >
              {TYPING_DECK_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </YeonField>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-[#555]">
              공개 범위
            </span>
            <YeonField
              as="select"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as TypingDeckVisibility)
              }
              disabled={isDefaultDeck}
            >
              {TYPING_DECK_VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </YeonField>
          </label>
        </div>
      </div>

      {mutation.error ? (
        <p className="mt-3 text-[13px] text-red-600">
          {mutation.error.message}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
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
      <YeonSurface variant="empty" className="p-8">
        <p className="text-[14px] font-semibold text-[#111]">
          표시할 덱이 없습니다.
        </p>
        <p className="mt-2 text-[13px] text-[#666]">
          내 덱 탭에서 새 덱을 만들거나 공개 덱을 둘러보세요.
        </p>
      </YeonSurface>
    );
  }

  return (
    <ul className="grid gap-3">
      {decks.map((deck) => (
        <li key={deck.id}>
          <button
            type="button"
            onClick={() => onSelectDeck(deck.id)}
            className={joinClassNames(
              getYeonSurfaceClassName({
                variant: selectedDeckId === deck.id ? "panel" : "card",
                className:
                  "w-full p-4 text-left transition-colors hover:border-[#111]",
              }),
              selectedDeckId === deck.id && "border-[#111]"
            )}
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
              <YeonBadge className="shrink-0">
                {typingDeckBadge(deck)}
              </YeonBadge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#666]">
              <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
                {typingDeckLanguageLabel(deck.languageTag)}
              </span>
              <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
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
  const submitLabel = mutation.isPending
    ? "저장 중..."
    : editingPassage
      ? "수정 저장"
      : "문단 추가";

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
      className={getYeonSurfaceClassName({ className: "p-5" })}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[16px] font-semibold text-[#111]">
          {editingPassage ? "문단 수정" : "문단 직접 추가"}
        </h3>
        {editingPassage ? (
          <YeonButton
            type="button"
            onClick={onCancelEdit}
            variant="ghost"
            className="px-0 py-0"
          >
            취소
          </YeonButton>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3">
        <YeonField
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="문단 제목 (선택)"
        />
        <YeonField
          as="textarea"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          placeholder="타이핑할 문장을 입력하세요."
          className="resize-y leading-6"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <YeonField
            as="select"
            value={textType}
            onChange={(event) =>
              setTextType(event.target.value as TypingPassageTextType)
            }
          >
            <option value="short">짧은 글</option>
            <option value="long">긴 글</option>
            <option value="code">코드</option>
          </YeonField>
          <YeonField
            as="select"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as TypingPassageDifficulty)
            }
          >
            <option value="easy">쉬움</option>
            <option value="normal">보통</option>
            <option value="hard">어려움</option>
          </YeonField>
        </div>
      </div>
      {mutation.error ? (
        <p className="mt-3 text-[13px] text-red-600">
          {mutation.error.message}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
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
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
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
      <YeonSurface variant="empty" className="p-8">
        <p className="text-[14px] font-semibold text-[#111]">
          아직 문단이 없습니다.
        </p>
        {!readonly ? (
          <p className="mt-2 text-[13px] text-[#666]">
            직접 추가하거나 AI 붙여넣기로 여러 문단을 넣어보세요.
          </p>
        ) : null}
      </YeonSurface>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {passages.map((passage, index) => (
        <YeonSurface as="li" key={passage.id} className="p-4">
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
                <YeonButton
                  type="button"
                  onClick={() => onEdit(passage)}
                  size="sm"
                >
                  수정
                </YeonButton>
                <YeonButton
                  type="button"
                  onClick={() => deletePassage.mutate(passage.id)}
                  variant="danger"
                  size="sm"
                >
                  삭제
                </YeonButton>
              </div>
            ) : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#555]">
            {passage.prompt}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#777]">
            <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
              {passage.textType}
            </span>
            <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
              {passage.difficulty}
            </span>
          </div>
          {deletePassage.error ? (
            <p className="mt-2 text-[12px] text-red-600">
              {deletePassage.error.message}
            </p>
          ) : null}
        </YeonSurface>
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
  const deleteDeckLabel = deleteDeck.isPending ? "삭제 중..." : "덱 삭제";

  return (
    <div className="space-y-5">
      <YeonSurface as="section" variant="panel" className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] font-semibold text-[#111]">
                {deck.title}
              </h2>
              <YeonBadge>{typingDeckBadge(deck)}</YeonBadge>
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
            <YeonButton
              type="button"
              onClick={() => deleteDeck.mutate(deck.id)}
              variant="danger"
            >
              {deleteDeckLabel}
            </YeonButton>
          ) : null}
        </div>
        {deleteDeck.error ? (
          <p className="mt-3 text-[13px] text-red-600">
            {deleteDeck.error.message}
          </p>
        ) : null}
      </YeonSurface>

      <TypingDeckForm mode="edit" deck={deck} adminMode={adminMode} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#111]">문단 목록</h3>
            <YeonBadge>{passages.length}</YeonBadge>
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
