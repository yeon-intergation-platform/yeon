"use client";

import { useState, type FormEvent } from "react";

import { useAddCard } from "../hooks";
import { MarkdownEditor } from "./markdown-editor";

interface AddCardFormProps {
  deckId: string;
}

export function AddCardForm({ deckId }: AddCardFormProps) {
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const { mutate, isPending, error } = useAddCard(deckId);

  const canSubmit =
    frontText.trim().length > 0 && backText.trim().length > 0 && !isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    mutate(
      {
        frontText: frontText.trim(),
        backText: backText.trim(),
      },
      {
        onSuccess: () => {
          setFrontText("");
          setBackText("");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <MarkdownEditor
          label="질문"
          value={frontText}
          onChange={setFrontText}
          maxLength={2000}
          minRows={5}
          placeholder="질문을 Markdown으로 입력하세요..."
        />
        <MarkdownEditor
          label="답변"
          value={backText}
          onChange={setBackText}
          maxLength={2000}
          minRows={7}
          placeholder="답변을 Markdown으로 입력하세요..."
        />
      </div>
      {error ? (
        <p className="mt-3 text-[13px] text-red-600">{error.message}</p>
      ) : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-[#111] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {isPending ? "추가 중..." : "+ 카드 추가"}
        </button>
      </div>
    </form>
  );
}
