"use client";

import { useState } from "react";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

import { ResponsiveModal } from "./responsive-modal";
import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

interface ExportDeckPanelProps {
  items: CardDeckItemDto[];
  onClose: () => void;
}

function toExportText(items: CardDeckItemDto[]): string {
  return items
    .map((item, i) =>
      i < items.length - 1
        ? `[[Q]]\n${item.frontText}\n[[A]]\n${item.backText}\n[[CARD]]`
        : `[[Q]]\n${item.frontText}\n[[A]]\n${item.backText}`
    )
    .join("\n");
}

export function ExportDeckPanel({ items, onClose }: ExportDeckPanelProps) {
  const [copied, setCopied] = useState(false);
  const text = toExportText(items);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ResponsiveModal
      title="내보내기"
      description="복사 후 AI에 붙여넣어 카드를 수정·보완하세요. 텍스트 선택 영역과 드래그 영역이 충돌하지 않도록 정리했습니다."
      onClose={onClose}
      widthClassName="max-w-[720px]"
    >
      <div className="select-none">
        <textarea
          readOnly
          value={text}
          rows={14}
          aria-label="내보내기 텍스트"
          draggable={false}
          className="mt-1 w-full resize-none rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 font-mono text-[13px] leading-6 text-[#333] outline-none select-text md:text-[14px]"
        />

        <div className={SHARED_FEATURE_CLASS.alignBetweenGap3WithMargin4}>
          <span className={`${SHARED_FEATURE_CLASS.text13Soft} md:text-[14px]`}>
            총 {items.length}장
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-2xl bg-[#111] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
