"use client";

import { useState, type FormEvent } from "react";

import {
  YeonButton,
  YeonField,
  getYeonSurfaceClassName,
} from "@/components/yeon-ui";
import {
  type CreateTypingDeckPassageBody,
  type TypingDeckPassageDto,
  type TypingPassageDifficulty,
  type TypingPassageTextType,
  useCreateTypingDeckPassage,
  useUpdateTypingDeckPassage,
} from "./use-typing-decks";

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
