"use client";
import { useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonText,
  YeonLabel,
  YeonForm,
  YeonModal,
  YeonView,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { SHARED_FEATURE_CLASS } from "../../shared-style-constants";
import { useIsAuthenticated } from "../auth-context";
import { useCreateDeck } from "../hooks";

interface CreateDeckDialogProps {
  onClose: () => void;
}

export function CreateDeckDialog({ onClose }: CreateDeckDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { mutate, isPending, error } = useCreateDeck();
  const isAuthenticated = useIsAuthenticated();

  const trimmedTitle = title.trim();
  const canSubmit = trimmedTitle.length > 0 && !isPending;

  const handleSubmit = (event: YeonFormEvent<YeonFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    trackEvent(analyticsEvents.cardDeckCreateSubmit, {
      authenticated: isAuthenticated,
      title_length: trimmedTitle.length,
    });
    mutate(
      {
        title: trimmedTitle,
        description: description.trim() || null,
      },
      {
        onSuccess: (deck) => {
          trackEvent(analyticsEvents.cardDeckCreated, {
            deck_id: deck.id,
            authenticated: isAuthenticated,
          });
          onClose();
        },
      }
    );
  };

  return (
    <YeonModal
      visible
      aria-label="새 덱 만들기"
      className={SHARED_FEATURE_CLASS.modalOverlay}
      onClick={onClose}
      onRequestClose={onClose}
    >
      <YeonView
        className={SHARED_FEATURE_CLASS.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className={CARD_SERVICE_COMMON_CLASS.panelBodyTitle}
        >
          새 덱 만들기
        </YeonText>
        <YeonForm onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <YeonLabel className="flex flex-col gap-2">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13Neutral}
            >
              제목
            </YeonText>
            <YeonField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              autoFocus
            />
          </YeonLabel>
          <YeonLabel className="flex flex-col gap-2">
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13Neutral}
            >
              설명 (선택)
            </YeonText>
            <YeonField
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              className="resize-none"
            />
          </YeonLabel>
          {error ? (
            <YeonText
              as="p"
              variant="caption"
              tone="primary"
              className="font-semibold"
            >
              {error.message}
            </YeonText>
          ) : null}
          <YeonView className="mt-2 flex justify-end gap-2">
            <YeonButton type="button" onClick={onClose} variant="secondary">
              취소
            </YeonButton>
            <YeonButton type="submit" disabled={!canSubmit} variant="primary">
              {isPending ? "생성 중..." : "만들기"}
            </YeonButton>
          </YeonView>
        </YeonForm>
      </YeonView>
    </YeonModal>
  );
}
