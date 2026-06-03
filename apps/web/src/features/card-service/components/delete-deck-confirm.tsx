"use client";
import { useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonText,
  YeonForm,
  YeonModal,
  YeonView,
  type YeonFormEvent,
  type YeonFormElement,
} from "@yeon/ui";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";
import { SHARED_FEATURE_CLASS } from "../../shared-style-constants";
import { useDeleteDeck } from "../hooks";

interface DeleteDeckConfirmProps {
  deckId: string;
  deckTitle: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteDeckConfirm({
  deckId,
  deckTitle,
  onClose,
  onDeleted,
}: DeleteDeckConfirmProps) {
  const [typed, setTyped] = useState("");
  const { mutate, isPending, error } = useDeleteDeck();

  const canSubmit = typed === deckTitle && !isPending;

  const handleSubmit = (event: YeonFormEvent<YeonFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    mutate(deckId, {
      onSuccess: () => {
        onDeleted();
      },
    });
  };

  return (
    <YeonModal
      visible
      aria-label="덱 삭제"
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
          덱 삭제
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-3 ${CARD_SERVICE_COMMON_CLASS.mutedErrorTextMd}`}
        >
          이 작업은 되돌릴 수 없습니다. 덱과 카드가 모두 삭제됩니다.
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-3 ${CARD_SERVICE_COMMON_CLASS.mutedErrorTextMd}`}
        >
          계속하려면 덱 제목{" "}
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="font-semibold text-[#111]"
          >
            {deckTitle}
          </YeonText>
          을(를) 아래에 그대로 입력해주세요.
        </YeonText>
        <YeonForm onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <YeonField
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
          />
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
            <YeonButton type="submit" disabled={!canSubmit} variant="danger">
              {isPending ? "삭제 중..." : "영구 삭제"}
            </YeonButton>
          </YeonView>
        </YeonForm>
      </YeonView>
    </YeonModal>
  );
}
