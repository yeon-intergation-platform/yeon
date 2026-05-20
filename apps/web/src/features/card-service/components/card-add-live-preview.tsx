"use client";

import { CardPreviewSurface } from "./card-rich-markdown-editor-view";

interface CardAddLivePreviewProps {
  frontText: string;
  backText: string;
}

function CardFacePreview({
  label,
  title,
  value,
  emptyText,
}: {
  label: string;
  title: string;
  value: string;
  emptyText: string;
}) {
  return (
    <CardPreviewSurface
      title={title}
      eyebrow={
        <span className="rounded-full border border-[#e2e2e2] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#777]">
          {label}
        </span>
      }
      value={value}
      emptyText={emptyText}
      containerClassName="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-[#e8e8e8] bg-white shadow-[0_12px_36px_rgba(17,17,17,0.06)]"
      headerClassName="flex items-center justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-4 py-3"
      bodyClassName="min-h-[130px] flex-1 overflow-y-auto px-4 py-4 text-[14px] leading-7 text-[#111] md:min-h-[160px]"
    />
  );
}

export function CardAddLivePreview({
  frontText,
  backText,
}: CardAddLivePreviewProps) {
  return (
    <aside className="hidden min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#ececec] bg-[#f8f8f8] p-4 lg:flex lg:h-full">
      <div className="mb-4">
        <p className="text-[15px] font-semibold text-[#111]">
          실시간 카드 미리보기
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[#777]">
          작성한 마크다운과 이미지를 실제 카드 앞면/뒷면처럼 바로 확인합니다.
        </p>
      </div>
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
        <CardFacePreview
          label="앞면"
          title="카드 질문"
          value={frontText}
          emptyText="질문을 작성하면 카드 앞면에 표시됩니다."
        />
        <CardFacePreview
          label="뒷면"
          title="카드 답변 / 본문"
          value={backText}
          emptyText="답변을 작성하면 카드 뒷면에 표시됩니다."
        />
      </div>
    </aside>
  );
}
