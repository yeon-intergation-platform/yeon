"use client";

import { useState, type FormEvent } from "react";

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
    <div
      className={SHARED_FEATURE_CLASS.modalOverlay}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={SHARED_FEATURE_CLASS.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={CARD_SERVICE_COMMON_CLASS.panelBodyTitle}>
          새 덱 만들기
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className={SHARED_FEATURE_CLASS.text13Neutral}>제목</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              autoFocus
              className={SHARED_FEATURE_CLASS.inputText14}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={SHARED_FEATURE_CLASS.text13Neutral}>
              설명 (선택)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              className={`resize-none ${SHARED_FEATURE_CLASS.inputText14}`}
            />
          </label>
          {error ? (
            <p className={CARD_SERVICE_COMMON_CLASS.errorTextSm}>
              {error.message}
            </p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={SHARED_FEATURE_CLASS.ghostButtonMd14}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`${SHARED_FEATURE_CLASS.primaryActionButtonMd14} disabled:opacity-50`}
            >
              {isPending ? "생성 중..." : "만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
