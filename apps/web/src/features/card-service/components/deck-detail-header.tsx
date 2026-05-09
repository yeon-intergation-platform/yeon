"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";

import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useUpdateDeck } from "../hooks";

interface DeckDetailHeaderProps {
  deck: CardDeckDto;
  onOpenDelete: () => void;
  onRequestExport?: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function DeckDetailHeader({
  deck,
  onOpenDelete,
  onRequestExport,
}: DeckDetailHeaderProps) {
  const [isEditing, setEditing] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description ?? "");
  const updateMutation = useUpdateDeck(deck.id);
  const isSaving = updateMutation.isPending;
  const createdDate = formatDate(deck.createdAt);

  const canSave = title.trim().length > 0 && !isSaving;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    updateMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
      },
      {
        onSuccess: () => {
          setEditing(false);
          setMobileMenuOpen(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setTitle(deck.title);
    setDescription(deck.description ?? "");
    setEditing(false);
    setMobileMenuOpen(false);
  };

  const startEditing = () => {
    if (isEditing) return;
    setMobileMenuOpen(false);
    setEditing(true);
  };

  return (
    <section className="bg-white text-[#111]">
      <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-start md:flex md:items-center md:justify-between md:gap-4">
        <Link
          href="/card-service"
          className="flex h-11 w-11 items-center justify-start text-[28px] font-light leading-none text-[#111] no-underline hover:text-[#555] md:h-auto md:w-auto md:text-[14px] md:font-medium md:text-[#666]"
          aria-label="내 덱으로 돌아가기"
        >
          <span className="md:hidden">←</span>
          <span className="hidden md:inline">← 내 덱</span>
        </Link>

        <div className="min-w-0 text-center md:hidden">
          <h1 className="truncate text-[28px] font-semibold leading-tight text-[#111]">
            <button
              type="button"
              onClick={startEditing}
              aria-label="덱 제목을 눌러 편집"
              className="w-full max-w-full truncate rounded-lg px-1 text-[28px] font-semibold leading-tight text-[#111] outline-none transition-colors hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-[#111]"
            >
              {deck.title}
            </button>
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-[#888]">
            카드 {deck.itemCount}장 · 생성일 {createdDate}
          </p>
        </div>

        <div className="relative flex justify-end md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-end text-[28px] leading-none text-[#111]"
            aria-label="덱 작업 더보기"
          >
            ⋮
          </button>
          {isMobileMenuOpen ? (
            <div className="absolute right-0 top-11 z-10 w-32 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white text-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
              <button
                type="button"
                onClick={startEditing}
                className="block w-full px-3 py-2 text-left text-[#111] hover:bg-[#fafafa]"
              >
                덱 편집
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestExport?.();
                }}
                className="block w-full px-3 py-2 text-left text-[#111] hover:bg-[#fafafa]"
              >
                내보내기
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDelete();
                }}
                className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
              >
                덱 삭제
              </button>
            </div>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={onRequestExport}
            className="rounded-xl border border-[#e5e5e5] px-3 py-1.5 text-[13px] font-medium text-[#777] transition-colors hover:border-[#111] hover:text-[#111]"
          >
            내보내기
          </button>
          <button
            type="button"
            onClick={onOpenDelete}
            className="rounded-xl border border-[#e5e5e5] px-3 py-1.5 text-[13px] font-medium text-[#777] transition-colors hover:border-red-200 hover:bg-[#fff5f5] hover:text-red-600"
          >
            덱 삭제
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            autoFocus
            className="rounded-2xl border border-[#e5e5e5] px-4 py-3 text-[22px] font-semibold text-[#111] outline-none focus:border-[#111]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="설명 (선택)"
            className="resize-none rounded-2xl border border-[#e5e5e5] px-4 py-3 text-[15px] leading-7 text-[#111] outline-none focus:border-[#111]"
          />
          {updateMutation.error ? (
            <p className="text-[13px] text-red-600">
              {updateMutation.error.message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl border border-[#e5e5e5] px-4 py-2 text-[14px] font-semibold text-[#111] hover:border-[#111] hover:bg-[#fafafa]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="rounded-2xl bg-[#111] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 hidden md:block">
          <div className="min-w-0">
            <h1 className="break-keep text-[34px] font-semibold leading-tight text-[#111]">
              <button
                type="button"
                onClick={startEditing}
                aria-label="덱 제목을 눌러 편집"
                className="break-keep rounded-lg px-1 text-left text-[34px] font-semibold leading-tight text-[#111] outline-none transition-colors hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-[#111]"
              >
                {deck.title}
              </button>
            </h1>
            {deck.description ? (
              <p className="mt-3 whitespace-pre-wrap text-[16px] leading-7 text-[#666]">
                {deck.description}
              </p>
            ) : (
              <p className="mt-3 text-[14px] text-[#aaa]">설명 없음</p>
            )}
            <p className="mt-4 text-[14px] text-[#888]">
              카드 {deck.itemCount}장 · 학습 진행률 0% · 생성일 {createdDate}
            </p>
          </div>
        </div>
      )}

      <Link
        href={`/card-service/decks/${deck.id}/play`}
        className="mt-8 flex w-full items-center justify-center rounded-[22px] bg-[#111] px-4 py-4 text-[20px] font-semibold text-white no-underline transition-colors hover:bg-[#333] md:mt-6 md:py-3.5 md:text-[16px]"
        onClick={() =>
          trackEvent(analyticsEvents.cardStudyStart, {
            deck_id: deck.id,
            item_count: deck.itemCount,
          })
        }
      >
        ▶ 학습 시작
      </Link>
    </section>
  );
}
