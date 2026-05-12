"use client";

import { useMemo, useState } from "react";

import { AddCardForm } from "./add-card-form";
import { BulkAddCardsForm } from "./bulk-add-cards-form";
import { ResponsiveModal } from "./responsive-modal";

const ADD_CARD_MODES = {
  manual: "manual",
  bulk: "bulk",
} as const;

type AddCardMode = (typeof ADD_CARD_MODES)[keyof typeof ADD_CARD_MODES];

interface AddCardsPanelProps {
  deckId: string;
  onClose: () => void;
}

export function AddCardsPanel({ deckId, onClose }: AddCardsPanelProps) {
  const [mode, setMode] = useState<AddCardMode>(ADD_CARD_MODES.manual);
  const [isDirty, setDirty] = useState(false);

  const modeDescription = useMemo(
    () =>
      mode === ADD_CARD_MODES.manual
        ? "질문, 답변, 인라인 이미지를 한 화면에서 작성하고 저장할 수 있습니다."
        : "AI가 만든 카드 묶음을 붙여넣어 여러 장을 한 번에 추가할 수 있습니다.",
    [mode]
  );

  const handleRequestClose = () => {
    if (
      isDirty &&
      !window.confirm(
        "작성 중인 카드 내용이 있습니다. 지금 닫으면 임시 저장본만 남고 저장은 되지 않습니다. 닫을까요?"
      )
    ) {
      return;
    }
    onClose();
  };

  return (
    <ResponsiveModal
      title="카드 추가"
      description={modeDescription}
      onClose={handleRequestClose}
      widthClassName="max-w-[1180px]"
    >
      <div className="flex rounded-2xl bg-[#f3f3f3] p-1 text-[14px] font-semibold">
        <button
          type="button"
          onClick={() => setMode(ADD_CARD_MODES.manual)}
          className={`flex-1 rounded-xl px-3 py-3 transition-colors ${
            mode === ADD_CARD_MODES.manual
              ? "bg-white text-[#111] shadow-sm"
              : "text-[#666] hover:text-[#111]"
          }`}
        >
          직접 작성
        </button>
        <button
          type="button"
          onClick={() => setMode(ADD_CARD_MODES.bulk)}
          className={`flex-1 rounded-xl px-3 py-3 transition-colors ${
            mode === ADD_CARD_MODES.bulk
              ? "bg-white text-[#111] shadow-sm"
              : "text-[#666] hover:text-[#111]"
          }`}
        >
          일괄 추가
        </button>
      </div>

      <div className="mt-5">
        {mode === ADD_CARD_MODES.manual ? (
          <AddCardForm
            deckId={deckId}
            onSaved={onClose}
            onCancel={handleRequestClose}
            onDirtyChange={setDirty}
          />
        ) : (
          <BulkAddCardsForm
            deckId={deckId}
            onSuccess={onClose}
            onDirtyChange={setDirty}
          />
        )}
      </div>
    </ResponsiveModal>
  );
}
