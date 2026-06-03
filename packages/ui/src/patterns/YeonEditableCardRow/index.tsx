import { memo } from "react";

import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";
import { joinClassNames } from "../../utils";

export type YeonEditableCardRowProps = {
  answerLabel: string;
  answerText: string;
  className?: string;
  deleteLabel: string;
  editLabel: string;
  index: number | string;
  isBusy?: boolean;
  isMenuOpen?: boolean;
  menuAccessibilityLabel?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onToggleMenu?: () => void;
  openAccessibilityLabel?: string;
  questionLabel: string;
  questionText: string;
};

export const YeonEditableCardRow = memo(function YeonEditableCardRow({
  answerLabel,
  answerText,
  className,
  deleteLabel,
  editLabel,
  index,
  isBusy = false,
  isMenuOpen = false,
  menuAccessibilityLabel,
  onDelete,
  onEdit,
  onToggleMenu,
  openAccessibilityLabel,
  questionLabel,
  questionText,
}: YeonEditableCardRowProps) {
  return (
    <YeonView className={joinClassNames("grid gap-2", className)}>
      <YeonView className="flex min-h-[92px] items-stretch overflow-hidden rounded-xl border border-[#e5e5e5] bg-white">
        <YeonButton
          aria-label={openAccessibilityLabel}
          onClick={onEdit}
          variant="secondary"
          className="flex flex-1 items-stretch p-0 text-left"
        >
          <YeonView className="flex w-[58px] items-center justify-center border-r border-[#e5e5e5]">
            <YeonText className="text-[18px] font-medium text-[#111]">
              {index}
            </YeonText>
          </YeonView>
          <YeonView className="grid min-w-0 flex-1 gap-2.5 px-4 py-3.5">
            <YeonView className="flex min-w-0 items-start gap-3">
              <YeonText className="rounded-[7px] border border-[#e5e5e5] px-2 py-[3px] text-[14px] font-semibold text-[#111]">
                {questionLabel}
              </YeonText>
              <YeonText className="flex-1 text-[16px] font-medium leading-6 text-[#111]">
                {questionText}
              </YeonText>
            </YeonView>
            <YeonView className="flex min-w-0 items-start gap-3">
              <YeonText className="rounded-[7px] border border-[#e5e5e5] px-2 py-[3px] text-[14px] font-semibold text-[#111]">
                {answerLabel}
              </YeonText>
              <YeonText className="flex-1 text-[16px] leading-[23px] text-[#666]">
                {answerText}
              </YeonText>
            </YeonView>
          </YeonView>
        </YeonButton>
        <YeonButton
          aria-label={menuAccessibilityLabel}
          onClick={onToggleMenu}
          variant="icon"
          className="px-3 text-[28px] leading-none text-[#666]"
        >
          ⋮
        </YeonButton>
      </YeonView>
      {isMenuOpen ? (
        <YeonView className="ml-auto flex overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white">
          <YeonButton
            aria-label={editLabel}
            onClick={onEdit}
            variant="secondary"
            className="px-4 py-2.5 text-[14px] font-extrabold text-[#111]"
          >
            {editLabel}
          </YeonButton>
          <YeonButton
            aria-label={deleteLabel}
            disabled={isBusy}
            onClick={onDelete}
            variant="danger"
            className="px-4 py-2.5 text-[14px] font-extrabold text-[#111]"
          >
            {deleteLabel}
          </YeonButton>
        </YeonView>
      ) : null}
    </YeonView>
  );
});
