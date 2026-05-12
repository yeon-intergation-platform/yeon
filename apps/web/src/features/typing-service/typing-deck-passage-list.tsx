"use client";

import { YeonButton, YeonSurface } from "@/components/yeon-ui";
import {
  type TypingDeckPassageDto,
  useDeleteTypingDeckPassage,
} from "./use-typing-decks";

export type TypingDeckPassageListProps = {
  deckId: string;
  passages: TypingDeckPassageDto[];
  onEdit: (passage: TypingDeckPassageDto) => void;
  readonly: boolean;
  adminMode?: boolean;
};

export function TypingDeckPassageList({
  deckId,
  passages,
  onEdit,
  readonly,
  adminMode = false,
}: TypingDeckPassageListProps) {
  const deletePassage = useDeleteTypingDeckPassage(deckId, adminMode);

  if (passages.length === 0) {
    return (
      <YeonSurface variant="empty" className="p-8">
        <p className="text-[14px] font-semibold text-[#111]">
          아직 문단이 없습니다.
        </p>
        {!readonly ? (
          <p className="mt-2 text-[13px] text-[#666]">
            직접 추가하거나 AI 붙여넣기로 여러 문단을 넣어보세요.
          </p>
        ) : null}
      </YeonSurface>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {passages.map((passage, index) => (
        <YeonSurface as="li" key={passage.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#888]">
                문단 {index + 1}
              </p>
              <h4 className="mt-1 text-[15px] font-semibold text-[#111]">
                {passage.title || "제목 없음"}
              </h4>
            </div>
            {!readonly ? (
              <div className="flex shrink-0 gap-2">
                <YeonButton
                  type="button"
                  onClick={() => onEdit(passage)}
                  size="sm"
                >
                  수정
                </YeonButton>
                <YeonButton
                  type="button"
                  onClick={() => deletePassage.mutate(passage.id)}
                  variant="danger"
                  size="sm"
                >
                  삭제
                </YeonButton>
              </div>
            ) : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#555]">
            {passage.prompt}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#777]">
            <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
              {passage.textType}
            </span>
            <span className="rounded-full border border-[#e5e5e5] px-2 py-0.5">
              {passage.difficulty}
            </span>
          </div>
          {deletePassage.error ? (
            <p className="mt-2 text-[12px] text-red-600">
              {deletePassage.error.message}
            </p>
          ) : null}
        </YeonSurface>
      ))}
    </ul>
  );
}
