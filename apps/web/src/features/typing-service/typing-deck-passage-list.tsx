"use client";
import {
  YeonButton,
  YeonSurface,
  YeonList,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
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
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis}
        >
          아직 문단이 없습니다.
        </YeonText>
        {!readonly ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-2 ${SHARED_FEATURE_CLASS.text13Neutral}`}
          >
            직접 추가하거나 AI 붙여넣기로 여러 문단을 넣어보세요.
          </YeonText>
        ) : null}
      </YeonSurface>
    );
  }

  return (
    <YeonList className="flex flex-col gap-3">
      {passages.map((passage, index) => (
        <YeonSurface as="li" key={passage.id} className="p-4">
          <YeonView className={SHARED_FEATURE_CLASS.alignBetweenStartGap3}>
            <YeonView>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="text-[12px] font-semibold text-[#aaa]"
              >
                문단 {index + 1}
              </YeonText>
              <YeonText
                as="h4"
                variant="unstyled"
                tone="inherit"
                className={`mt-1 ${TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis15}`}
              >
                {passage.title || "제목 없음"}
              </YeonText>
            </YeonView>
            {!readonly ? (
              <YeonView className="flex shrink-0 gap-2">
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
              </YeonView>
            ) : null}
          </YeonView>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#666]"
          >
            {passage.prompt}
          </YeonText>
          <YeonView
            className={`mt-3 flex flex-wrap gap-2 ${SHARED_FEATURE_CLASS.text12Subtle}`}
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.tagPill}
            >
              {passage.textType}
            </YeonText>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.tagPill}
            >
              {passage.difficulty}
            </YeonText>
          </YeonView>
          {deletePassage.error ? (
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 text-[12px] text-[#666]"
            >
              {deletePassage.error.message}
            </YeonText>
          ) : null}
        </YeonSurface>
      ))}
    </YeonList>
  );
}
