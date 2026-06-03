"use client";
import { useState } from "react";
import {
  YeonButton,
  YeonField,
  getYeonSurfaceClassName,
  YeonForm,
  YeonText,
  YeonView,
  YeonOption,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { SHARED_FEATURE_CLASS } from "../shared-style-constants";
import {
  type CreateTypingDeckPassageBody,
  type TypingDeckPassageDto,
  type TypingPassageDifficulty,
  type TypingPassageTextType,
  useCreateTypingDeckPassage,
  useUpdateTypingDeckPassage,
} from "./use-typing-decks";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";

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

  function handleSubmit(event: YeonFormEvent<YeonFormElement>) {
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
    <YeonForm
      onSubmit={handleSubmit}
      className={getYeonSurfaceClassName({ className: "p-5" })}
    >
      <YeonView className={SHARED_FEATURE_CLASS.alignBetweenGap3}>
        <YeonText
          as="h3"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text16Emphasis}
        >
          {editingPassage ? "문단 수정" : "문단 직접 추가"}
        </YeonText>
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
      </YeonView>
      <YeonView className="mt-4 grid gap-3">
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
        <YeonView className="grid gap-3 sm:grid-cols-2">
          <YeonField
            as="select"
            value={textType}
            onChange={(event) =>
              setTextType(event.target.value as TypingPassageTextType)
            }
          >
            <YeonOption value="short">짧은 글</YeonOption>
            <YeonOption value="long">긴 글</YeonOption>
            <YeonOption value="code">코드</YeonOption>
          </YeonField>
          <YeonField
            as="select"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as TypingPassageDifficulty)
            }
          >
            <YeonOption value="easy">쉬움</YeonOption>
            <YeonOption value="normal">보통</YeonOption>
            <YeonOption value="hard">어려움</YeonOption>
          </YeonField>
        </YeonView>
      </YeonView>
      {mutation.error ? (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.textErrorWithSpacing}
        >
          {mutation.error.message}
        </YeonText>
      ) : null}
      <YeonView className="mt-4 flex justify-end">
        <YeonButton type="submit" disabled={!canSubmit} variant="primary">
          {submitLabel}
        </YeonButton>
      </YeonView>
    </YeonForm>
  );
}
