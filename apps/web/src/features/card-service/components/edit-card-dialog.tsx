"use client";

import { useState } from "react";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

import { AddCardForm } from "./add-card-form";
import { ResponsiveModal } from "./responsive-modal";

interface EditCardDialogProps {
  deckId: string;
  item: CardDeckItemDto;
  onClose: () => void;
}

export function EditCardDialog({ deckId, item, onClose }: EditCardDialogProps) {
  const [isDirty, setDirty] = useState(false);

  const handleRequestClose = () => {
    if (
      isDirty &&
      !window.confirm(
        "수정 중인 카드 내용이 있습니다. 저장하지 않고 닫아도 임시 저장본은 남습니다. 닫을까요?"
      )
    ) {
      return;
    }
    onClose();
  };

  return (
    <ResponsiveModal
      title="카드 수정"
      description="생성 화면과 동일한 Markdown/이미지 편집 기능으로 카드를 수정합니다."
      onClose={handleRequestClose}
    >
      <AddCardForm
        deckId={deckId}
        itemId={item.id}
        initialValue={{
          frontText: item.frontText,
          backText: item.backText,
          imageStorageKey: item.imageStorageKey,
          imageUrl: item.imageUrl,
        }}
        submitLabel="수정 저장"
        pendingLabel="저장 중..."
        onSaved={onClose}
        onCancel={handleRequestClose}
        onDirtyChange={setDirty}
      />
    </ResponsiveModal>
  );
}
