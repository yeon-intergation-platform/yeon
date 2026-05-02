"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

import { useDeleteCard, useUpdateCard } from "../hooks";
import { MarkdownContent } from "./markdown-content";

interface CardRowProps {
  deckId: string;
  item: CardDeckItemDto;
  index?: number;
  onDeleted?: () => void;
}

type EditingField = "front" | "back";

export function CardRow({ deckId, item, index, onDeleted }: CardRowProps) {
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isDeleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [isDeleteRevealed, setDeleteRevealed] = useState(false);
  const [frontText, setFrontText] = useState(item.frontText);
  const [backText, setBackText] = useState(item.backText);
  const [isDeleteConfirming, setDeleteConfirming] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const shouldIgnoreNextClickRef = useRef(false);
  const updateMutation = useUpdateCard(deckId);
  const deleteMutation = useDeleteCard(deckId);
  const isSaving = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const canSave =
    frontText.trim().length > 0 && backText.trim().length > 0 && !isSaving;

  useEffect(() => {
    if (editingField) return;
    setFrontText(item.frontText);
    setBackText(item.backText);
  }, [editingField, item.frontText, item.backText]);

  const startEditing = (field: EditingField) => {
    setFrontText(item.frontText);
    setBackText(item.backText);
    setEditingField(field);
    setDeleteMenuOpen(false);
    setDeleteRevealed(false);
    setDeleteConfirming(false);
    updateMutation.reset();
  };

  const handleCancel = () => {
    setFrontText(item.frontText);
    setBackText(item.backText);
    setEditingField(null);
    updateMutation.reset();
  };

  const handleSave = () => {
    if (!canSave) return;
    updateMutation.mutate(
      {
        itemId: item.id,
        body: {
          frontText: frontText.trim(),
          backText: backText.trim(),
        },
      },
      {
        onSuccess: () => setEditingField(null),
      },
    );
  };

  const handleFieldKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
      return;
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSave();
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (editingField) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (deltaX < -48) {
      shouldIgnoreNextClickRef.current = true;
      setDeleteMenuOpen(false);
      setDeleteRevealed(true);
      setDeleteConfirming(false);
      return;
    }
    if (deltaX > 32) {
      shouldIgnoreNextClickRef.current = true;
      setDeleteRevealed(false);
      setDeleteConfirming(false);
    }
  };

  const handleContainerClick = () => {
    if (shouldIgnoreNextClickRef.current) {
      shouldIgnoreNextClickRef.current = false;
      return;
    }
    if (isDeleteRevealed) {
      setDeleteRevealed(false);
      setDeleteConfirming(false);
    }
  };

  const handleDelete = () => {
    if (!isDeleteConfirming) {
      setDeleteConfirming(true);
      return;
    }
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        setDeleteMenuOpen(false);
        setDeleteConfirming(false);
        setDeleteRevealed(false);
        onDeleted?.();
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#e5e5e5] bg-white">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleContainerClick}
        className={`grid grid-cols-[44px_minmax(0,1fr)_48px] items-stretch transition-transform duration-200 md:grid-cols-[56px_minmax(0,1fr)_52px] ${
          isDeleteRevealed ? "-translate-x-24" : "translate-x-0"
        }`}
      >
        {/* 번호 */}
        <div className="flex items-start justify-center border-r border-[#e5e5e5] pt-4 text-[14px] font-semibold text-[#888]">
          {index ?? "-"}
        </div>

        {/* 내용 */}
        <div className="min-w-0 px-3 py-3 md:px-4">
          {/* 질문 필드 */}
          <div>
            <span className="inline-block rounded-md border border-[#e5e5e5] bg-[#fafafa] px-2 py-0.5 text-[11px] font-semibold text-[#888]">
              질문
            </span>
            {editingField === "front" ? (
              <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                <textarea
                  autoFocus
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  onKeyDown={handleFieldKeyDown}
                  maxLength={2000}
                  rows={Math.max(2, frontText.split("\n").length)}
                  className="w-full resize-none rounded-lg border border-[#111] px-3 py-2 text-[14px] text-[#111] outline-none"
                />
                {updateMutation.error ? (
                  <p className="mt-1 text-[12px] text-red-600">
                    {updateMutation.error.message}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-[#aaa]">
                  Cmd/Ctrl+Enter로 저장, Esc로 취소
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[12px] text-[#111] hover:bg-[#fafafa]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="rounded-lg bg-[#111] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDeleteRevealed) startEditing("front");
                }}
                className="mt-1.5 w-full rounded-md px-1 py-1 text-left text-[15px] font-medium text-[#111] hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] md:text-[14px]"
                aria-label="질문 클릭해 편집"
              >
                <MarkdownContent>{item.frontText}</MarkdownContent>
              </button>
            )}
          </div>

          {/* 답변 필드 */}
          <div className="mt-3 border-t border-[#f0f0f0] pt-3">
            <span className="inline-block rounded-md border border-[#e5e5e5] bg-[#fafafa] px-2 py-0.5 text-[11px] font-semibold text-[#888]">
              답변
            </span>
            {editingField === "back" ? (
              <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                <textarea
                  autoFocus
                  value={backText}
                  onChange={(e) => setBackText(e.target.value)}
                  onKeyDown={handleFieldKeyDown}
                  maxLength={2000}
                  rows={Math.max(3, backText.split("\n").length)}
                  className="w-full resize-none rounded-lg border border-[#111] px-3 py-2 text-[14px] text-[#111] outline-none"
                />
                {updateMutation.error ? (
                  <p className="mt-1 text-[12px] text-red-600">
                    {updateMutation.error.message}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-[#aaa]">
                  Cmd/Ctrl+Enter로 저장, Esc로 취소
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[12px] text-[#111] hover:bg-[#fafafa]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="rounded-lg bg-[#111] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDeleteRevealed) startEditing("back");
                }}
                className="mt-1.5 w-full rounded-md px-1 py-1 text-left text-[14px] text-[#444] hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]"
                aria-label="답변 클릭해 편집"
              >
                <MarkdownContent>{item.backText}</MarkdownContent>
              </button>
            )}
          </div>

          {/* 삭제 오류 */}
          {deleteMutation.error ? (
            <p className="mt-2 text-[12px] text-red-600">
              {deleteMutation.error.message}
            </p>
          ) : null}

          {/* 삭제 확인 메뉴 */}
          {isDeleteMenuOpen ? (
            <div
              className="mt-2 flex justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setDeleteMenuOpen(false);
                  setDeleteConfirming(false);
                }}
                className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[12px] text-[#111] hover:bg-[#fafafa]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-red-100 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting
                  ? "삭제 중..."
                  : isDeleteConfirming
                    ? "삭제 확인"
                    : "삭제"}
              </button>
            </div>
          ) : null}

          <p className="sr-only" role="status" aria-live="polite">
            {isDeleteRevealed
              ? "삭제하려면 오른쪽의 삭제 버튼을 한 번 더 누르세요."
              : ""}
          </p>
        </div>

        {/* ⋮ 버튼 */}
        <div className="flex items-start justify-center pt-3 pr-1 md:pr-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteMenuOpen((prev) => !prev);
              setDeleteRevealed(false);
              setDeleteConfirming(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[16px] text-[#999] hover:bg-[#fafafa] hover:text-[#111]"
            aria-label="카드 삭제 메뉴"
          >
            ⋮
          </button>
        </div>
      </div>

      {/* 스와이프 삭제 버튼 */}
      <div
        className={`absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-50 transition-transform duration-200 ${
          isDeleteRevealed ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={isDeleting}
          className="h-full w-full text-[13px] font-semibold text-red-600 disabled:opacity-50"
        >
          {isDeleting ? "삭제 중" : isDeleteConfirming ? "확인" : "삭제"}
        </button>
      </div>
    </div>
  );
}
