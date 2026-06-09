import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import { memo, useCallback } from "react";
import { YeonEditableCardRow as EditableCardRow } from "@yeon/ui/native";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { CardMarkdown } from "./card-markdown";

type DeckCardRowProps = {
  item: CardDeckItemDto;
  index: number;
  isBusy: boolean;
  isMenuOpen: boolean;
  onDelete: (itemId: string) => void;
  onEdit: (item: CardDeckItemDto) => void;
  onToggleMenu: (itemId: string) => void;
};

// 한 카드의 메뉴 토글이 다른 카드(특히 CardMarkdown)까지 리렌더하지 않도록 row 렌더링 책임을 분리한다.
export const DeckCardRow = memo(function DeckCardRow({
  item,
  index,
  isBusy,
  isMenuOpen,
  onDelete,
  onEdit,
  onToggleMenu,
}: DeckCardRowProps) {
  const handleDelete = useCallback(
    () => onDelete(item.id),
    [onDelete, item.id]
  );
  const handleEdit = useCallback(() => onEdit(item), [onEdit, item]);
  const handleToggleMenu = useCallback(
    () => onToggleMenu(item.id),
    [onToggleMenu, item.id]
  );

  return (
    <EditableCardRow
      answerLabel={CARD_SERVICE_TEXT.detail.answerLabel}
      answerText={item.backText}
      answerContent={<CardMarkdown source={item.backText} />}
      questionContent={<CardMarkdown source={item.frontText} />}
      deleteLabel={CARD_SERVICE_TEXT.shared.deleteLabel}
      editLabel={CARD_SERVICE_TEXT.shared.editLabel}
      index={index}
      isBusy={isBusy}
      isMenuOpen={isMenuOpen}
      menuAccessibilityLabel={CARD_SERVICE_TEXT.shared.openCardMenuLabel}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onToggleMenu={handleToggleMenu}
      openAccessibilityLabel={`${CARD_SERVICE_TEXT.shared.openCardLabel}: ${item.frontText}`}
      questionLabel={CARD_SERVICE_TEXT.detail.questionLabel}
      questionText={item.frontText}
    />
  );
});
