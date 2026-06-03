import { type ReactNode, useState } from "react";

import {
  YeonButton,
  type YeonButtonProps,
} from "../../primitives/YeonButton/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import {
  YeonView,
  type YeonViewProps,
} from "../../primitives/YeonView/index.native";
import {
  createYeonStyleSheet,
  type YeonGestureResponderEvent,
} from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonEditableCardRowProps = {
  answerLabel: string;
  // content 제공 시 옵셔널(스크린리더 접근성 라벨로 활용). 미제공 시 평문 렌더에 필수.
  answerText?: string;
  // 제공되면 평문 대신 렌더(예: 마크다운). 미제공 시 questionText/answerText 평문.
  questionContent?: ReactNode;
  answerContent?: ReactNode;
  deleteLabel: string;
  editLabel: string;
  index: number | string;
  isBusy?: boolean;
  isMenuOpen?: boolean;
  menuAccessibilityLabel: string;
  onDelete: YeonButtonProps["onPress"];
  onEdit: YeonButtonProps["onPress"];
  onToggleMenu: YeonButtonProps["onPress"];
  openAccessibilityLabel: string;
  questionLabel: string;
  // content 제공 시 옵셔널(스크린리더 접근성 라벨로 활용). 미제공 시 평문 렌더에 필수.
  questionText?: string;
  style?: YeonViewProps["style"];
};

export function YeonEditableCardRow({
  answerLabel,
  answerText,
  answerContent,
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
  questionContent,
  style,
}: YeonEditableCardRowProps) {
  const [isDeleteRevealed, setDeleteRevealed] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  function handlePressIn(event: YeonGestureResponderEvent) {
    setStartX(event.nativeEvent.pageX);
  }

  function handlePressOut(event: YeonGestureResponderEvent) {
    if (startX === null) {
      return;
    }

    const deltaX = event.nativeEvent.pageX - startX;
    setStartX(null);

    if (deltaX < -42) {
      setDeleteRevealed(true);
      return;
    }

    if (deltaX > 24) {
      setDeleteRevealed(false);
    }
  }

  function handleOpen(event: YeonGestureResponderEvent) {
    if (isDeleteRevealed) {
      setDeleteRevealed(false);
      return;
    }
    onEdit?.(event);
  }

  return (
    <YeonView style={[styles.wrapper, style]}>
      <YeonView style={styles.deleteRail}>
        <YeonButton
          disabled={isBusy}
          onPress={onDelete}
          variant="ghost"
          style={styles.deleteButton}
        >
          <YeonText
            variant="unstyled"
            tone="inherit"
            style={styles.deleteButtonLabel}
          >
            {deleteLabel}
          </YeonText>
        </YeonButton>
      </YeonView>
      <YeonButton
        accessibilityLabel={openAccessibilityLabel}
        onPress={handleOpen}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isDeleteRevealed ? styles.cardRevealed : null]}
      >
        <YeonView style={styles.indexBox}>
          <YeonText variant="unstyled" tone="inherit" style={styles.indexText}>
            {index}
          </YeonText>
        </YeonView>
        <YeonView style={styles.content}>
          <YeonView style={styles.qaLine}>
            <YeonText variant="unstyled" tone="inherit" style={styles.qaBadge}>
              {questionLabel}
            </YeonText>
            {questionContent !== undefined ? (
              <YeonView style={styles.contentFill}>{questionContent}</YeonView>
            ) : (
              <YeonText
                variant="unstyled"
                tone="inherit"
                style={styles.questionText}
              >
                {questionText ?? ""}
              </YeonText>
            )}
          </YeonView>
          <YeonView style={styles.qaLine}>
            <YeonText variant="unstyled" tone="inherit" style={styles.qaBadge}>
              {answerLabel}
            </YeonText>
            {answerContent !== undefined ? (
              <YeonView style={styles.contentFill}>{answerContent}</YeonView>
            ) : (
              <YeonText
                variant="unstyled"
                tone="inherit"
                style={styles.answerText}
              >
                {answerText ?? ""}
              </YeonText>
            )}
          </YeonView>
        </YeonView>
        <YeonButton
          accessibilityLabel={menuAccessibilityLabel}
          onPress={(event) => {
            event.stopPropagation();
            onToggleMenu?.(event);
          }}
          size="icon"
          variant="icon"
          style={styles.moreButton}
        >
          <YeonText
            variant="unstyled"
            tone="inherit"
            style={styles.moreButtonText}
          >
            ⋮
          </YeonText>
        </YeonButton>
      </YeonButton>
      {isMenuOpen ? (
        <YeonView style={styles.menu}>
          <YeonButton
            accessibilityLabel={editLabel}
            onPress={onEdit}
            variant="secondary"
            style={styles.menuButton}
          >
            <YeonText variant="unstyled" tone="inherit" style={styles.menuText}>
              {editLabel}
            </YeonText>
          </YeonButton>
          <YeonButton
            accessibilityLabel={deleteLabel}
            disabled={isBusy}
            onPress={onDelete}
            variant="danger"
            style={styles.menuButton}
          >
            <YeonText
              variant="unstyled"
              tone="inherit"
              style={styles.menuDangerText}
            >
              {deleteLabel}
            </YeonText>
          </YeonButton>
        </YeonView>
      ) : null}
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  answerText: {
    color: yeonMobileAppColors.textMuted,
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
  },
  card: {
    alignItems: "stretch",
    backgroundColor: yeonMobileAppColors.white,
    borderColor: yeonMobileAppColors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 92,
    overflow: "hidden",
    transform: [{ translateX: 0 }],
  },
  cardRevealed: {
    transform: [{ translateX: -88 }],
  },
  content: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contentFill: {
    flex: 1,
    minWidth: 0,
  },
  deleteButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  deleteButtonLabel: {
    color: yeonMobileAppColors.danger,
    fontSize: 14,
    fontWeight: "900",
  },
  deleteRail: {
    backgroundColor: yeonMobileAppColors.surface,
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: 88,
  },
  indexBox: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRightColor: yeonMobileAppColors.border,
    borderRightWidth: 1,
    justifyContent: "center",
    width: 58,
  },
  indexText: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "500",
  },
  menu: {
    alignSelf: "flex-end",
    backgroundColor: yeonMobileAppColors.white,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 8,
    overflow: "hidden",
  },
  menuButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuDangerText: {
    color: yeonMobileAppColors.danger,
    fontSize: 14,
    fontWeight: "800",
  },
  menuText: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  moreButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  moreButtonText: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 28,
    lineHeight: 30,
  },
  qaBadge: {
    borderColor: yeonMobileAppColors.borderStrong,
    borderRadius: 7,
    borderWidth: 1,
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  qaLine: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    minWidth: 0,
  },
  questionText: {
    color: yeonMobileAppColors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  wrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
});
