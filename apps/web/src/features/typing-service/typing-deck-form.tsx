"use client";

import { useState, type FormEvent } from "react";

import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  YeonBadge,
  YeonButton,
  YeonField,
  getYeonSurfaceClassName,
} from "@/components/yeon-ui";
import {
  TYPING_DECK_LANGUAGE_OPTIONS,
  TYPING_DECK_VISIBILITY_OPTIONS,
  type CreateTypingDeckBody,
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckVisibility,
  useCreateTypingDeck,
  useUpdateTypingDeck,
} from "./use-typing-decks";

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
