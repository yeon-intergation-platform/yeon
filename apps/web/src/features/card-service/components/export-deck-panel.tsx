"use client";

import { useState } from "react";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";

interface ExportDeckPanelProps {
  items: CardDeckItemDto[];
  onClose: () => void;
}

function toExportText(items: CardDeckItemDto[]): string {
  return items
    .map((item, i) =>
      i < items.length - 1
        ? `[[Q]]\n${item.frontText}\n[[A]]\n${item.backText}\n[[CARD]]`
        : `[[Q]]\n${item.frontText}\n[[A]]\n${item.backText}`,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
      />
      <div className="relative z-10 w-full max-w-[600px] rounded-t-[28px] border border-[#e5e5e5] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(0,0,0,0.12)] md:rounded-xl md:p-6">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#d4d4d4] md:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-[#111]">내보내기</h2>
            <p className="mt-1 text-[13px] text-[#666]">
              복사 후 AI에 붙여넣어 카드를 수정·보완하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[18px] text-[#888] transition-colors hover:bg-[#f3f3f3] hover:text-[#111]"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <textarea
          readOnly
          value={text}
          rows={12}
          aria-label="내보내기 텍스트"
          className="mt-4 w-full resize-none rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 font-mono text-[13px] leading-5 text-[#333] outline-none"
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[13px] text-[#888]">{items.length}장</span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>
      </div>
    </div>
  );
}
