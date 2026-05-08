"use client";

import { useRef, useState, type TouchEvent } from "react";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

import { useDeleteCard } from "../hooks";
import { EditCardDialog } from "./edit-card-dialog";
import { MarkdownContent } from "./markdown-content";

interface CardRowProps {
  deckId: string;
  item: CardDeckItemDto;
  index?: number;
  onDeleted?: () => void;
}

export function CardRow({ deckId, item, index, onDeleted }: CardRowProps) {
  const [isDeleteRevealed, setDeleteRevealed] = useState(false);
  const [isDeleteConfirming, setDeleteConfirming] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const touchStateRef = useRef<{
    startX: number | null;
    ignoreNextClick: boolean;
  }>({ startX: null, ignoreNextClick: false });
  const deleteMutation = useDeleteCard(deckId);
  const isDeleting = deleteMutation.isPending;

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (isEditOpen) return;
    touchStateRef.current.startX = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStateRef.current.startX;
    touchStateRef.current.startX = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (deltaX < -48) {
      touchStateRef.current.ignoreNextClick = true;
      setDeleteRevealed(true);
      setDeleteConfirming(false);
      return;
    }
    if (deltaX > 32) {
      touchStateRef.current.ignoreNextClick = true;
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
        setDeleteConfirming(false);
        setDeleteRevealed(false);
        onDeleted?.();
      },
    });
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white shadow-[0_6px_22px_rgba(17,17,17,0.04)]">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (touchStateRef.current.ignoreNextClick) {
              touchStateRef.current.ignoreNextClick = false;
              return;
            }
            if (isDeleteRevealed) {
              setDeleteRevealed(false);
              setDeleteConfirming(false);
              return;
            }
            setEditOpen(true);
          }}
          className={`grid grid-cols-[52px_minmax(0,1fr)_48px] items-stretch transition-transform duration-200 md:grid-cols-[64px_minmax(0,1fr)_56px] ${
            isDeleteRevealed ? "-translate-x-24" : "translate-x-0"
          }`}
        >
          <div className="flex items-start justify-center border-r border-[#efefef] pt-5 text-[15px] font-semibold text-[#888] md:text-[16px]">
            {index ?? "-"}
          </div>

          <div className="min-w-0 px-4 py-4 md:px-5 md:py-5">
            <div>
              <span className="inline-flex rounded-full border border-[#ececec] bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#888] md:text-[12px]">
                질문
              </span>
              <div className="mt-3 text-[18px] font-semibold leading-8 text-[#111] md:text-[20px]">
                <MarkdownContent>{item.frontText}</MarkdownContent>
              </div>
            </div>

            {item.imageUrl ? (
              <div className="mt-4 rounded-2xl border border-[#efefef] bg-[#fafafa] p-3">
                <p className="mb-2 text-[12px] font-semibold text-[#777]">
                  첨부 이미지
                </p>
                <img
                  src={item.imageUrl}
                  alt="카드 첨부 이미지"
                  className="max-h-[280px] w-full rounded-xl object-contain"
                  draggable={false}
                />
              </div>
            ) : null}

            <div className="mt-5 border-t border-[#f0f0f0] pt-4">
              <span className="inline-flex rounded-full border border-[#ececec] bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#888] md:text-[12px]">
                답변
              </span>
              <div className="mt-3 text-[15px] leading-7 text-[#444] md:text-[16px]">
                <MarkdownContent>{item.backText}</MarkdownContent>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-[#888] md:text-[13px]">
              <span>카드를 눌러 수정</span>
              {deleteMutation.error ? (
                <span className="font-medium text-red-600">
                  {deleteMutation.error.message}
                </span>
              ) : null}
            </div>

            {isDeleteConfirming ? (
              <div
                className="mt-3 flex justify-end gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setDeleteConfirming(false)}
                  className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[12px] font-semibold text-[#111] hover:bg-[#fafafa]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl border border-red-100 px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? "삭제 중..." : "삭제 확인"}
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-start justify-center pt-4 pr-1 md:pr-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (!isDeleteRevealed) handleDelete();
              }}
              disabled={isDeleting}
              aria-label="카드 삭제"
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                isDeleteConfirming
                  ? "text-red-500 hover:bg-red-50"
                  : "text-[#ccc] hover:bg-[#fafafa] hover:text-[#888]"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5L13 4" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-50 transition-transform duration-200 ${
            isDeleteRevealed ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="h-full w-full text-[13px] font-semibold text-red-600 disabled:opacity-50"
          >
            {isDeleting ? "삭제 중" : isDeleteConfirming ? "확인" : "삭제"}
          </button>
        </div>
      </div>

      {isEditOpen ? (
        <EditCardDialog
          deckId={deckId}
          item={item}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </>
  );
}
