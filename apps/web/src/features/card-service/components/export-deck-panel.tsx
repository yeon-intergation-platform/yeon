"use client";
import { useState } from "react";
import {
  copyYeonClipboardText,
  scheduleYeonTimeout,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { YeonButton, YeonField, YeonText, YeonView } from "@yeon/ui";
import { ResponsiveModal } from "./responsive-modal";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

interface ExportDeckPanelProps {
  items: CardDeckItemDto[];
  onClose: () => void;
}

function buildExportDeckCopyErrorMessage(itemCount: number) {
  return `덱 내보내기 텍스트를 클립보드에 복사하지 못했습니다. 복사 대상 카드 수: ${itemCount}장. 브라우저 클립보드 권한 또는 보안 컨텍스트를 확인해 주세요.`;
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
  const [copyErrorMessage, setCopyErrorMessage] = useState<string | null>(null);
  const text = toExportText(items);

  const handleCopy = async () => {
    const copiedSuccessfully = await copyYeonClipboardText(text);
    if (!copiedSuccessfully) {
      setCopyErrorMessage(buildExportDeckCopyErrorMessage(items.length));
      return;
    }
    setCopyErrorMessage(null);
    setCopied(true);
    scheduleYeonTimeout(() => setCopied(false), 2000);
  };

  return (
    <ResponsiveModal
      title="내보내기"
      description="복사 후 AI에 붙여넣어 카드를 수정·보완하세요. 텍스트 선택 영역과 드래그 영역이 충돌하지 않도록 정리했습니다."
      onClose={onClose}
      widthClassName="max-w-[720px]"
    >
      <YeonView className="select-none">
        <YeonField
          as="textarea"
          readOnly
          value={text}
          rows={14}
          aria-label="내보내기 텍스트"
          draggable={false}
          className="mt-1 resize-none rounded-2xl bg-[#fafafa] px-4 py-3 font-mono text-[13px] leading-6 select-text md:text-[14px]"
        />

        {copyErrorMessage ? (
          <YeonText
            as="p"
            variant="caption"
            tone="primary"
            className="mt-3 font-semibold"
          >
            {copyErrorMessage}
          </YeonText>
        ) : null}

        <YeonView className={SHARED_FEATURE_CLASS.alignBetweenGap3WithMargin4}>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={`${SHARED_FEATURE_CLASS.text13Soft} md:text-[14px]`}
          >
            총 {items.length}장
          </YeonText>
          <YeonButton
            type="button"
            onClick={handleCopy}
            variant="primary"
            size="lg"
            className="rounded-2xl px-4 py-3 text-[14px]"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </YeonButton>
        </YeonView>
      </YeonView>
    </ResponsiveModal>
  );
}
