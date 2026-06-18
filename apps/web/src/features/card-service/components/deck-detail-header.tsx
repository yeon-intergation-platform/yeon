"use client";
import { useState } from "react";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  getYeonButtonClassName,
  YeonButton,
  YeonField,
  YeonText,
  YeonForm,
  YeonView,
  YEON_WEB_SHADOW_CLASS,
  YeonLink,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { useUpdateDeck } from "../hooks";

interface DeckDetailHeaderProps {
  deck: CardDeckDto;
  cardCount: number;
  onOpenDelete: () => void;
  onRequestAddCard: () => void;
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
  cardCount,
  onOpenDelete,
  onRequestAddCard,
  onRequestExport,
}: DeckDetailHeaderProps) {
  const [isEditing, setEditing] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description ?? "");
  const updateMutation = useUpdateDeck(deck.id);
  const isSaving = updateMutation.isPending;
  const createdDate = formatDate(deck.createdAt);
  const hasCards = cardCount > 0;

  const canSave = title.trim().length > 0 && !isSaving;

  const handleSubmit = (event: YeonFormEvent<YeonFormElement>) => {
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
    <YeonView as="section" className="bg-white text-[#111]">
      <YeonView className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-start md:flex md:items-center md:justify-between md:gap-4">
        <YeonLink
          href="/card-service/decks"
          className="flex h-11 w-11 items-center justify-start text-[28px] font-light leading-none text-[#111] no-underline hover:opacity-80 md:h-auto md:w-auto md:text-[14px] md:font-medium md:text-[#666]"
          aria-label="내 덱으로 돌아가기"
        >
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="md:hidden"
          >
            ←
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="hidden md:inline"
          >
            ← 내 덱
          </YeonText>
        </YeonLink>

        <YeonView className="min-w-0 text-center md:hidden">
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className={`${SHARED_FEATURE_CLASS.text28Emphasis} truncate leading-tight`}
          >
            <YeonButton
              type="button"
              onClick={startEditing}
              aria-label="덱 제목을 눌러 편집"
              variant="ghost"
              size="sm"
              className={`${SHARED_FEATURE_CLASS.text28Emphasis} w-full max-w-full truncate rounded-lg px-1 py-0 leading-tight`}
            >
              {deck.title}
            </YeonButton>
          </YeonText>
          <YeonText as="p" variant="body" tone="secondary" className="mt-2">
            카드 {cardCount}장 · 생성일 {createdDate}
          </YeonText>
        </YeonView>

        <YeonView className="relative flex justify-end md:hidden">
          <YeonButton
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            variant="icon"
            size="icon"
            className="h-11 w-11 justify-end text-[28px] leading-none text-[#111]"
            aria-label="덱 작업 더보기"
          >
            ⋮
          </YeonButton>
          {isMobileMenuOpen ? (
            <YeonView
              className={`absolute right-0 top-11 z-10 w-32 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white text-[13px] ${YEON_WEB_SHADOW_CLASS.dropdown}`}
            >
              <YeonButton
                type="button"
                onClick={startEditing}
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-none px-3 py-2 text-left text-[#111]"
              >
                덱 편집
              </YeonButton>
              <YeonButton
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestExport?.();
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-none px-3 py-2 text-left text-[#111]"
              >
                내보내기
              </YeonButton>
              <YeonButton
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDelete();
                }}
                variant="danger"
                size="sm"
                className="w-full justify-start rounded-none px-3 py-2 text-left"
              >
                덱 삭제
              </YeonButton>
            </YeonView>
          ) : null}
        </YeonView>

        <YeonView className="hidden items-center gap-2 md:flex">
          <YeonButton
            type="button"
            onClick={onRequestExport}
            variant="secondary"
            size="sm"
          >
            내보내기
          </YeonButton>
          <YeonButton
            type="button"
            onClick={onOpenDelete}
            variant="danger"
            size="sm"
          >
            덱 삭제
          </YeonButton>
        </YeonView>
      </YeonView>

      {isEditing ? (
        <YeonForm onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <YeonField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            autoFocus
            className={`${SHARED_FEATURE_CLASS.text22Emphasis} rounded-2xl px-4 py-3`}
          />
          <YeonField
            as="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="설명 (선택)"
            className="resize-none rounded-2xl px-4 py-3 text-[15px] leading-7"
          />
          {updateMutation.error ? (
            <YeonText
              as="p"
              variant="caption"
              tone="primary"
              className="text-[13px] font-semibold"
            >
              {updateMutation.error.message}
            </YeonText>
          ) : null}
          <YeonView className="flex justify-end gap-2">
            <YeonButton
              type="button"
              onClick={handleCancel}
              variant="secondary"
              size="md"
              className={CARD_SERVICE_COMMON_CLASS.panelTextEmphasis}
            >
              취소
            </YeonButton>
            <YeonButton
              type="submit"
              disabled={!canSave}
              variant="primary"
              size="md"
            >
              {isSaving ? "저장 중..." : "저장"}
            </YeonButton>
          </YeonView>
        </YeonForm>
      ) : (
        <YeonView className="mt-6 hidden md:block">
          <YeonView className="min-w-0">
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={`${SHARED_FEATURE_CLASS.text34Emphasis} break-keep leading-tight`}
            >
              <YeonButton
                type="button"
                onClick={startEditing}
                aria-label="덱 제목을 눌러 편집"
                variant="ghost"
                size="sm"
                className={`${SHARED_FEATURE_CLASS.text34Emphasis} break-keep rounded-lg px-1 py-0 text-left leading-tight`}
              >
                {deck.title}
              </YeonButton>
            </YeonText>
            {deck.description ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-3 whitespace-pre-wrap text-[16px] leading-7 text-[#666]"
              >
                {deck.description}
              </YeonText>
            ) : (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-3 text-[14px] text-[#aaa]"
              >
                설명 없음
              </YeonText>
            )}
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-4 ${SHARED_FEATURE_CLASS.text14Soft}`}
            >
              카드 {cardCount}장 · 학습 진행률 0% · 생성일 {createdDate}
            </YeonText>
          </YeonView>
        </YeonView>
      )}

      {hasCards ? (
        <YeonLink
          href={resolveYeonWebPath("cardDeckPlay", { deckId: deck.id })}
          className={getYeonButtonClassName({
            variant: "primary",
            size: "xl",
            className:
              "mt-8 flex w-full rounded-[22px] px-4 py-4 text-[20px] md:mt-6 md:py-3.5 md:text-[16px]",
          })}
          onClick={() =>
            trackEvent(analyticsEvents.cardStudyStart, {
              deck_id: deck.id,
              item_count: cardCount,
            })
          }
        >
          ▶ 학습 시작
        </YeonLink>
      ) : (
        <YeonButton
          type="button"
          onClick={onRequestAddCard}
          variant="primary"
          size="xl"
          className="mt-8 flex w-full rounded-[22px] px-4 py-4 text-[20px] md:mt-6 md:py-3.5 md:text-[16px]"
        >
          + 첫 카드 추가
        </YeonButton>
      )}
    </YeonView>
  );
}
