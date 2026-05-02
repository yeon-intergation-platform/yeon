"use client";

import { useState } from "react";

import { AddCardForm } from "./add-card-form";
import { BulkAddCardsForm } from "./bulk-add-cards-form";

const ADD_CARD_MODES = {
  manual: "manual",
  bulk: "bulk",
} as const;

type AddCardMode = (typeof ADD_CARD_MODES)[keyof typeof ADD_CARD_MODES];

interface AddCardsPanelProps {
  deckId: string;
  surface?: "panel" | "sheet";
}

export function AddCardsPanel({
  deckId,
  surface = "panel",
}: AddCardsPanelProps) {
  const [mode, setMode] = useState<AddCardMode>(() =>
    surface === "sheet" ? ADD_CARD_MODES.manual : ADD_CARD_MODES.bulk,
  );

  const isSheet = surface === "sheet";

  return (
    <section
      className={
        isSheet
          ? "bg-white text-[#111]"
          : "rounded-xl border border-[#e5e5e5] bg-white p-5 text-[#111]"
      }
    >
      <div>
        <h3 className="text-[18px] font-semibold text-[#111]">새 카드 추가</h3>
        <p className="mt-2 text-[13px] leading-5 text-[#666]">
          새로운 카드를 직접 입력하거나 AI 형식으로 붙여넣어 추가하세요.
        </p>
      </div>

      <div className="mt-5 flex rounded-xl bg-[#f3f3f3] p-1 text-[13px] font-semibold">
        <button
          type="button"
          onClick={() => setMode(ADD_CARD_MODES.manual)}
          className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
            mode === ADD_CARD_MODES.manual
              ? "bg-white text-[#111] shadow-sm"
              : "text-[#666] hover:text-[#111]"
          }`}
        >
          직접 입력
        </button>
        <button
          type="button"
          onClick={() => setMode(ADD_CARD_MODES.bulk)}
          className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
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
          <AddCardForm deckId={deckId} />
        ) : (
          <BulkAddCardsForm deckId={deckId} />
        )}
      </div>
    </section>
  );
}

